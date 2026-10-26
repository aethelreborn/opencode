---
name: incident-response
description: Use when production is failing, a deploy broke something, data looks wrong, or someone reports an outage. Covers severity triage, stabilize-first tactics, timeline capture, root-cause analysis, and a blameless postmortem that produces real follow-ups.
---

# Incident Response

Order of operations is fixed: **stabilize → understand → fix → learn**. Never investigate before stopping the bleeding, unless investigation is required to stop it.

## 1. Triage in 60 seconds

Answer with what you have, not what you wish you had:

```bash
curl -sS -o /dev/null -w 'status=%{http_code} time=%{time_total}s\n' https://app.example.com/healthz
kubectl get pods -A | rg -v 'Running|Completed'
kubectl rollout status deploy/app
vercel ls --prod | head
heroku ps -a app
docker compose ps
```

Assign severity:

| Sev | Definition | Response |
|---|---|---|
| SEV1 | Users cannot use the product; data loss or corruption; security breach | All hands, mitigate now, notify immediately |
| SEV2 | Major feature down or badly degraded for many users | Fix within the hour |
| SEV3 | Minor feature broken, workaround exists | Same day |
| SEV4 | Cosmetic / single user | Normal backlog |

Write down: start time (UTC), what users see, what changed in the last 60 minutes (`git log --since`, deploy history, config changes, feature-flag flips, traffic spikes, third-party status pages).

## 2. Stabilize

Try in this order — cheapest and most reversible first:

1. **Roll back the last deploy.** `vercel rollback`, `kubectl rollout undo deploy/app`, `heroku releases:rollback`, redeploy the previous tag. If the incident started with a deploy, this is almost always correct and takes seconds.
2. **Flip the feature flag off.** Check that the kill switch exists and is not itself gated by the broken path.
3. **Scale or shed load.** Raise replicas, enable rate limits, disable expensive endpoints.
4. **Fail over dependencies.** Point at the replica, disable the non-critical integration.
5. **Fix forward** only when rollback is impossible (destructive migration already applied) — then the fix is the mitigation, and you need a second pair of eyes.

Do not delete data, drop tables, or "clean up" during an incident. Preserve state for the postmortem; snapshot first (`pg_dump`, volume snapshot, log export).

## 3. Communicate

- Open an incident doc with a running timeline: `14:02 UTC — deploy v1.8.0; 14:05 — 5xx spike 12%; 14:07 — rollback started`.
- Status updates every 15-30 min for SEV1/2: what users are affected, what's being done, ETA or "no ETA yet".
- Say "we are investigating" rather than guessing causes in public.
- One owner, one channel. Never two people applying conflicting changes.

## 4. Diagnose (after users are stable)

```bash
# link symptoms to a change
git log --since='2 hours ago' --oneline
gh run list --limit 10
# error shape
rg -c '"level":"error"' logs/app.log
jq -r 'select(.level=="error") | .message' logs/app.log | sort | uniq -c | sort -rn | head
# resource pressure
kubectl top pods
# database
psql "$DATABASE_URL" -c "select state, count(*) from pg_stat_activity group by 1;"
psql "$DATABASE_URL" -c "select pid, now()-query_start as age, left(query,120) from pg_stat_activity where state='active' order by age desc limit 5;"
```

Distinguish trigger (what changed) from cause (why the system was vulnerable to it). The postmortem is about the cause.

## 5. Postmortem (within 48 hours, blameless)

```markdown
# Incident: invite endpoint 500s (2026-10-26)

Severity: SEV2   Duration: 14:02–14:19 UTC (17 min)   Users affected: ~2,300

## Impact
What broke, for whom, how much: failed invites, 41% error rate on POST /invites.

## Timeline (UTC)
14:02 deploy v1.8.0 (schema change + code)
14:04 alert: 5xx ratio > 5%
14:07 on-call ack; rollback started
14:09 deploy healthy; errors stop
14:19 monitoring confirms recovery

## Root cause
Migration added NOT NULL without default; old pods wrote rows without the column → constraint violation.

## Why it was possible
- Migration applied before code that satisfies it (not expand-contract)
- No staging smoke test on the invite path
- Rollback did not revert the migration

## What went well / what didn't
...

## Action items (owner + date, tracked as issues)
1. [ ] Make migration expand-contract (add nullable, backfill, enforce later) — @x, 2026-10-30
2. [ ] Add pre-deploy check: migrations must be compatible with previous release — @y, 2026-11-02
3. [ ] Add invite-path smoke test to deploy pipeline — @z, 2026-11-02
```

Action items without owner + date + issue link do not exist. Verify the fix by replaying the trigger in staging.

## Guardrails

- Never `git push --force`, `rm -rf`, or `DROP` your way out of an incident.
- Never silence an alert without a replacing signal.
- Never state a cause you have not evidenced; say "unconfirmed hypothesis" and name the check that would confirm it.
- If the same failure happened before, link the previous incident — recurrence means the action items were theatre.
