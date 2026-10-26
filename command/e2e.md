---
description: Generate or run end-to-end tests for a user flow, with artifacts and failure triage.
---

# /e2e

Flow: $ARGUMENTS

If no flow is given, inspect the app routes and propose the 3 most valuable critical-path flows, then test the first.

1. Detect the existing E2E stack (Playwright config, Cypress, etc.) and its conventions. Reuse it.
2. Delegate to `e2e-runner`:
   - write or update a test for the flow
   - run it against the local app
   - capture screenshots/traces on failure
   - distinguish product bugs from flaky test infrastructure
3. Verify the test fails without the feature/fix when feasible.
4. Report: test path, command, result, artifacts, and any real product bugs found.

Never silently retry a flaky test into a pass. Report flakiness explicitly.
