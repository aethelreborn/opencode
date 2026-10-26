---
name: spec-driven-delivery
description: Use when a request is vague, large, or "build me X", when scope is ambiguous, or when a change spans multiple files. Converts intent into a verifiable spec with acceptance tests, a task graph, and a Definition of Done before implementation starts.
---

# Spec-Driven Delivery

Vague input is not permission to invent scope. Turn the request into something testable, confirm only the choices that are expensive to reverse, then deliver in verified increments.

## Step 1 — Restate the intent in one paragraph

Write it as if explaining to the author of the code: what changes for the user, what stays the same, what "working" looks like. If two readings differ materially (e.g. "improve onboarding" = rewrite flow vs. add tooltips), state both and pick the smaller one that satisfies the stated goal; proceed unless the choice is irreversible.

## Step 2 — Acceptance criteria as failing checks

Each criterion must be observable without reading the diff:

```
AC1: POST /api/invites returns 201 with {id, email, expiresAt} for a valid body
AC2: a duplicate invite for the same email returns 409, not a 500
AC3: the invite email is sent exactly once (assert on the mailer stub call count)
AC4: `npm run typecheck && npm test` pass
```

Rules:
- One criterion per behaviour; no compound "and" hidden in a sentence.
- Name the command or assertion that proves it.
- Explicitly list **non-goals** (auth roles, i18n, analytics…). Non-goals are the cheapest scope protection you have.

## Step 3 — Locate the seams before designing

```bash
rg -n 'similar_feature|related_handler' src | head -20
git log --oneline -10 -- <path-you-will-touch>
```

Design constraints to record:

- Where the new code belongs (module, layer, file) and why that matches existing structure
- Data changes: none / additive / migration required (if migration: backfill + rollback plan)
- Public interface changes: none / additive / breaking (if breaking: deprecation path)
- Failure modes: what the user sees when the dependency is down

## Step 4 — Task graph

Order tasks so each leaves the tree green:

1. Test or fixture that encodes AC1 (fails)
2. Minimal implementation to pass it
3. Next AC, repeat
4. Refactor only after all ACs pass
5. Docs/config/changelog in the same change as the behaviour

Track with `todowrite`. One todo = one verifiable unit. If a todo cannot be verified by a command, split it.

## Step 5 — Execute with evidence

For each task: change → run the focused check → record the result → mark done. Do not batch six changes and then discover which one broke the build. See `verification-loop` for the close-out gate.

## Step 6 — Report

```
Outcome:    what now works, in user terms
Changes:    file:line list, grouped by purpose
Proof:      commands run + results (pass counts, status codes, timings)
Not done:   non-goals and anything deferred, with the reason
Risks:      what could break in production and how you'd detect it
```

## Stop conditions

Stop and ask only when: credentials/accounts are required, two requirements contradict, the action is irreversible outside the repo (publish, deploy, delete data, send messages), or the product decision is genuinely the user's (pricing, brand, legal). Everything else: decide, state the decision, move.

## Anti-patterns

- A 20-item todo list nobody verifies. Prefer 4 verified steps.
- "While I'm here" refactors that expand the diff past the spec.
- Acceptance criteria that only the implementer can check ("code is clean").
- Building the abstract version (plugin system, config flags) for one concrete need.
