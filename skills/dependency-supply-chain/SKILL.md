---
name: dependency-supply-chain
description: Use when adding a dependency, auditing an existing one, reviewing a lockfile change, or responding to a CVE. Covers necessity checks, version/registry verification, vulnerability and license scanning, unused-dependency detection, and safe upgrade order.
---

# Dependency Supply Chain

Every dependency is code you ship, maintain, and trust. Add deliberately; audit on a schedule.

## Before adding

1. **Does the platform already do it?** Node 22 has `fetch`, `crypto.randomUUID`, `structuredClone`, `AbortSignal.timeout`; Python has `tomllib`, `pathlib`, `zoneinfo`; Go has `slices`, `maps`, `errors.Join`. Use the standard library first.
2. **Is it already installed transitively?** `npm ls <pkg>`, `pip show`, `cargo tree -i <crate>`. If yes, promoting it to a direct dependency is a one-line change and no new supply-chain surface.
3. **Verify the package is real and maintained** — not a typosquat:

```bash
npm view <pkg> name version time.modified repository.url maintainers dist.integrity
curl -sS https://pypi.org/pypi/<pkg>/json | jq '{version: .info.version, summary: .info.summary, home: .info.home_page, requires_python: .info.requires_python}'
cargo search <crate>
```

Red flags: repository deleted, single publish ever, no tests, obfuscated install scripts, dependency on a package with a lookalike name, postinstall that fetches code.

4. **Check the cost**: transitive count and size.

```bash
npx howfat <pkg>          # or bundlephobia
npm ls --all | wc -l
pipdeptree -p <pkg>
```

5. **Pin what matters**: exact versions for build-critical tooling, ranges for libraries. Commit the lockfile. Never `*` or `latest` in a manifest.

## Audit the current tree

```bash
npm audit --omit=dev
npm audit signatures                # registry signature verification
npx osv-scanner --lockfile=package-lock.json
pnpm audit --prod

pip-audit
uv pip compile requirements.in -o requirements.txt && pip-audit -r requirements.txt

govulncheck ./...
cargo audit
bundle audit check --update
```

```bash
# licenses: block copyleft in a closed product
npx license-checker --production --onlyAllow 'MIT;ISC;Apache-2.0;BSD-2-Clause;BSD-3-Clause;0BSD'
pip-licenses --format=markdown --with-urls
```

CI gate worth copying:

```yaml
- run: npm ci --ignore-scripts
- run: npm audit --omit=dev --audit-level=high
- run: npx osv-scanner --lockfile=package-lock.json --fail-on-vuln
```

`--ignore-scripts` on CI installs removes the largest class of supply-chain attacks; if a package genuinely needs a build step, allowlist it explicitly.

## Find dependencies you no longer use

```bash
npx depcheck
npx knip            # also finds unused files and exports
uvx deptry .
go mod tidy && git diff go.mod
cargo machete
```

Remove unused ones in a standalone commit — they are pure risk with zero benefit.

## Responding to a CVE

1. Confirm reachability: is the vulnerable function actually called with attacker-controlled input? `npm ls <pkg>` to see who pulls it in.
2. Prefer the nearest safe version in the existing major (`npm i pkg@^2.9.3`).
3. If the parent must bump a major, read its changelog for breaking changes before upgrading; run the full gate after.
4. If no fix exists: mitigate at the boundary (input validation, WAF rule, disabling the feature) and record a dated follow-up. Do not silence the alert without a compensating control.
5. Record in the changelog: package, CVE, version before/after, blast radius.

## Upgrade order

1. Patch updates (automated, merge when green)
2. Dev-only majors (safe)
3. Runtime majors one at a time, reading the migration guide
4. Framework and build-tool majors last, isolated in their own change

Do not combine a dependency major with a feature change. If the lockfile diff is larger than the source diff, the review will not happen.

## Report

```
Added:    pkg@1.2.3 — why the stdlib could not do it, transitive count
Removed:  pkg-a, pkg-b — unused (depcheck)
Vulns:    none high/critical reachable; 1 moderate in dev-only tool (accepted, dated)
Licenses: all permissive (verified by license-checker)
Lockfile: committed, signatures verified
```
