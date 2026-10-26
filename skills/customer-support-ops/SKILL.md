---
name: customer-support-ops
description: "Use when setting up or improving customer support for a product, defining SLAs and support tiers, writing macros and response templates, triaging a queue, handling escalation and refunds, or turning tickets into product fixes. Also use when support load is overwhelming the team."
---

# Customer Support Ops

Support is the only place where customers tell you exactly what is broken. Treat it as a product feedback system with a response-time contract, not a cost centre.

## 1. Tiers and response contracts

| Tier | Who | First response | Resolution target | Channel |
|---|---|---|---|---|
| P1 | Product down, data loss, security | 1h (24/7 if sold as such) | 4h workaround | dedicated channel + phone |
| P2 | Major feature broken, no workaround | 4 business hours | 2 business days | email + in-app |
| P3 | Bug with workaround, billing question | 1 business day | 5 business days | email |
| P4 | How-to, feature request | 2 business days | best effort | docs/community |

Only promise SLAs you can staff. Publish the support hours and the escalation path. A breached P1 costs more than the contract you avoided by not promising 24/7.

## 2. Triage in five questions

1. Is the product down for many users? → P1, page on-call, start an incident (`incident-response`).
2. Is money or data at risk? → P1/P2, snapshot before touching anything.
3. Can I reproduce it, and with what exact steps/version/browser?
4. Is it our bug, their config, or expected behaviour? Say which, plainly.
5. What is the one next action and who owns it?

Every ticket gets: severity, owner, current state, next update time. No ticket sits in "investigating" without an owner.

## 3. Macros that don't sound like a robot

```
Acknowledge (P1):
"We're seeing this as a service issue and are treating it as top priority.
Current status: <what we know>. Next update in <30 min>, even if there's no change.
Workaround for now: <steps>. — <name>"

Bug confirmed (P3):
"Confirmed — this is our bug, not your setup. It happens when <condition>.
Tracked as <issue link>. I'll update you when it ships; expect <date or 'next release'>.
Workaround until then: <steps>."

Cannot reproduce:
"I tried <exact steps> on <version/browser> and got <expected result>.
Could you send: the exact URL, the time it happened, and any error text/screenshot?
That will let me reproduce it on our side."

Refund (within policy):
"Refunded <amount> to the original payment method; it usually lands in 5-10 business days.
I've also cancelled <thing> so it doesn't renew. Anything else I can close out?"
```

Rules: acknowledge the impact before explaining the cause; never blame the user; never promise a date engineering did not commit to; one thread per issue.

## 4. Feedback loop into engineering

Weekly, convert tickets into signal:

```bash
# if tickets live in a tracker or DB
jq -r '.[] | select(.status=="closed") | .tags[]' tickets.json | sort | uniq -c | sort -rn | head -20
gh issue list --label "from-support" --state open --limit 50
```

- Tag every ticket with a component and a cause (`bug:checkout`, `confusion:onboarding`, `billing`).
- Top recurring cause becomes a product issue with ticket counts and quotes attached.
- Confusion repeated more than 3 times is a UX defect, not a support problem — fix the UI/docs.
- Track "tickets per 100 accounts" as a health metric; rising means product debt.

## 5. Self-service that actually deflects

Order of preference: fix the product → improve the error message → docs → macro → human reply.

- Error messages must say what happened, why, and the fix, in user language, with a doc link.
- Docs answer the top 20 questions, each with a copy-pasteable example.
- In-app help on the exact screen where the question arises.
- Status page for outages; changelog for "why did it change".

## 6. Staffing and load

- Track median and p90 first-response time, not average.
- Triage rotation: one person owns the queue per day and can escalate, not solve everything.
- Definition of a healthy queue: no P1 older than target, no ticket without an owner, backlog trend flat or falling.
- On-call needs a runbook per alert, a rollback path, and a handoff note.

## Deliverable

```markdown
# Support setup — <product>

Tiers: P1 1h/4h · P2 4h/2d · P3 1d/5d · P4 best effort
Channels: <in-app, email, status page>; hours <...>; escalation <...>
Macros: 12 drafted (ack, bug-confirmed, cannot-repro, refund, outage, feature-request)
Metrics: first response p50/p90, resolution p50, tickets per 100 accounts, top 5 causes
Feedback: weekly review → issues labelled from-support with ticket counts
Open risks: no 24/7 coverage; refund authority limited to $X
```
