---
name: observability-instrumentation
description: Use when adding logging, metrics, tracing, or alerting to a service, when debugging "we can't tell what happened in prod", or before a launch where nobody knows if it works. Covers what to emit at each boundary, structured log rules, SLO-based alerts, and verifying signals locally.
---

# Observability Instrumentation

You cannot debug what you did not record. Instrument at boundaries, not everywhere.

## What to emit at each boundary

| Boundary | Log | Metric | Trace |
|---|---|---|---|
| Incoming HTTP/gRPC | method, route template, status, duration, request id | request count, latency histogram, error ratio | span per request |
| Outgoing HTTP | target host (not full URL with query), status, duration, retry count | dependency latency/errors | child span |
| DB query | statement *name* (never the SQL with values), rows, duration | query latency, pool saturation | child span |
| Queue/job | job type, attempt, outcome, queue depth | processed/failed/retried, age | span with links |
| Auth | outcome + reason code (never the token) | login failures by reason | span attributes |
| Business event | event name + ids + amount (no PII) | counters per event type | span event |

Never log: passwords, tokens, full card numbers, session ids, raw request bodies, full emails/phones (hash or mask), or unbounded user-controlled strings.

## Structured logs

```ts
logger.info(
  { requestId, userId, route: "POST /invites", status: 409, durationMs: 12, reason: "duplicate_invite" },
  "invite rejected",
)
```

Rules:
- One line per event, JSON in production, pretty locally.
- Stable message strings; variables in fields. `invite rejected` — not `invite for a@b.co rejected at 12:04`.
- Include the correlation id on every line so a trace links back.
- Log at boundaries and state transitions. No logging inside loops that can run 10k times.
- Levels: `error` = human action needed; `warn` = degraded but handled; `info` = business-relevant; `debug` = off in prod.

```py
import structlog, logging
structlog.configure(processors=[structlog.contextvars.merge_contextvars, structlog.processors.JSONRenderer()])
log = structlog.get_logger()
log.info("invite_rejected", request_id=rid, status=409, reason="duplicate")
```

## Metrics that lead to alerts

Use RED (services) and USE (resources):

```
requests_total{route,method,status}
request_duration_seconds{route}       # histogram, not average
dependency_requests_total{target,status}
queue_depth{queue}
db_pool_in_use{pool}
job_failures_total{job}
```

Do not alert on CPU. Alert on symptoms users feel, expressed as SLO burn:

- Availability SLO 99.9% → alert when 5xx ratio over 5 min exceeds the error budget burn.
- Latency SLO p95 < 300ms → alert on 5-minute p95 breach sustained for 10 minutes.
- Each alert needs: threshold, window, owner, and a link to the runbook with the first three diagnostic commands.

## Tracing

```ts
import { trace } from "@opentelemetry/api"
const span = trace.getTracer("invites").startSpan("invite.create")
span.setAttributes({ "invite.role": role, "tenant.id": tenantId })
try { /* ... */ } finally { span.end() }
```

- Propagate `traceparent` across HTTP and queue boundaries; without propagation you get isolated spans, not a trace.
- Attribute names follow the semantic conventions (`http.route`, `db.system`, `messaging.destination.name`).
- Sample: 100% of errors, 5-10% of successes.
- Never put PII or unbounded values in attributes (cardinality explosions).

## Verify before shipping

```bash
# local: see the actual lines
docker compose up -d app && docker compose logs -f app | jq -c 'select(.level=="error")'

# metrics endpoint reachable and populated
curl -sS localhost:9090/metrics | rg 'requests_total|duration_seconds' | head

# a real failure produces the signal you expect
curl -sS -X POST localhost:3000/api/invites -H 'content-type: application/json' -d '{"email":"a@b.co"}' -w '%{http_code}\n'
curl -sS -X POST localhost:3000/api/invites -H 'content-type: application/json' -d '{"email":"a@b.co"}' -w '%{http_code}\n'
docker compose logs app | tail -5    # expect exactly one duplicate_invite line
```

## Exit criteria

- Each new endpoint/consumer emits a log line, a metric, and a span on failure paths.
- Secrets and PII absent from emitted fields (grep the diff for `password`, `token`, `authorization`).
- One alert (or dashboard panel) exists for the new capability, with a runbook link.
- You triggered a failure locally and saw the signal arrive.
