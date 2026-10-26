---
name: release-engineering
description: Use when preparing a release, cutting a version, writing a changelog, tagging a build, or verifying a deploy. Covers version bump, release notes, pre-flight gates, artifact/registry checks, rollback plan, and post-release verification with commands.
---

# Release Engineering

A release is a verified, reversible event — not a `git push`. Every step below produces evidence you can paste into the release notes.

## Step 1 — Establish the baseline

```bash
git status --short          # must be clean or explicitly accounted for
git fetch --tags --prune
git describe --tags --always
git log --oneline "$(git describe --tags --abbrev=0)"..HEAD
gh release list --limit 5
```

Decide the bump from the diff, not from vibes:

- MAJOR: breaking public API/CLI/config/schema
- MINOR: new capability, backwards compatible
- PATCH: fixes only

If the project versions via Conventional Commits, verify the tooling agrees:

```bash
npx semantic-release --dry-run
npx changesets status
git-cliff --unreleased
```

## Step 2 — Pre-flight gates (all must pass, in this order)

```bash
npm ci                 # clean install, not npm install
npm run typecheck
npm run lint
npm test
npm run build
npm pack --dry-run     # inspect what actually ships
```

```bash
cargo publish --dry-run
go build ./... && go vet ./...
python -m build && twine check dist/*
docker build -t app:rc .
```

Checklist beyond the commands:

- [ ] No secrets, tokens, or `.env` in the artifact (`git grep -nE '(AKIA|sk_live|ghp_|BEGIN [A-Z ]*PRIVATE KEY)' -- .` on the diff)
- [ ] Database migrations are forward-compatible with the *previous* release (rolling deploy)
- [ ] New env vars documented and present in the deploy target
- [ ] Feature flags default to off for anything risky
- [ ] Version string consistent across manifests (`package.json`, `pyproject.toml`, `Cargo.toml`, `VERSION`)
- [ ] Changelog entry exists and names user-visible changes

## Step 3 — Release notes people can use

```markdown
## v1.8.0 — 2026-10-26

### Added
- Invite flow with 7-day expiry (#412)

### Fixed
- Duplicate invite returned 500 instead of 409 (#418)

### Breaking
- `POST /invites` now requires `role` in the body. Migration: send `role: "member"`.

### Upgrade
```bash
npm i app@1.8.0
npx app migrate
```
```

Notes state impact and action, not commit titles. Link the PRs. Name the migration command.

## Step 4 — Cut and publish

```bash
git tag -a v1.8.0 -m "v1.8.0"
git push origin v1.8.0
gh release create v1.8.0 --title "v1.8.0" --notes-file RELEASE_NOTES.md
gh release view v1.8.0 --json tagName,assets,isDraft,isPrerelease
```

Publish to the registry only after the tag exists, so the source of the artifact is traceable. Verify the artifact is reachable from the outside:

```bash
npm view app@1.8.0 version dist.tarball
curl -sS https://registry.npmjs.org/app/1.8.0 | jq -r '.version'
```

CI artifacts are not releases — they expire. If users need binaries, attach them to the release with `gh release upload`.

## Step 5 — Verify production, then watch

```bash
curl -sS -o /dev/null -w '%{http_code} %{time_total}s\n' https://app.example.com/healthz
curl -sS https://app.example.com/api/version
```

- Smoke the golden path once, with a real request (not just a 200 on `/`).
- Confirm the deployed version matches the tag.
- Watch error rate and latency for at least one traffic cycle before declaring success.
- If the deploy platform supports it, verify the rollback path on paper: previous image/tag, migration reversibility, feature-flag kill switch.

## Step 6 — Rollback, decided in advance

Write these before shipping: trigger condition (error rate > X% for Y minutes), mechanism (`vercel rollback`, `kubectl rollout undo`, `heroku releases:rollback`, redeploy previous tag), and data implications (migrations that cannot be reversed must be expand-contract, see the database-migrations skill).

## Report

```
Version:   v1.8.0 (from v1.7.2)
Gates:     typecheck PASS, lint PASS, tests 214 PASS, build PASS
Artifact:  tarball sha256 … / image digest sha256:…
Published: npm view confirmed, gh release assets confirmed
Smoke:     POST /invites → 201 in 84ms on prod
Rollback:  previous tag v1.7.2, migration reversible (no destructive DDL)
Open:      something you deliberately deferred
```
