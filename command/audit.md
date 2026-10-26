---
description: Audit dependencies, licenses, secrets, and supply-chain risk for this repository.
---

# /audit

Scope: $ARGUMENTS (default: whole repository)

Run, and paste real output for each:

1. Vulnerabilities: `npm audit --omit=dev`, `npx osv-scanner --lockfile=package-lock.json`, `pip-audit`, `govulncheck ./...`, `cargo audit` — whichever apply.
2. Licenses: `npx license-checker --production --onlyAllow 'MIT;ISC;Apache-2.0;BSD-2-Clause;BSD-3-Clause;0BSD'` (or `pip-licenses`, `cargo license`).
3. Unused: `npx depcheck`, `npx knip`, `uvx deptry .`, `go mod tidy` diff, `cargo machete`.
4. Secrets in the working tree and recent commits: `git grep -nE '(sk_live|ghp_|AKIA|BEGIN [A-Z ]*PRIVATE KEY)'` and `git log -20 -p | rg -nE '(sk_live|ghp_|AKIA)'`.
5. CI gates that should exist but do not (`--ignore-scripts`, `audit-level=high`, osv scanner).

For each finding: severity, package/version, reachability (is the vulnerable path actually called, with attacker-controlled input?), and the concrete action. Do not upgrade majors silently; propose the smallest safe change and run the full gate after.

Output a table: finding | severity | reachable | action | owner. Then a one-line verdict: PASS / PASS WITH ACCEPTED RISK / FAIL.
