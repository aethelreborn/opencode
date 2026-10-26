---
name: founder-legal-basics
description: Use when starting a company, signing a contract, adding a privacy policy or terms, open-sourcing code, hiring a contractor, or shipping a product that stores user data. Gives the founder checklist and the questions to bring to a lawyer. This is not legal advice and does not replace counsel.
---

# Founder Legal Basics

> **Not legal advice.** This is an engineering-grade checklist of what to have and what to ask. Entity choice, contracts, and employment law are jurisdiction-specific; engage a lawyer for anything binding. Where a decision is irreversible or expensive, stop and get counsel.

## 1. Entity and ownership

- [ ] Entity formed in a sensible jurisdiction (US: Delaware C-corp if raising venture; LLC for cash-flow businesses; local equivalent elsewhere)
- [ ] Founders' equity split agreed **in writing** before building
- [ ] IP assignment signed by every founder, employee, and contractor (without it, the company may not own its code)
- [ ] Vesting with a cliff (typical: 4 years, 1-year cliff) — including founders
- [ ] Cap table in one place; option pool sized before the first raise
- [ ] Bank account + accounting separate from personal from day one
- [ ] EIN/tax registration and any sales-tax/VAT registrations where you have customers

Sole proprietorship + a customer contract is a personal liability event. Form the entity before signing revenue.

## 2. Contracts you will be asked to sign

| Document | Watch for | Ask counsel when |
|---|---|---|
| Customer MSA/ToS | liability caps, SLA credits, data processing, auto-renewal, termination for convenience | enterprise deal > $25k or unlimited liability requested |
| DPA | subprocessors, breach notification window, data location, deletion on exit | customer stores regulated data |
| Contractor agreement | IP assignment, confidentiality, no employment misclassification | always, once |
| Employment offer | equity terms, IP, non-compete enforceability | always |
| SaaS vendor | data ownership, export rights, price escalation, exit | data is core to the product |
| Investor docs (SAFE/term sheet) | valuation cap, discount, pro-rata, MFN, liquidation preference | always |

Never sign a contract with an uncapped indemnity for third-party IP claims without counsel. Never accept "we'll send the paperwork later" for equity or IP.

## 3. Product surface: what you must publish

- **Terms of Service**: what the service is, acceptable use, billing and refunds, termination, liability limits, governing law.
- **Privacy Policy**: what you collect, why (legal basis), where it is stored, who you share it with (subprocessors), retention, deletion, contact. Must match reality — read your own database schema and analytics config against it.
- **Cookie/consent** where required (EU/UK): consent before non-essential tracking, with a reject option as easy as accept.
- **DPA** template for business customers; list subprocessors publicly.
- **Security page** if selling to businesses: encryption, access control, backups, incident contact.
- **Accessibility statement** where legally relevant (public sector, EU EAA).

Data minimization is both a legal and an engineering requirement: if you do not need the field, do not collect it. It cannot leak.

## 4. Privacy engineering checks

```bash
# find PII you may not have documented
rg -n 'email|phone|address|ssn|tax_id|birth|ip_address' --type-add 'code:*.{ts,tsx,py,go,rb,sql}' -t code | head -40

# retention: is there any delete path?
rg -n 'DELETE FROM|deleteMany|destroy\(|\.delete\(' src | head -20
```

- [ ] Account deletion actually deletes or anonymises, including backups (state the window)
- [ ] Data export exists (GDPR portability)
- [ ] Logs do not contain PII (see `observability-instrumentation`)
- [ ] Third-party analytics/error tools are listed as subprocessors and configured to minimize data
- [ ] Secrets in a manager, not in `.env` committed to git; rotate anything that leaked

## 5. Open source and licensing

- [ ] Dependency licenses compatible with your business model (`dependency-supply-chain` has the gate)
- [ ] Your own repo has a LICENSE file; without one, nobody may legally use it
- [ ] Contributing guidelines + DCO/CLA if you accept outside contributions
- [ ] No GPL/AGPL code copied into a proprietary product without counsel's sign-off
- [ ] Third-party assets (fonts, icons, datasets) have documented rights
- [ ] Trademark search before naming; secure the domain and the handle

## 6. Hiring and contractors

- [ ] Written agreement with IP assignment, confidentiality, and payment terms
- [ ] Correct classification (employee vs contractor) for the jurisdiction
- [ ] Equity paperwork issued and reflected in the cap table, with tax filings
- [ ] Access provisioning: least privilege, offboarding checklist, SSO where possible

## 7. When to call a lawyer (do not DIY)

- Raising money, issuing equity, or granting options
- Enterprise contracts, DPAs with regulated data, or any uncapped liability
- Employment termination, immigration, or equity disputes
- A data breach or a regulator inquiry
- Anything where the downside is your personal assets

Budget guidance: a startup legal package (formation + standard ToS/privacy + IP assignment) is typically a few thousand dollars — cheaper than one badly-signed enterprise contract.

## Deliverable

```markdown
# Legal readiness — <company>

Entity: <type>, <jurisdiction>, formed <date>; cap table in <tool>
IP: assignments signed by <N>/<N> contributors (missing: <names>)
Customer docs: ToS v<x>, Privacy v<x>, DPA template — reviewed <date> by <counsel>
Data: PII inventory <link>; deletion path verified <date>; subprocessors listed <link>
OSS: license <x>; dependency gate <command> passing; no copyleft in product
Open questions for counsel: <list with urgency>
```
