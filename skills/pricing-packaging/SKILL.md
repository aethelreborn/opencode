---
name: pricing-packaging
description: Use when setting or changing prices, designing tiers and packaging, choosing a value metric, handling discount requests, or rolling out a price increase without churn. Covers willingness-to-pay research, tier design, grandfathering, and measuring the result.
---

# Pricing and Packaging

Pricing is the highest-leverage product decision and the least reversible socially. Change it with evidence and a migration plan.

## 1. Choose the value metric

The metric should scale with the value the customer receives, be easy to predict, and be hard to game.

| Business | Weak metric | Strong metric |
|---|---|---|
| API/infra | seats | requests, GB processed, compute minutes |
| Analytics | seats | events ingested, tracked users, data retention |
| Collaboration | flat tiers | seats × active collaborators |
| Vertical SaaS | flat | locations, invoices processed, transactions |
| Marketplace | subscription only | GMV take rate or listing volume |

Test: if a customer's usage doubles, does their value roughly double? If yes, the metric is defensible.

## 2. Willingness to pay (before setting numbers)

- **Van Westendorp** (4 questions): too cheap / a bargain / expensive / too expensive. Collect 30+ responses from the ICP; the acceptable band sits between "bargain" and "expensive".
- **Value-based anchoring**: quantify the outcome. "Saves 6 hours/week of an $80/h analyst = $2,080/month; charging $199 is 10% of the value." That sentence is your sales narrative.
- **Competitor anchoring**: list the 3 alternatives (including "spreadsheet + intern"). Your price must be legible relative to them, not identical.
- **Prepayment probe**: offering an annual plan at a discount measures real intent better than any survey.

Never survey your own intuition. If you cannot get 30 responses, talk to 10 customers individually and record exact quotes.

## 3. Tier design

Three tiers, each with a job:

- **Entry** — removes the top objection for small users; low price, hard limits, no support SLA.
- **Core (anchor)** — where 70% of revenue should land. Best value per dollar; this is the tier you design first.
- **Scale** — for the 10% with budget and compliance/SSO/audit needs. Price on value, not cost.

Rules:
- Differentiate on *capability and scale*, not on crippling features people need to evaluate (never paywall the export in a data product).
- Make the upgrade moment obvious: when they hit a limit, show usage, the consequence, and the exact price difference.
- Annual = 2 months free is conventional; use it to fund cash, not to discount desperation.
- Feature gating must be enforced server-side and tested; a UI-only gate is a bug.

## 4. Price increase without churn

1. Segment: who is under-priced relative to value (high usage, old plan)?
2. Grandfather existing customers for 6-12 months, or move them to the nearest equivalent new plan with a written notice ≥30 days.
3. Announce with the reason (cost, added capability), the date, the new amount, and what they keep. Give a downgrade path.
4. Expect 2-5% involuntary churn; if your LTV:CAC is healthy, a 20-30% increase is usually net positive.
5. Measure for 90 days: revenue retained, churn by cohort, support ticket volume, downgrade rate. Roll back the segment that behaves badly.

## 5. Discount policy (write it down)

| Situation | Allowed | Approval |
|---|---|---|
| Annual prepay | 17% (2 months) | self-serve |
| Non-profit / education | 50% | founder |
| Startup (<$1M raised) | 25% for 12 months | founder |
| Competitive displacement | 15%, 6 months | sales lead |
| Strategic logo / case study | 30%, with a public reference commitment | founder |

Never discount without a term, a reason, and something in return (annual commitment, case study, logo, prepay). A discount without an exchange teaches the customer that list price is fiction.

## 6. Instrument it

Track per plan: signups, conversion, ARPA, expansion, churn, gross margin. Compare cohorts before/after the change. A pricing change is an experiment with a 60-90 day read; do not conclude from week one.

## Deliverable

```markdown
# Pricing proposal — <product>

Value metric: invoices processed/month (scales with customer value)
WTP evidence: 34 responses, acceptable band $49-$249; 6 interviews citing $2k/mo saved
Tiers: Free (50 inv/mo) · Core $79 (1k) · Scale $249 (10k + SSO/audit) · Enterprise custom
Anchor rationale: Core at 4% of quantified value
Migration: existing customers grandfathered 12 months; notice sent 2026-11-01; downgrade path documented
Risks: 3% expected involuntary churn; support load +15% for 6 weeks
Success: ARPA +18%, gross churn < 4%, NRR > 100% at 90 days
```
