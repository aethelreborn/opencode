---
description: Extract a durable lesson from this session and append it to the global LEARNINGS.md.
---

# /learn

Lesson: $ARGUMENTS

If no lesson is given, analyze the current session for a correction, surprising behavior, or user preference worth persisting.

1. Read `~/.config/opencode/LEARNINGS.md`.
2. Search it for an existing entry about the same topic. If it exists, refine it instead of duplicating.
3. Append a dated entry in this shape:

```markdown
## YYYY-MM-DD — <short title>
- Trigger: when this applies
- Rule: what to do
- Evidence: command/error/file that proved it
```

4. Keep it short and actionable. No session diary, no secrets, no one-off details.
5. Confirm the entry added.

Only record lessons that generalize to future sessions.
