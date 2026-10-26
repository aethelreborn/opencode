---
description: Run the full verification loop and produce a PASS/FAIL report before claiming work is done.
---

# /verify

Scope: $ARGUMENTS (default: all uncommitted work)

Load the `verification-loop` skill and follow it. Do not skip phases because they are inconvenient.

1. Build / compile.
2. Typecheck (strict, no suppressed errors introduced).
3. Lint + format check.
4. Tests, with coverage when the project supports it.
5. Security grep: secrets, debug leftovers, dangerous patterns in the diff.
6. Diff review: unintended files, debug logs, TODOs, commented code, lockfile churn.

Rules:
- Run commands, do not simulate them. Paste the actual command and result.
- A failing check is a FAIL, even if it is unrelated; report it separately.
- Never claim "all tests pass" without the output.
- If a check cannot run, say why and mark it SKIPPED.

Output a table: phase | command | result | notes, then an overall verdict.
