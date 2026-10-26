---
description: Break a complex task into parallel workstreams and execute them with the right subagents.
---

# /orchestrate

Task: $ARGUMENTS

If empty, use the current conversation's active task.

1. Use the `planner` subagent to produce a step plan and a dependency graph.
2. Split work into streams that can run independently. Keep writes disjoint: never let two agents edit the same file concurrently.
3. Map streams to subagents:
   - design/architecture → `architect`
   - tests → `tdd-guide` or `e2e-runner`
   - implementation → do it yourself or `build-error-resolver` for fixes
   - verification → `code-reviewer`, `security-reviewer`, language reviewers
4. Execute independent streams in parallel with the task tool. Include full context in every prompt: goal, files, constraints, expected output, and what not to touch.
5. Integrate results yourself. Run typecheck, lint, and tests after merging streams.
6. Report what each stream did, conflicts resolved, and final verification output.

Stop and ask before destructive or irreversible actions. Do not claim success without command evidence.
