# opencode harness

A complete, verified [opencode](https://opencode.ai) configuration: 41 agents, 30 commands, 16 local skills plus the installed upstream packs, 13 handshake-tested MCP servers, hardened permissions, and one delivery loop that spans spec → implement → verify → ship.

This is not a fork of opencode. It is the config directory that opencode loads (`~/.config/opencode`), kept in git so it can be reviewed, diffed, and ported.

## Why this instead of the defaults

Most agent configs add tools and call it capability. This one adds *discipline*:

| Default behaviour | Here |
|---|---|
| Starts coding from the first message | `orchestrator` orients, writes acceptance criteria, then codes (`default_agent`) |
| "Done" after a successful build | Definition of done requires exercising the delivered behaviour and reporting command output |
| Silent test/lint suppression to get green | Explicitly forbidden; failures are reported, not hidden |
| `rm -rf` and force-push one keystroke away | Catastrophic command patterns are gated to `ask` while everything else runs autonomously |
| Dozens of MCP servers flooding the tool list | 13 verified servers enabled; 37 credential-gated ones cataloged and disabled
| Generic advice skills | Process skills with commands and exit criteria (`spec-driven-delivery`, `release-engineering`, `incident-response`, …) |
| Code only | A business track (`founder-operator`) for pricing, unit economics, launch, support, and legal readiness |

## Contents

```
opencode.jsonc          global config: default agent, permissions, skills, MCP catalog
AGENTS.md               the operating constitution loaded into every session
LEARNINGS.md            durable rules extracted from real sessions
agent/                  41 agents (9 new roles, 32 ported/kept)
command/                30 slash commands (6 new: /recon /spec /debug /audit /ship /founder)
skills/                 16 local skills written for this harness
plugins/harness.ts      formatter + desktop notifications + compaction context
official/claude-code/   verbatim Claude Code 2.1.310 prompts, agents, commands, docs
docs/MCP.md             every MCP server, its verification result, and how to enable it
scripts/validate.py     config + agent + command + skill linter
scripts/mcp-probe.mjs   real MCP handshake prober (stdio and HTTP)
```

### New agents

`orchestrator` (primary, default) · `repo-cartographer` · `systematic-debugger` · `test-strategist` · `release-manager` · `dependency-auditor` · `incident-commander` · `product-manager` · `founder-operator`

### New skills

Engineering: `codebase-recon` · `context-budget` · `spec-driven-delivery` · `test-strategy` · `release-engineering` · `dependency-supply-chain` · `api-evolution` · `observability-instrumentation` · `incident-response` · `performance-investigation`

Business: `product-discovery` · `pricing-packaging` · `unit-economics` · `gtm-launch` · `customer-support-ops` · `founder-legal-basics`

## Install

```bash
git clone https://github.com/aethelreborn/opencode.git ~/.config/opencode
cd ~/.config/opencode && npm install     # only needed for plugin types
opencode debug config                    # config must load with exit 0
opencode debug skill                     # skills must be listed
```

If you already have a config, move it aside first (`mv ~/.config/opencode ~/.config/opencode.bak`) rather than merging blindly. Quit and restart opencode after changes — config is loaded once at startup.

Requirements:

- opencode >= 1.19.4 (`opencode --version`)
- [bun](https://bun.sh) for `bunx`-based MCP servers (`@playwright/mcp`, `chrome-devtools-mcp`, `server-memory`, `server-sequential-thinking`, `repomix`)
- [uv](https://docs.astral.sh/uv/) for `uvx`-based MCP servers (`serena`, `mcp-server-git`, `mcp-server-fetch`, `duckduckgo-mcp-server`, `markitdown-mcp`, `mcp-server-time`)
- Chromium/Chrome for `chrome-devtools` — see machine-specific values below

### Machine-specific values

Three absolute paths in `opencode.jsonc` are tied to this machine:

| Key | Value | Replace with |
|---|---|---|
| `mcp.serena.command[0]` and other `uvx` entries | `/home/aethel/.local/bin/uvx` | `$(command -v uvx)` |
| `bunx` entries | `/home/aethel/.bun/bin/bunx` | `$(command -v bunx)` |
| `mcp.chrome-devtools` `--executablePath` | `/home/aethel/.local/bin/chrome-for-testing` | your Chrome binary, or `npx playwright install chromium` and point at it |
| `mcp.memory.environment.MEMORY_FILE_PATH` | `/home/aethel/.local/share/opencode/memory.json` | any writable path |

Everything else is portable.

## Verification (2026-10-26)

Results come from the scripts in this repo, not from documentation claims.

```bash
python3 scripts/validate.py      # config against the live JSON schema + every agent/command/skill
node scripts/mcp-probe.mjs --all # real initialize + tools/list handshake against every enabled server
opencode debug config            # exit 0, resolved config
opencode mcp list                # live status of every registered server
opencode debug skill             # lists skills the loader accepted
```

| Check | Result |
|---|---|
| `opencode debug config` | exit 0, valid config |
| Config vs live schema (`https://opencode.ai/config.json`) | all top-level keys and shapes valid |
| `opencode mcp list` | 13 `connected`, 37 `disabled`, 0 errors |
| `scripts/mcp-probe.mjs --all` | 13/13 handshakes; 95 tools from the 11 stdio servers, 2 remotes confirmed by initialize |
| `opencode debug skill` (install simulated with `HOME` redirected to the repo) | 16/16 local skills loaded, 91 total with upstream packs |
| `opencode debug agent <name>` (same install simulation) | all 9 new agents resolve with the intended mode; `orchestrator` is the primary default |
| Commands | every command parses, has a description, and every `agent:` reference resolves (static check — opencode exposes no CLI to enumerate commands) |
| Rejected MCP candidates | 7 failed for concrete reasons — listed in `docs/MCP.md` |

MCP verification detail, including the exact failure for each rejected server, is in [docs/MCP.md](docs/MCP.md).

## Model selection

The harness does not pin a model — pick per provider with `/models`. Guidance:

- **Default work** (edits, reviews, orchestration): a strong mid-tier coding model. The prompts are written to work with tool-calling models that follow structure.
- **Cheap subagents** (cartography, doc updates, dependency audits): a fast model; set `model:` in the agent frontmatter if your provider differs.
- **Hard problems** (architecture, gnarly debugging): the strongest reasoning model available.
- Set `small_model` only if your provider exposes a cheap model for titles/summaries (`experimental` and provider-specific).

## Honest limits

- An agent cannot run a company. The business skills produce the artifacts a founder needs — evidence logs, pricing models with sensitivity, launch plans, support SLAs, legal checklists — and explicitly hand legal, tax, and securities questions to a professional.
- Thirteen MCP servers cost tool-schema budget. Disable what you do not use; `docs/MCP.md` lists what each one buys you.
- The `official/` directory is derived from Anthropic's Claude Code distribution for reference and prompt porting. Provenance, versions, and extraction method are documented in `official/claude-code/SOURCES.md`. Third-party skill packs are not vendored here; they are loaded from `~/.claude/skills` and `~/.agents/skills`.
- Permission glob rules gate catastrophic patterns but are not a security sandbox.

## License

GPL-3.0 — see [LICENSE](LICENSE). Anthropic-derived material in `official/` retains its original attribution; see `official/claude-code/SOURCES.md`.
