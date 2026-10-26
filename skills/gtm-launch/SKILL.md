---
name: gtm-launch
description: Use when launching a product, feature, or company; planning positioning and messaging; choosing channels; or running a launch week. Produces positioning, launch assets, a channel plan with owners and dates, and post-launch measurement.
---

# Go-To-Market Launch

A launch is a distribution event, not an announcement. Its job is to put the product in front of the people who have the problem, with a message that makes the value obvious in one sentence.

## 1. Positioning (fill this in before writing anything)

```
For      [ICP: role + context]
who      [situation that triggers the search]
<product> is a [category]
that     [primary outcome, quantified]
unlike   [current alternative]
we       [the one differentiator that is hard to copy]
```

Test: a stranger in the ICP should be able to repeat it back after hearing it once. If the category is unfamiliar, anchor to a familiar one ("Stripe for X") and then diverge in one sentence.

Message hierarchy:
- **Headline**: outcome, not feature. "Close your books in a day, not a week."
- **Subhead**: how, in one clause. "Automated reconciliation for Shopify + Stripe."
- **Three proof bullets**: measurable, specific. "Reconciles 12k transactions in 40s."
- **Objection handling**: price vs. alternative, migration effort, data safety, lock-in.
- **One call to action** per page. Two CTAs halve both.

## 2. Launch tier (decide how much this deserves)

| Tier | When | Effort | Assets |
|---|---|---|---|
| T1 Company launch | new product line, funding, major pivot | 4-6 weeks | landing page, demo video, docs, press/community push, launch event, 10 design-partner quotes |
| T2 Feature launch | meaningful new capability | 1-2 weeks | changelog post, in-app announcement, email to segment, docs, one demo |
| T3 Ship | fix or small improvement | hours | changelog line, release note |

Do not T1 everything. A team that launches weekly at T1 has no launches anyone notices.

## 3. Channel plan (owned, dated, measurable)

| Channel | Asset | Owner | Date | Success metric |
|---|---|---|---|---|
| Owned audience | email to 2,400 waitlist | founder | D-1 | 35% open, 8% click |
| Community | Show HN / relevant subreddit / Discord | founder | D0 08:00 PT | 150 upvotes, 40 signups |
| Content | technical deep-dive post | eng | D+2 | 2k reads, 30 signups |
| Partners | 5 integration partners co-post | BD | D+3 | 3 posts live |
| Product | in-app banner + onboarding flow | eng | D0 | 20% activation lift |
| Paid (only after PMF signal) | $500 test on one channel | growth | D+7 | CAC < $150 |

Rules: every channel has one owner and one metric; if a channel cannot be measured, either instrument it or drop it. Do not launch on five channels with no owner for any.

## 4. Pre-launch readiness (blockers)

- [ ] Golden path works for a brand-new account, with real email delivery
- [ ] Billing works end to end (test card → invoice → webhook), refunds documented
- [ ] Onboarding reaches first value without a human (measure: time to first success)
- [ ] Docs, pricing page, and FAQ answer the top 10 objections
- [ ] Status page and support inbox exist and are monitored
- [ ] Analytics fires on signup, activation, and conversion; dashboards exist
- [ ] Rate limits and abuse controls set; spend caps on third-party APIs
- [ ] Legal: ToS, privacy policy, cookie/consent where required, DPA available
- [ ] Rollback: feature flag to disable the launch surface without a deploy

## 5. Launch week rhythm

```
D-7  freeze scope; assets reviewed; support macros written; analytics verified
D-1  final smoke test on production with a fresh account; schedule posts; brief support
D0   publish, post, email, monitor: signups, errors, support queue, on-call rota
D+1  fix top 3 friction points found by real users; reply to every comment
D+3  publish the deep-dive; follow up with everyone who signed up but did not activate
D+7  review metrics; write the retro; decide the next experiment
```

During launch, watch activation not signups. 500 signups with 3% activation is a broken product, not a successful launch.

## 6. Post-launch measurement

```
Traffic → signup     (landing conversion, by channel)
Signup  → activated   (reached first value: define it precisely)
Activated → paid      (conversion, days to convert)
Paid    → retained    (week-4 retention by cohort)
Support load          (tickets per 100 accounts)
```

Write down which channel produced activated users at acceptable CAC, and kill the rest. Reallocate the next month's effort to the winner.

## Anti-patterns

- Launching to nobody because the audience was never built. Build the list before the product.
- A launch post about architecture instead of the customer's problem.
- Counting signups as success with no activation definition.
- Discounting at launch, which anchors the price permanently low.
- No support coverage on launch day.
