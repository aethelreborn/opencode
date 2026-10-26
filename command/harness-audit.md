---
description: Audit the global opencode harness (config, agents, skills, plugins, MCP) and propose improvements.
---

# /harness-audit

1. Read the global config at `~/.config/opencode/opencode.jsonc` and list:
   - agents in `~/.config/opencode/agent/`
   - commands in `~/.config/opencode/command/`
   - plugins in `~/.config/opencode/plugin(s)/`
   - skills in `~/.claude/skills/` and `~/.config/opencode/skill(s)/`
   - MCP servers and their live status (`opencode mcp list`)
2. Check for:
   - invalid or dead config, MCP servers that fail to start
   - overlapping/duplicate agents or skills
   - permission rules that are too broad or ordered wrong (last match wins)
   - context bloat: skill descriptions, AGENTS.md length, references
   - missing verification or security coverage
3. Run `opencode debug config`, `opencode debug skill`, and `opencode debug agent` if available; report errors.
4. Produce a prioritized table: issue | impact | exact fix. Apply only low-risk fixes the user approves.

Do not remove existing user configuration without asking.
