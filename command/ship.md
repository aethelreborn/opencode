---
description: "Prepare and verify a release: gates, version, notes, artifact, and rollback plan. Does not push or publish without explicit authorization."
agent: release-manager
---

# /ship

Target: $ARGUMENTS (default: current HEAD, patch bump proposal)

Load the `release-engineering` skill.

1. Establish the baseline: clean tree, current tag, commits since tag, last releases.
2. Classify the bump from the diff and verify the project's release tooling agrees.
3. Run the gates in order with real output: clean install, typecheck, lint, tests, build, package dry-run.
4. Audit the artifact: version consistency, no secrets, no test fixtures or source maps leaking, migrations compatible with the previous release.
5. Draft release notes (Added / Fixed / Breaking / Upgrade) to `RELEASE_NOTES.md` and show the diff of that file.
6. State the exact publish commands and the rollback mechanism. Stop there unless the user has authorized publishing in this conversation.

Report: version, gates with results, artifact, notes path, publish status (PUBLISHED / AWAITING AUTHORIZATION), smoke plan, rollback plan, risks.
