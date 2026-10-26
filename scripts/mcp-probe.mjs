#!/usr/bin/env node
// Verifies a local stdio MCP server: spawn, initialize, tools/list, exit.
// Usage: node scripts/mcp-probe.mjs <json-config>   (config: {command:[], environment:{}})
//        node scripts/mcp-probe.mjs --all           (probe every local server in opencode.jsonc)
import { spawn } from "node:child_process"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const TIMEOUT_MS = Number(process.env.MCP_PROBE_TIMEOUT_MS ?? 90_000)

function probeRemote(name, url, headers = {}) {
  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "mcp-probe", version: "1.0.0" } },
  })
  return fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...headers,
    },
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
    .then(async (response) => {
      const text = await response.text()
      const line = text
        .split("\n")
        .map((entry) => entry.replace(/^data:\s*/, "").trim())
        .find((entry) => entry.startsWith("{"))
      if (!line) return { name, ok: false, note: `HTTP ${response.status} without JSON-RPC body`, tools: [] }
      const message = JSON.parse(line)
      if (message.error) return { name, ok: false, note: `HTTP ${response.status} error: ${JSON.stringify(message.error)}`, tools: [] }
      const server = message.result?.serverInfo
      return { name, ok: true, note: `HTTP ${response.status} serverInfo=${JSON.stringify(server)}`, tools: [] }
    })
    .catch((error) => ({ name, ok: false, note: `request failed: ${error.message}`, tools: [] }))
}

function probe(name, command, environment = {}) {
  return new Promise((done) => {
    const child = spawn(command[0], command.slice(1), {
      cwd: root,
      env: { ...process.env, ...environment },
      stdio: ["pipe", "pipe", "pipe"],
    })
    let buffer = ""
    let stderr = ""
    let settled = false
    const tools = []

    const finish = (ok, note) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      child.kill("SIGKILL")
      done({ name, ok, note, tools })
    }

    const send = (msg) => {
      child.stdin.write(JSON.stringify(msg) + "\n")
    }

    const handle = (msg) => {
      if (msg.id === 1) {
        if (msg.error) return finish(false, `initialize error: ${JSON.stringify(msg.error)}`)
        send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} })
        send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })
      }
      if (msg.id === 2) {
        if (msg.error) return finish(false, `tools/list error: ${JSON.stringify(msg.error)}`)
        for (const tool of msg.result?.tools ?? []) tools.push(tool.name)
        finish(true, `${tools.length} tools`)
      }
    }

    child.stdout.on("data", (chunk) => {
      buffer += chunk.toString("utf8")
      let index
      while ((index = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, index).trim()
        buffer = buffer.slice(index + 1)
        if (!line.startsWith("{")) continue
        try {
          handle(JSON.parse(line))
        } catch {}
      }
    })
    child.stderr.on("data", (chunk) => {
      stderr = (stderr + chunk.toString("utf8")).slice(-600)
    })
    child.on("error", (error) => finish(false, `spawn error: ${error.message}`))
    child.on("exit", (code) => {
      if (!settled) finish(false, `exited early (code ${code}) ${stderr.replace(/\s+/g, " ").trim()}`)
    })

    const timer = setTimeout(() => finish(false, `timeout after ${TIMEOUT_MS}ms ${stderr.replace(/\s+/g, " ").trim()}`), TIMEOUT_MS)

    send({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "mcp-probe", version: "1.0.0" },
      },
    })
  })
}

const target = process.argv[2]
if (!target) {
  console.error("usage: node scripts/mcp-probe.mjs <json-config> | --all")
  process.exit(2)
}

if (target === "--all") {
  const raw = readFileSync(resolve(root, "opencode.jsonc"), "utf8")
  const config = JSON.parse(raw.replace(/^\s*\/\/.*$/gm, ""))
  const jobs = Object.entries(config.mcp ?? {})
    .filter(([, server]) => server.enabled !== false)
    .map(([name, server]) =>
      server.type === "remote"
        ? () => probeRemote(name, server.url, server.headers)
        : () => probe(name, server.command, server.environment),
    )
  const results = []
  for (const job of jobs) results.push(await job())
  for (const result of results) {
    console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}  ${result.note}`)
    if (result.ok) console.log(`      ${result.tools.join(", ")}`)
  }
  process.exit(results.every((result) => result.ok) ? 0 : 1)
} else {
  const config = JSON.parse(target)
  const result = config.url
    ? await probeRemote("probe", config.url, config.headers)
    : await probe("probe", config.command, config.environment)
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.note}`)
  if (result.tools.length) console.log(result.tools.join(", "))
  process.exit(result.ok ? 0 : 1)
}
