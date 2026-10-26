---
description: Security review of code, auth flows, input handling, secrets, and dependencies.
---

# /security-review

Target: $ARGUMENTS

If no target is given, review the current diff and any auth/input/DB code it touches.

1. Delegate to `security-reviewer`. Provide the diff, entry points, trust boundaries, and data flows.
2. Cover at minimum:
   - injection (SQL/NoSQL/command/template), XSS, SSRF, path traversal
   - authn/authz gaps, IDOR, privilege escalation
   - secrets in code, logs, env files, git history
   - unsafe deserialization, dependency and supply-chain risk
   - CSRF, CORS, rate limiting, error leakage
   - crypto misuse and insecure defaults
3. Verify exploitability. A finding without a plausible attack path is a hardening note, not a vulnerability.
4. Report by severity with `file:line`, attack scenario, and a minimal remediation. Add a test or check when practical.

Do not modify production code unless the user asks for fixes.
