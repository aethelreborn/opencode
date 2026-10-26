# MCP servers

Every entry below was checked against its real registry or host on **2026-10-26**. Enabled servers were additionally started and handshaken with `scripts/mcp-probe.mjs` (MCP `initialize` + `tools/list`).

## Enabled (13)

| Server | Transport | Tools | What it buys you |
|---|---|---|---|
| `context7` | remote `https://mcp.context7.com/mcp` | library docs | current API docs instead of model memory |
| `deepwiki` | remote `https://mcp.deepwiki.com/mcp` | repo Q&A | architecture answers for public repos |
| `serena` | local `uvx --from serena-agent serena start-mcp-server --context ide-assistant` | 3 | semantic symbol-level code navigation over LSP |
| `repomix` | local `bunx -y repomix@1.18.1 --mcp` | 6 | pack a repo into a bounded, greppable context artifact |
| `git` | local `uvx mcp-server-git --repository .` | 12 | status/diff/log/branch/commit without shell quoting |
| `fetch` | local `uvx mcp-server-fetch` | 1 | readable page extraction with markdown conversion |
| `duckduckgo` | local `uvx duckduckgo-mcp-server` | 3 | search when the built-in provider is unavailable |
| `markitdown` | local `uvx markitdown-mcp` | 1 | PDF/DOCX/XLSX/PPTX → markdown |
| `memory` | local `bunx -y @modelcontextprotocol/server-memory` | 9 | durable facts across sessions |
| `sequential-thinking` | local `bunx -y @modelcontextprotocol/server-sequential-thinking` | 1 | structured multi-step reasoning scratchpad |
| `playwright` | local `bunx -y @playwright/mcp@latest --headless` | 25 | real browser automation and DOM assertions |
| `chrome-devtools` | local `bunx -y chrome-devtools-mcp@latest --headless --isolated` | 32 | console, network, performance traces, Lighthouse |
| `time` | local `uvx mcp-server-time` | 2 | correct timezone-aware timestamps |

Handshake results: 13/13 connected. The 11 stdio servers listed 95 tools; the 2 remote servers validated over streamable HTTP (`serverInfo`: Context7 4.4.3, DeepWiki 2.14.3).

## Disabled catalog (37)

These are registered in `opencode.jsonc` with `"enabled": false`. Enable one by flipping the flag (and supplying its credentials or OAuth session). Each enabled server adds tool schemas to every request — enable what the task needs, not the whole list.

**Remote (23, OAuth or token):** `github`, `vercel`, `supabase`, `neon`, `sentry`, `linear`, `notion`, `stripe`, `slack`, `atlassian`, `postman`, `figma`, `canva`, `asana`, `datadog`, `grafana`, `render`, `heroku`, `cloudflare-docs`, `paypal`, `tavily`, `exa`, `firecrawl`

**Local (14, credentials or daemon):** `filesystem`, `postgres` (DBHub), `mongodb`, `qdrant`, `chroma`, `clickhouse`, `bigquery`, `snowflake`, `neo4j`, `aws-docs`, `cloud-run`, `shopify`, `azure`, `docker`

Environment variables used by the catalog: `GITHUB_TOKEN`, `DATABASE_URL`, `MONGODB_URI`, `QDRANT_URL`, `GOOGLE_CLOUD_PROJECT`, `SHOPIFY_ACCESS_TOKEN`, `MYSHOPIFY_DOMAIN`, `TAVILY_API_KEY`. Values support `{env:VAR}` interpolation.

## Rejected, with evidence

Candidates that did **not** make it into the config. Leaving a broken server registered wastes startup time and confuses the model's tool selection.

| Candidate | Result |
|---|---|
| `semgrep-mcp` 0.9.0 | process exits: `ImportError: cannot import name 'eval_type_backport' from 'pydantic._internal._typing_extra'`; also fails with `--with pydantic>=2.11` |
| `mcp-server-sqlite` 2025.4.25 | crashes on start: `AttributeError: 'Server' object has no attribute 'list_resources'` (MCP 2.x API change) |
| `mcp-server-kubernetes` 0.1.6 | crashes on start: `ModuleNotFoundError: No module named 'mcp.server.fastmcp'` (requires `mcp<2`) |
| `mcp-server-docker` 0.3.0 | `docker.errors.DockerException: Error while fetching server API version: PermissionError(13)` — no daemon access in this container |
| `mongodb-mcp-server` 3.1.0 | dependency resolution exceeded 150 s on three attempts; not reliable enough to enable |
| `@elastic/mcp-server-elasticsearch` 0.3.1 | npm marks it deprecated (`run v0.4.0 or later from the repo instead`) and startup fails schema validation |
| `mcp.snyk.io/mcp`, `mcp.huggingface.co/mcp` | DNS/connection failure (HTTP 000) at verification time |

Revisit these when the upstream packages catch up with MCP 2.x.

## Adding a server

```bash
opencode mcp add <name>        # interactive, writes to config
node scripts/mcp-probe.mjs '{"command":["npx","-y","pkg"]}'   # prove it starts
opencode mcp list              # status of every registered server
opencode mcp auth <name>       # OAuth flow for remote servers
```

Rules for this repo:

1. Prove the handshake before enabling. `scripts/mcp-probe.mjs` prints tool names and counts.
2. Pin versions for local servers (`pkg@1.2.3`) unless you want silent upgrades.
3. Prefer remote + OAuth over storing long-lived tokens in the config.
4. Never commit a literal secret — use `{env:VAR}` and document the variable here.
5. Record the verification result in this file when you change the set.
