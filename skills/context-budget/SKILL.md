---
name: context-budget
description: Use when starting a long task, when a session feels forgetful or slow, before reading large files, or when deciding whether to delegate. Keeps the context window spent on decisions instead of dumps, with concrete read, grep, and delegation rules.
---

# Context Budget

Context is the scarcest resource in an agent session. Every full file read, verbose command output, and duplicated log line displaces reasoning capacity. Spend deliberately.

## Rules of engagement

1. **Grep before read.** Locate the relevant 40 lines before opening a 2,000-line file. Use `rg -n 'symbol'`, then read a window around the hit.
2. **Read windows, not files.** `read` with an offset/limit near the match. Re-read only when the earlier window is demonstrably insufficient.
3. **Never re-read to re-check.** If you already read it this session, trust it; if a change happened, `git diff` the file instead of reading it whole.
4. **Cap command output at the source.** Pipe through `head`, `tail`, `rg -c`, `--quiet`, `jq -c`. Prefer `pytest -q -x --tb=short` over full tracebacks.
5. **Summarize before you move on.** After a large investigation, write 5 bullets: goal, facts established (file:line), decisions, next step, open questions. That summary is what survives compaction.
6. **Offload noise.** Anything that will produce a lot of throwaway output (searching a dependency's source, surveying 30 files, browser flows) belongs in a subagent; it returns a short brief, not the transcript.
7. **Restart on tangents.** If the task changed, start a fresh session with a tight prompt instead of dragging 100k tokens of unrelated history.

## Choosing the cheap path

| Question | Cheap answer | Expensive answer (only when needed) |
|---|---|---|
| Where is X defined? | `rg -n 'def X\|function X\|class X'` | read the whole module |
| How does the app boot? | read the entry file + router registration | run the app and inspect logs |
| What changed? | `git diff --stat`, then per-file diff | full `git log -p` |
| Does it work? | the single focused test | the full suite (still run it before finishing) |
| What does this dependency do? | its types/`.d.ts` + one usage site | vendored source dive |
| Why did CI fail? | the failing step's log tail | rerunning everything |

## Output discipline

```bash
# structured, bounded
rg -n 'pattern' src | head -40
git diff --stat
npm test -- --reporter=dot 2>&1 | tail -30
jq -r '.[] | "\(.name) \(.status)"' report.json
```

Avoid: `cat` on lockfiles, `npm install` logs, full test matrices in one call, `curl` without `-s`, and dumping a whole HTML page into context when `curl -s url | sed -n '1,80p'` or markitdown answers the question.

## Delegation triggers

Delegate when **all three** hold: the work is bounded, it needs many reads, and you only need the conclusion. Include in the brief: paths in scope, the exact question, the output shape (≤15 lines), and the read-only constraint. Never delegate a task whose value is in the ambient detail you already hold.

## Exit criteria

Before a large implementation step, you should be able to restate: the goal in one sentence, the 3-6 files that matter, the command that proves correctness, and the risk. If you cannot, gather the missing facts — narrowly — before writing code.
