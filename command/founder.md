---
description: Route a commercial question (pricing, economics, launch, support, legal readiness) to the founder operator and produce an actionable artifact.
agent: founder-operator
---

# /founder

Question: $ARGUMENTS

If the question is empty, ask for the one commercial decision currently blocking progress.

1. Classify the question and load the matching skill: `product-discovery`, `pricing-packaging`, `unit-economics`, `gtm-launch`, `customer-support-ops`, `founder-legal-basics`.
2. Ask only for facts that change the answer. Where data is missing, use a labelled assumption and show the sensitivity.
3. Give a recommendation with a number attached (price, CAC ceiling, runway, response time, threshold) and the main trade-off.
4. Write the artifact to a file if the user will use it (e.g. `docs/pricing.md`, `docs/launch-plan.md`, `docs/unit-economics.md`), then summarize.
5. For legal, tax, or securities questions: state the boundary plainly and list the specific questions to take to counsel.

Report: decision, why, artifact path, trade-off, next check with date, items for professionals.
