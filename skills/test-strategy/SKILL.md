---
name: test-strategy
description: Use when writing tests for a feature or bug fix, deciding what to test at which level, or when a test suite is slow, flaky, or high-coverage with bugs still escaping. Produces a test matrix tied to real failure modes instead of chasing a coverage number.
---

# Test Strategy

Coverage measures execution, not confidence. Choose tests by the failure you are afraid of.

## Step 1 — Name the failure modes

List the ways this change can be wrong (4-8 bullets). Examples for a checkout endpoint: wrong total, tax applied twice, idempotency on retry, currency rounding, payment provider timeout, unauthorized access to another user's cart.

Each row becomes a test. If a failure mode has no test, you have chosen the wrong tests.

## Step 2 — Pick the cheapest level that can catch it

| Failure mode | Level | Why |
|---|---|---|
| Pure logic, branching, formatting | unit | fastest, most precise |
| SQL, transactions, constraints | integration (real DB) | mocks lie about SQL |
| HTTP contract, status codes, auth | integration via the app | exercises middleware |
| Money, auth, permissions, migrations | integration or e2e | blast radius |
| Multi-page/stateful user flow | e2e (few) | highest cost, lowest count |
| Rendering, a11y, forms | component + DOM assertions | faster than browser |

Rule: one test at the level where the bug would actually occur, plus one below it. Do not assert the same behaviour at three levels.

## Step 3 — Write the test so failure is legible

```ts
it("returns 409 for a duplicate invite, not 500", async () => {
  await invite("a@b.co")
  const res = await invite("a@b.co")
  expect(res.status).toBe(409)
  expect(await db.invites.count()).toBe(1)
})
```

- Name = behaviour + condition, not method name.
- Assert on observable outcomes (status, rows, rendered text), not on internal call order unless the call *is* the contract.
- One logical assertion per test; multiple `expect`s are fine when checking one outcome.
- No `setTimeout` sleeps; use fake timers, polling helpers, or event waits.
- Deterministic inputs: fixed clock (`vi.setSystemTime`), seeded randomness, isolated tenant IDs.

## Step 4 — Run the right commands

```bash
# focused first — never debug the whole suite
npx vitest run src/invites.test.ts -t "duplicate"
npx jest path/to/file.spec.ts -t "pattern"
pytest tests/test_invites.py::test_duplicate -x -q
go test ./internal/invites/ -run TestDuplicate -count=1
cargo test invites::duplicate -- --exact
dotnet test --filter "FullyQualifiedName~Duplicate"

# then the gate
npm test && npm run typecheck && npm run lint
go test ./... && go vet ./...
pytest -q && ruff check . && mypy .
```

`-count=1` / `--no-cache` when a cached green result would be a lie.

## Step 5 — Prove the test can fail

Delete or invert the implementation, rerun, confirm red, restore. A test that has never failed has not been tested. For bug fixes, the regression test must fail on the pre-fix code — verify with `git stash`.

## Step 6 — Kill flakiness at the source

```bash
for i in $(seq 1 20); do npx vitest run src/invites.test.ts --silent || break; done
```

Common causes: shared mutable state, order dependence, real network/clock, unawaited promises, fixed ports, parallel tests sharing a DB. Fix the isolation; do not add retries to hide it. If a retry stays, cap it at 1 and log when it triggers.

## Suite health

- Unit suite < 10s, integration < 2min, e2e < 15min. Slow suites stop being run.
- No snapshot tests for behaviour you care about — they pass through regressions.
- Every bug fixed gets one regression test, referenced in the commit body.
- Delete tests that assert framework behaviour or mock the thing under test.

## Exit criteria

- Every named failure mode has exactly one test at the level where it can fail.
- Focused tests pass, full gate passes, and at least one new test was observed failing before the fix.
- No new sleeps, retries, or `.skip`s in the diff.
