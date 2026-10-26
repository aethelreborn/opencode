---
description: Find dead code, duplicates, and over-engineering, then remove it safely with verification.
---

# /refactor-clean

Scope: $ARGUMENTS

Default scope is the current repo or the changed area if a task is active.

1. Detect available analyzers (knip, ts-prune, depcheck, vulture, staticcheck, etc.). Do not install heavy tools without need.
2. Delegate to `refactor-cleaner` for an inventory:
   - unused files, exports, dependencies, types, and functions
   - duplicated logic that should be consolidated
   - speculative abstractions with one caller
3. Classify each item: SAFE TO DELETE / VERIFY FIRST / KEEP (public API, dynamic import, framework convention).
4. Remove in small batches. After each batch run typecheck, lint, and tests.
5. Report deletions with evidence (references searched, commands run). Never remove public API, migrations, or dynamically loaded code without checking usage.

Prefer deleting code over adding abstraction. Stop if a deletion breaks behavior.
