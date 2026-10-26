---
description: Map the current repository with evidence and report stack, entry points, commands, conventions, and hot spots.
agent: repo-cartographer
---

# /recon

Target: $ARGUMENTS (default: the whole repository at the current working directory)

Load the `codebase-recon` skill and follow it. Read only until you can produce the brief below.

Return:

```
Stack:        <language + runtime + framework with versions, and where you saw them>
Entry:        <file:line>
Flow:         <main request/data path with file:line at each hop>
Data:         <driver, schema path, migration tool>
Commands:     install / dev / build / typecheck / lint / test / e2e (copy-pasteable)
Conventions:  3-5 rules the code enforces, each with one example
Hot spots:    <file> (n commits in 90 days)
Risks:        <what will bite an editor here>
Unknowns:     <not verified>
```

Rules: cite evidence for every claim, do not edit files, do not review quality, keep it under 25 lines.
