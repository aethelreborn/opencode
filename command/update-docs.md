---
description: Update READMEs, guides, and codemaps to match the current code.
---

# /update-docs

Scope: $ARGUMENTS

1. Determine what changed (`git diff`, recent commits) and which docs are now stale.
2. Delegate to `doc-updater`. It should:
   - update README/setup/usage sections that are now wrong
   - generate or refresh codemaps under `docs/CODEMAPS/` (architecture, entry points, data flow, key modules)
   - fix examples and commands that no longer run
3. Keep docs concise and factual. No marketing language, no invented features.
4. Verify every command you put in docs actually works, or mark it as unverified.
5. Report files updated and anything you could not verify.

Do not create new docs unless they replace something stale or the user asked for them.
