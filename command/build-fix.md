---
description: Diagnose and fix build, typecheck, or lint failures with the smallest correct change.
---

# /build-fix

Failure context: $ARGUMENTS

1. Reproduce the failure first. Run the project's build/typecheck command and capture the real error. Do not guess the command; detect it from package.json, Makefile, Cargo.toml, pyproject.toml, go.mod, etc.
2. Delegate to `build-error-resolver` with the exact command and error output.
3. Fix root causes, not symptoms:
   - no `any`/`@ts-ignore`/`# type: ignore`/`unsafe` unless unavoidable and justified
   - no deleting tests or weakening assertions to go green
   - no broad refactors while fixing a build
4. Re-run the failed command, then lint and the focused tests.
5. Report: root cause, files changed, commands + results.

If the same fix fails twice, stop and escalate with the evidence instead of thrashing.
