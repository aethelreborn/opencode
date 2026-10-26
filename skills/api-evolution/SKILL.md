---
name: api-evolution
description: Use when changing an HTTP API, GraphQL schema, RPC contract, SDK surface, CLI flags, or a webhook payload. Covers compatibility classification, expand-contract rollout, deprecation policy, contract tests, and how to prove consumers still work.
---

# API Evolution

A public interface is a promise with unknown signatories. Assume every field is consumed, every status code is asserted, and every payload is parsed by something you cannot see.

## 1. Classify the change before writing code

| Change | Class | Allowed in a minor? |
|---|---|---|
| Add optional request field / new endpoint / new response field | additive | yes |
| Add required request field / remove field / change type / tighten validation | breaking | no |
| Change default / change error shape / change status code | breaking in practice | no |
| Rename field or parameter | breaking | no (deprecate first) |
| Reorder enum values, change integer width, change nullability | risky | treat as breaking |
| Change rate limits, pagination defaults, sort order | behavioural | announce |

Removing a response field is breaking even if "nobody uses it" — you cannot see every consumer. Verify with logs/telemetry before assuming.

## 2. Additive changes (the default path)

- New required field → make it optional with a documented default; enforce later.
- New response field → additive is safe; keep it out of strict equality checks in your own tests.
- New enum value → document that clients must tolerate unknown values; never break on it server-side.
- New endpoint → version-free; just ship it.

## 3. Breaking changes: expand → migrate → contract

**Expand** (deploy 1): support both shapes.

```ts
// accept legacy and new
const limit = body.pageSize ?? body.limit ?? 20
res.json({ items, nextCursor, next_page: nextCursor }) // both names, documented as transitional
```

**Migrate** (wait): announce the deprecation with a date, expose usage telemetry, contact known consumers, keep both paths for at least one full consumer release cycle.

```http
Deprecation: true
Sunset: Wed, 01 Apr 2027 00:00:00 GMT
Link: <https://docs.example.com/api/deprecations#limit>; rel="deprecation"
```

**Contract** (deploy 3): remove the old shape only after the sunset date and after telemetry shows zero or accepted usage. Log and count hits on deprecated paths; alert on them so removal is evidence-based.

Database-adjacent APIs follow the same rule: add nullable column → dual-write → backfill → switch reads → enforce constraint → drop old column. Never in one deploy.

## 4. Contract tests

Generate tests from the spec, not from your own implementation:

```bash
npx openapi-diff old.yaml new.yaml        # fails on breaking changes
npx @redocly/cli lint openapi.yaml
npx spectral lint openapi.yaml
npx prisma migrate diff --from-schema-datamodel old.prisma --to-schema-datamodel new.prisma --script
```

```ts
it("keeps the documented response contract", async () => {
  const res = await request(app).get("/api/items?limit=2")
  expect(res.status).toBe(200)
  expect(res.body).toMatchSchema(ItemListSchema)   // zod / ajv
})
```

CI: run `openapi-diff` on the PR and fail on `breaking` unless a label/approval says otherwise. That single gate prevents most accidental API breakage.

## 5. Error contract

Keep error bodies stable and machine-readable:

```json
{ "error": { "code": "duplicate_invite", "message": "An invite already exists for this email", "requestId": "req_01H..." } }
```

- `code` is the contract; `message` is for humans and may change.
- One error envelope for the whole API. Never leak stack traces or SQL.
- 4xx means the caller can fix it; 5xx means you can. Do not return 200 with an error body.

## 6. Versioning strategy

- Prefer additive evolution over URL versions. If you must version, pin major only (`/v2`) and keep the previous major alive with a sunset date.
- Never version by adding a query param and calling it done.
- SDKs: follow semver mechanically — `feat` minor, `fix` patch, breaking → major. Treat generated clients as public API.

## 7. Report

```
Change:      POST /invites requires role (breaking)
Path:        expand deployed 2026-10-26 → sunset 2027-04-01 → remove
Consumers:   3 known callers notified; telemetry shows 12% of calls still omit role
Contract:    openapi-diff clean after approval label; contract tests pass
Docs:        changelog + migration snippet in README
```
