---
description: Debug a failure systematically — reproduce, isolate, prove the cause, fix, and add a regression test.
agent: systematic-debugger
---

# /debug

Symptom: $ARGUMENTS

If the symptom is empty, derive it from the current failing command or the last error in the conversation, and state it explicitly.

Follow the debugger method:

1. State the observation precisely: input, command, environment, expected vs actual.
2. Reproduce reliably. If intermittent, quantify the rate and find the controlling variable.
3. Isolate layer by layer with one probe per hypothesis. Record eliminated hypotheses.
4. Prove the cause with a prediction, then test it.
5. Apply the smallest fix that removes the failure mode.
6. Add a regression test and prove it fails on the pre-fix code (`git stash`).
7. Search for sibling occurrences of the same pattern.

Report: observation, repro, cause with `file:line`, evidence, fix, regression test result, siblings. Do not silence errors, add retries, or change multiple things at once.
