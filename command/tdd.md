---
description: Test-driven development loop for a feature or bug fix. Failing test first, then minimal implementation.
---

# /tdd

Target: $ARGUMENTS

If no target is given, infer the current task from the conversation; ask only if genuinely ambiguous.

1. Read the existing test setup (framework, commands, fixtures, conventions). Never invent a new test stack.
2. Delegate to the `tdd-guide` subagent. Require this order:
   - Write the smallest failing test that encodes the requested behavior.
   - Run it and show the failure output.
   - Implement the minimal change to pass.
   - Run the focused test, then the full suite.
   - Refactor only while green.
3. Verify the test actually fails for the right reason (assertion, not import/typo).
4. Report: test added, implementation summary, commands run with results, coverage impact if available.

Do not write production code before the failing test exists. If the project has no test harness, add the lightest one that fits and say so.
