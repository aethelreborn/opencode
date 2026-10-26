---
name: product-discovery
description: Use when deciding what to build, writing a PRD or spec for a new product or feature, sizing a market, or evaluating "should we build this". Produces a problem statement, ICP, evidence log, opportunity tree, and a scoped PRD with explicit non-goals and success metrics. Not for implementing an already-specified feature.
---

# Product Discovery

Build the smallest thing that proves the riskiest assumption. Discovery is the process of deciding what deserves engineering time.

## 1. Problem statement (no solution words)

> **[ICP]** struggles to **[job to be done]** because **[root cause]**, which costs them **[quantified pain]**.

Rules: no feature names, no technology, one sentence. If you cannot quantify the pain, that is the finding — go get numbers before building.

## 2. ICP and evidence

Define one primary segment: role, company size/context, current workaround, budget holder, and the trigger event that makes them act. "Everyone" is not a segment.

Evidence hierarchy — prefer the top:

1. Behaviour you observed (support tickets, churn reasons, workflow shadowing, product telemetry)
2. Money already spent on the problem (competitors, consultants, manual headcount)
3. Direct statements from 5+ people in the segment (interviews)
4. Your own intuition (weakest — label it as such)

Interview script that does not lead:

- "Walk me through the last time you did X. What did you do first?"
- "What did that cost you — time, money, rework?"
- "What happened when it went wrong?"
- "What did you try before this? Why did you stop?"
- Never: "Would you use a tool that…"

Record: quote, role, pain, current workaround, willingness signal. Five consistent interviews beat fifty survey responses.

## 3. Opportunity solution tree

```
Outcome: reduce time-to-first-invoice for new accounts from 3 days to 4 hours
├── Opportunity: onboarding requires manual data entry (7 interviews)
│   ├── Solution: import from accounting export
│   └── Solution: guided wizard with validation
├── Opportunity: approval blocked on finance (3 interviews)
│   └── Solution: configurable auto-approve threshold
└── Opportunity: no template for their industry (5 interviews)
    └── Solution: 5 seeded templates
```

One outcome, 3-5 opportunities, 1-2 solutions each. Choose by (impact × confidence) / effort — and state the confidence basis.

## 4. Riskiest assumption test

List assumptions: desirability (they want it), viability (they'll pay), feasibility (we can build it), usability (they can use it). Identify the one that kills the plan if false. Design the cheapest test:

| Assumption | Cheap test | Cost | Signal |
|---|---|---|---|
| They want it | 5 interviews + landing page with waitlist | 2 days | 30%+ email capture from targeted traffic |
| They'll pay | 10 pricing conversations, prepay offer | 1 week | 3 prepaid pilots |
| We can build it | spike on the hardest technical piece | 3 days | spike passes on real data |
| They can use it | clickable prototype, 5 usability sessions | 2 days | 4/5 complete without help |

Run the test. Write the result down either way. A falsified assumption is the cheapest outcome you can get.

## 5. PRD (one page, then stop)

```markdown
# <Feature> — PRD

## Problem
One paragraph from step 1, with the quantified pain.

## Users
Primary ICP, secondary, explicitly excluded.

## Success metric
One leading metric + one guardrail. e.g. "60% of new accounts send an invoice within 24h
(current 18%); guardrail: invoice error rate stays < 0.5%".

## Scope — v1
- [ ] 3-6 capabilities, each with an acceptance criterion
- [ ] Smallest slice that produces the success metric movement

## Non-goals
Everything you are deliberately not doing, with the reason.

## UX sketch
Entry point, happy path in 3 steps, failure states, empty state.

## Technical constraints
Data needed, integrations, permissions, expected scale (rows/day, users, latency).

## Risks
Ranked, each with a mitigation or a test.

## Open questions
Only the ones that change scope; assign an owner and a date.
```

## 6. Kill criteria (decide now, not later)

State up front: "If fewer than 3 of 10 interviews confirm the pain, or the spike cannot process 10k rows in 200ms, we stop." Written kill criteria prevent sunk-cost building.

## Anti-patterns

- Starting from a solution and reverse-engineering a problem for it.
- A PRD with 25 requirements and no non-goals.
- Metrics that cannot be measured with existing instrumentation — either instrument first or pick another metric.
- Treating a competitor's feature list as a roadmap.
- Building the platform before the first user's workflow works end to end.
