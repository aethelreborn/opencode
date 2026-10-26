---
description: Restate requirements, surface risks, and produce a step-by-step plan. Waits for approval before any edits.
---

# /plan

Input: $ARGUMENTS

If the input is empty, ask what should be planned. If it is a path to a PRD or spec, read it first.

1. Restate the goal in 1-3 sentences, plus explicit success criteria.
2. Inspect the codebase (read-only): relevant files, existing patterns, build/test commands.
3. Delegate to the `planner` subagent with the task tool. Give it the restated goal, constraints, and everything you learned. Ask for phases, files to touch, dependencies, risks, and verification steps.
4. Sanity-check the returned plan against the actual code. Flag anything that does not match reality.
5. Present a compact plan:

```
## Goal
## Assumptions
## Risks
## Steps
1. [file/path] action — verification
## Verification
## Open questions
```

6. STOP and wait for explicit user confirmation. Do not edit files until approved.

Use `architect` instead when the request is primarily system design, a new service, a migration, or a cross-cutting refactor.
