# Sources and provenance

All prompt text and agent/command definitions in this directory are derived from Anthropic's official Claude Code distribution. Adapted copies live outside this directory (`../../agent/official-*`, `../../command/official-*`, `../../agent/claude.md`); this directory preserves the originals for reference.

## Versions

- Claude Code binary: `@anthropic-ai/claude-code@2.1.310`
- Claude Agent SDK: `@anthropic-ai/claude-agent-sdk@0.3.310`
- Official repository commit: `318b7e6ac4e726e88a4ad326214866a93c373b1b` (`anthropics/claude-code`)
- Retrieved: 2026-10-24

## System prompts

- `system-prompt.md` — assembled from the exact prompt fragments embedded in the official `claude` binary (2.1.310):
  - Identity and URL rule: function `Sur` (binary offset 248957378).
  - `# System` bullets: function `wur` (248958318).
  - `# Doing tasks`: function `Tur` (248959451).
  - `# Executing actions with care`: function `vur` (248963519).
  - `# Using your tools`: function `Rur` (248967294).
  - `# Tone and style`: function `Aur` (248971794).
  - Security policy: `zJn` (242600688).
  - `# Environment`, `# Context management`, and the closing instruction are from the exact captured Agent SDK prompt.
  - The fragments are stored NUL-separated ASCII in the binary; they were decoded by stripping `\x00` bytes and decoding latin-1, not UTF-16.

- `agent-sdk-system-prompt.md` — complete captured system block from the official Agent SDK: billing header, SDK identity (`You are a Claude agent, built on Anthropic's Claude Agent SDK.`), and the 5,642-character agent prompt (`You are an agent working with the user toward their goals...`). Captured by starting the SDK with `systemPrompt: { type: "preset", preset: "claude_code" }`, pointing `ANTHROPIC_BASE_URL` at a local logging proxy, and recording the request body. The proxy returned HTTP 400 after logging so the API was never called.

- `cli-sdk-system-prompt.md` — system prompt captured from the official CLI with `--print` in a fresh config directory, routed through a logging proxy. This is the SDK/`--print` variant (5,661-character prompt body), not the full interactive prompt. The full interactive prompt was assembled from the binary fragments above.

- `subagent-system-prompt.md` — exact subagent prompt from the official binary (identity string at offset 248983004; notes at 249027245).

- `../../agent/claude.md` — generated copy of `system-prompt.md` with opencode frontmatter and tool names adapted for opencode, providing a selectable `claude` primary agent. Regenerate it if `system-prompt.md` changes.

## Agents

Verbatim copies under `agents/<plugin>/` from `anthropics/claude-code` `plugins/<plugin>/agents/`:

- `feature-dev`: `code-architect`, `code-explorer`, `code-reviewer`
- `pr-review-toolkit`: `code-reviewer`, `code-simplifier`, `comment-analyzer`, `pr-test-analyzer`, `silent-failure-hunter`, `type-design-analyzer`
- `plugin-dev`: `agent-creator`, `plugin-validator`, `skill-reviewer`
- `agent-sdk-dev`: `agent-sdk-verifier-py`, `agent-sdk-verifier-ts`
- `hookify`: `conversation-analyzer`

Adapted opencode agents are written as `../../agent/official-<plugin>-<agent>.md`. Frontmatter is regenerated for opencode (`mode: subagent`, permissions); the official generic subagent prompt (`subagent-system-prompt.md`) is prepended; bodies are otherwise preserved, with `CLAUDE.md` changed to `AGENTS.md` and tool-name references adjusted.

## Commands

Verbatim copies under `commands/<plugin>/` from `anthropics/claude-code` `plugins/<plugin>/commands/`:

- `feature-dev`: `feature-dev`
- `code-review`: `code-review`
- `commit-commands`: `commit`, `commit-push-pr`, `clean_gone`
- `pr-review-toolkit`: `review-pr`
- `agent-sdk-dev`: `new-sdk-app`
- `plugin-dev`: `create-plugin`
- `hookify`: `configure`, `help`, `hookify`, `list`
- `ralph-wiggum`: `cancel-ralph`, `help`, `ralph-loop`

Adapted commands are written as `../../command/official-*.md`. `commit` and `commit-push-pr` were rewritten because their `!` context-injection syntax is Claude Code-specific. `hookify` and `ralph-wiggum` remain verbatim only: they depend on Claude Code's hook protocol and are not active opencode commands.

## Skills

Verbatim official plugin skills under `skills/`:

- `plugin-dev`: `agent-development`, `command-development`, `hook-development`, `mcp-integration`, `plugin-settings`, `plugin-structure`, `skill-development`
- `hookify`: `writing-rules`
- `claude-opus-4-5-migration`: `claude-opus-4-5-migration`
- `frontend-design`: `frontend-design` (already installed globally; preserved here for reference)

Installed copies live in `~/.claude/skills/`. Their frontmatter `name` values were normalized to the lowercase folder slugs required by opencode.

## Docs

`docs/` contains the official documentation markdown downloaded from `https://code.claude.com/docs/en/*.md` plus `llms.txt`.
