import type { Plugin } from "@opencode-ai/plugin"
import { basename, extname, resolve } from "node:path"
import { statSync } from "node:fs"

const SKIP_DIRS = ["node_modules", ".git", "dist", "build", "coverage", "vendor", ".venv", "venv", "target", ".next", ".turbo"]
const PRETTIER_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".jsonc", ".css", ".scss", ".md", ".mdx", ".yaml", ".yml", ".html", ".vue", ".svelte"])

function exists(path: string): boolean {
  try {
    return statSync(path).isFile()
  } catch {
    return false
  }
}

function isSkipped(path: string): boolean {
  const parts = path.split("/")
  return parts.some((part) => SKIP_DIRS.includes(part))
}

async function run(cmd: string[], cwd: string, timeoutMs = 10000): Promise<boolean> {
  try {
    const proc = Bun.spawn(cmd, { cwd, stdout: "ignore", stderr: "ignore", stdin: "ignore" })
    const timer = setTimeout(() => proc.kill(), timeoutMs)
    const code = await proc.exited
    clearTimeout(timer)
    return code === 0
  } catch {
    return false
  }
}

export const HarnessPlugin: Plugin = async ({ directory, worktree }) => {
  const root = worktree && worktree !== "/" ? worktree : directory
  const notify = Bun.which("notify-send")
  const gofmt = Bun.which("gofmt")
  const rustfmt = Bun.which("rustfmt")
  const prettierGlobal = Bun.which("prettier")
  const ruffGlobal = Bun.which("ruff")
  const prettierLocal = resolve(root, "node_modules/.bin/prettier")
  const ruffLocal = [resolve(root, ".venv/bin/ruff"), resolve(root, "venv/bin/ruff")].find(exists)

  async function formatFile(filePath: string) {
    const abs = filePath.startsWith("/") ? filePath : resolve(directory, filePath)
    if (!exists(abs) || isSkipped(abs)) return
    const ext = extname(abs).toLowerCase()

    if (PRETTIER_EXT.has(ext)) {
      const bin = exists(prettierLocal) ? prettierLocal : prettierGlobal
      if (bin) await run([bin, "--write", abs], root)
      return
    }
    if (ext === ".py") {
      const bin = ruffLocal || ruffGlobal
      if (bin) await run([bin, "format", abs], root)
      return
    }
    if (ext === ".go" && gofmt) {
      await run([gofmt, "-w", abs], root)
      return
    }
    if (ext === ".rs" && rustfmt) {
      await run([rustfmt, "--edition", "2021", abs], root)
    }
  }

  return {
    "tool.execute.after": async (input, output) => {
      if (input.tool !== "edit" && input.tool !== "write" && input.tool !== "patch") return
      const args = input.args ?? {}
      const filePath = input.tool === "patch" ? undefined : String(args.filePath ?? args.path ?? "")
      if (!filePath) return
      await formatFile(filePath)
    },

    event: async ({ event }) => {
      if (!notify) return
      if (event.type === "session.idle") {
        Bun.spawn([notify, "-a", "opencode", "-t", "4000", `opencode · ${basename(root)}`, "Session finished — ready for review."], {
          stdout: "ignore",
          stderr: "ignore",
        })
      }
      if (event.type === "session.error") {
        Bun.spawn([notify, "-a", "opencode", "-u", "critical", "-t", "8000", `opencode · ${basename(root)}`, "Session error — check the output."], {
          stdout: "ignore",
          stderr: "ignore",
        })
      }
    },

    "experimental.session.compacting": async (_input, output) => {
      output.context.push(
        "Preserve exactly: the current goal and success criteria, confirmed decisions and rejected alternatives, files changed and why, commands run with pass/fail results, unresolved risks, and the immediate next step. Drop chit-chat, superseded plans, and duplicated tool output.",
      )
    },
  }
}
