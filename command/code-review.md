---
description: Review the current diff or a target path for correctness, security, quality, and missing tests.
---

# /code-review

Target: $ARGUMENTS

Default target is the current uncommitted diff. If the input is a path, review that path. If it is a PR number, fetch the diff with `gh pr diff`.

1. Collect context: `git status`, `git diff` (or the given target), recent commits, and the affected tests.
2. Delegate to `code-reviewer`. If the change involves SQL/schema, also run `database-reviewer`; if it is primarily TypeScript, `typescript-reviewer`; Python, `python-reviewer`. Run independent reviews in parallel.
3. Merge findings, de-duplicate, and rank by severity: blocker / should-fix / nit.
4. Every finding must include `file:line`, the concrete failure mode, and a suggested fix.
5. End with a verdict: APPROVE, APPROVE WITH FIXES, or REQUEST CHANGES.

Do not edit files during review unless the user explicitly asks you to apply the fixes. Do not invent issues; if the diff is clean, say so.
