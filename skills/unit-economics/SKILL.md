---
name: unit-economics
description: Use when calculating CAC, LTV, payback, gross margin, burn, or runway; when deciding whether a growth channel works; when planning pricing changes or a fundraise; or when asked "is this business viable". Produces a model with stated assumptions and sensitivity, not a single optimistic number.
---

# Unit Economics

Every number below is a formula plus an assumption. Show both. A model without a sensitivity range is a guess in a spreadsheet.

## Core definitions (use consistently)

```
ARPA        = MRR / paying accounts                    (monthly, not annual)
Gross margin= (revenue − COGS) / revenue               COGS = hosting, third-party APIs, support, payment fees
CAC         = (sales + marketing spend) / new customers acquired in the period
Payback     = CAC / (ARPA × gross margin)              months to recover acquisition cost
Churn       = accounts lost in period / accounts at start
LTV         = ARPA × gross margin / monthly churn      (use net revenue churn, not logo churn, when they differ)
LTV:CAC     = LTV / CAC                                healthy B2B SaaS ≈ 3:1, floor 1:1
Burn        = cash out − cash in per month             exclude one-off financing
Runway      = cash / net burn                          months
NRR         = (starting MRR + expansion − contraction − churn) / starting MRR
Quick ratio = (new + expansion) / (churn + contraction)   >4 strong, <1 shrinking
```

Traps: annual contracts reported as monthly MRR, excluding support from COGS, CAC that ignores founder time, LTV computed on gross (not margin) revenue, churn measured on revenue while the business sells seats.

## Worked example (B2B SaaS, self-serve)

```
ARPA $79/mo · gross margin 82% · monthly logo churn 3.1%
LTV          = 79 × 0.82 / 0.031      = $2,090
CAC          = $14,000 spend / 40 new  = $350
Payback      = 350 / (79 × 0.82)      = 5.4 months
LTV:CAC      = 5.97                   → channel is viable at this scale
Blended CAC includes paid + content; paid-only CAC is $520 → payback 8.0 mo
```

Next check the constraint: at $14k/mo spend and $350 CAC, growth is 40 accounts/mo. If gross new MRR ($3,160) is below churned MRR ($2,450 at 1,000 accounts), the business is not compounding — fix retention before buying more traffic.

## Sensitivity (always produce)

Vary the assumptions that actually move the answer:

| Churn | LTV | LTV:CAC @$350 |
|---|---|---|
| 2.0% | $3,239 | 9.3 |
| 3.1% | $2,090 | 6.0 |
| 5.0% | $1,296 | 3.7 |
| 8.0% | $810 | 2.3 |

State the break-even: at what churn does LTV:CAC fall below 3? Show it. That is the number the team must defend.

## Runway and the default-alive test

```
Cash $480k · net burn $38k/mo → runway 12.6 months
If hiring 2 engineers ($30k/mo fully loaded) → burn $68k → runway 7.1 months
Required MRR to break even = (fixed costs + COGS) / margin
```

Before any spend, answer: does this purchase shorten time-to-revenue or only add capacity? Capacity without demand accelerates the end.

## Pricing and packaging link

- ARPA is a pricing decision, not a sales outcome. See the `pricing-packaging` skill.
- Segment CAC by channel; a blended number hides the channel that is burning cash.
- Expansion revenue (NRR > 100%) is worth more than acquisition at the same dollar — it carries near-zero CAC.

## Fundraising sanity check

Investors underwrite the path to $1M+ ARR with improving efficiency:

- MRR growth rate month-over-month and its trend
- NRR and gross retention (the two numbers that predict survival)
- Payback < 12 months for self-serve, < 18-24 for sales-led
- Burn multiple = net burn / net new ARR; < 2 is efficient, > 3 is a problem
- A credible bottom-up model: accounts × ARPA × conversion, not a top-down TAM percentage

## Deliverable

```markdown
# Unit economics — <product>, <month>

## Assumptions (with source)
ARPA $79 (billing export, N=412) · GM 82% (cloud bill + Stripe fees + support) · churn 3.1% (trailing 3-mo avg)

## Outputs
LTV $2,090 · CAC $350 blended / $520 paid · payback 5.4 / 8.0 months · LTV:CAC 6.0 / 4.0
NRR 104% · quick ratio 3.2 · burn $38k · runway 12.6 months

## Sensitivity
Break-even churn for LTV:CAC 3 = 6.2%. Break-even ARPA at current churn = $39.

## Decision
Scale paid to $25k/mo if paid CAC stays < $500 for two consecutive months; otherwise fix activation
(only 41% of signups reach first invoice — the retention lever with the highest expected value).
```

## Rules

- Never present a single-point forecast. Ranges or it didn't happen.
- Label every assumption as measured, benchmarked, or assumed.
- Recompute monthly; stale unit economics are worse than none.
- If the data does not exist, say so and name the instrumentation needed — do not substitute a plausible number.
