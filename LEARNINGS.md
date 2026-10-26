# Learnings

Durable rules extracted from real sessions. Appended by `/learn`; loaded into every session.

Keep entries short and actionable. Include a trigger, the rule, and the evidence that proved it. No secrets, no session diaries.

<!-- /learn appends below this line -->
- Official Claude Code 2.1.310 prompt fragments are NUL-separated ASCII, not UTF-16. Decode by removing `\x00` bytes, then latin-1. Exact captures and provenance: `~/.config/opencode/official/claude-code/SOURCES.md`.
- For any UI work, load `design-taste` and render it: screenshots at 1440×900 and 390×844, critique, fix hard fails and the top three issues, re-render, and re-score. No PASS below 8.5 or with any anti-slop hard fail.
- When the user has granted full autonomy (e.g. "do what u want", "u must be a good decision maker rather than depending on me"), decide and state the decision + rationale; never end a reply with a menu of questions. Ask only for genuinely irreversible or credential-gated choices. Evidence: Aethel session 2026-10-25, user rebuked closing clarifying questions after repeated autonomy grants.
- GitHub Actions run artifacts are not Release assets — they expire (~90 days) and hide on the run page. When someone asks "where are the binaries/releases", publish with `gh release create <tag> <files>` (assets verified via `gh release view`). Evidence: Aethel 2026-10-25, builds were green for days but the Releases page was empty until v1.0.0 was cut.

- For static sites with continuous rAF animation, Chrome CLI `--headless=new --no-sandbox --virtual-time-budget=N` is more reliable than Playwright screenshots, which hang waiting for font/animation stability. Evidence: aethelsite 2026-10-26.
- Vercel deploys on push to master for aethelsite; verify live via `vercel ls` + DOM audit with headless Chromium, not just deploy status. Evidence: aethelsite 2026-10-26.
- Chromium sandbox is disabled in this container; always pass `--no-sandbox`. Evidence: aethelsite 2026-10-26.
- MCP servers pinned to `mcp<2` crash under MCP 2.x (`FastMCP` was renamed `MCPServer`): seen with `mcp-server-kubernetes` and `mcp-server-sqlite`. An npm/PyPI install succeeding proves nothing — verify with a real `initialize` + `tools/list` handshake. Evidence: opencode config work 2026-10-26, `scripts/mcp-probe.mjs`.
- opencode agents and commands are discovered relative to the config directory (`~/.config/opencode/agent`), not next to an arbitrary `opencode.jsonc`. To test a config repo before installing it, run `HOME=<tmp> XDG_CONFIG_HOME=<tmp>/.config opencode debug agent <name>` with the repo symlinked as `<tmp>/.config/opencode`. `skills.paths` does expand `~`. Evidence: same session.
