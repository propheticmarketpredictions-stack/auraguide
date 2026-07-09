# arcanum-vault — Strategic Upgrades

**What it is:** Moderated two-sided "underground knowledge" classifieds on Base44. Users browse/submit secrets (teaser + full content), rate, tip, and request paid meetups; a Bazaar sells gear; admin console approves/rejects.
**Stack:** React 18 + Vite SPA, @base44/sdk entities, shadcn/ui, TanStack Query. No backend functions of its own. Stripe libs installed but unused.
**Maturity:** early. **Risk:** high — all trust lives in the browser (aggregates forged via client `Secret.update`, admin gate is a client role check), zero tests, sensitive content domain.

---

## Quick win — Lock the write surface + purge foreign scripts

| | |
|---|---|
| **Impact** | Kills the "any visitor can forge views/ratings/tips" hole at the data layer, and removes token-reading deck scripts that don't belong here. Biggest risk cut per hour of work. |
| **Effort** | S (<1 day) |
| **Dependencies** | Base44 entity permission rules (RLS) in the app dashboard; git access. |
| **Risks** | Over-tight rules break legit flows (author edits, admin approve). Rating/view UI silently stops writing until the medium upgrade lands — acceptable, they're vanity numbers today. |
| **Validation** | An unauthenticated or non-owner `Secret.update` (tip_total/view_count/rating) returns 403 in prod; `git ls-files bin/` is empty. |

First 3 steps:
1. `git rm -r bin/` (deck/ask/anchor scripts live in their own ops repo), commit.
2. In Base44, set entity rules: `Secret` update = creator or admin only; `Tip`/`MeetupRequest` create = authenticated, read = involved parties + admin; `Listing` update = creator or admin.
3. Smoke-test: submit, rate, tip, admin approve as three different users; confirm forbidden writes fail.

---

## Medium — Server-side aggregates + real moderation transitions

| | |
|---|---|
| **Impact** | Makes view counts, rating averages, and tip totals trustworthy (currently browser-computed at SecretDetail.jsx:40-59) and makes approve/reject an auditable server action instead of a client status write. Prereq for any money. |
| **Effort** | M (3-7 days) |
| **Dependencies** | Quick win (permissions); Base44 backend functions (`base44/functions/`). |
| **Risks** | First backend-functions work in this repo — learning curve; migration of existing aggregate values; rating dedupe needs a new `Rating` entity (one row per user per secret). |
| **Validation** | Grep shows zero `Secret.update` calls from pages/components; rating the same secret twice from one account changes the average only once; approve/reject writes a review-log row with reviewer id + timestamp. |

First 3 steps:
1. Add `base44/functions/`: `recordView`, `rateSecret`, `tipSecret`, `moderate` (secrets + listings, with review note + audit row).
2. Add `Rating` entity (user_id, secret_id, value, unique per pair); recompute average server-side.
3. Swap SecretDetail/AdminReview to call functions; deny direct client writes to aggregate fields.

---

## Medium — AI-assisted moderation triage for high-risk content — **SHARED**

**SHARED platform upgrade:** build once, apply to every Base44 app with a pending/approved/rejected queue (~several of the 30). Described once here because arcanum-vault is the highest-legal-exposure consumer (tech exploits, chemicals, "forbidden science").

| | |
|---|---|
| **Impact** | Cuts admin review time and legal exposure: every submission gets an automatic risk score + policy category before a human sees it; auto-hold clearly illegal instructions. |
| **Effort** | M (1-2 weeks for the shared service; ~1 day per app to adopt) |
| **Dependencies** | Server-side functions (above); the existing Venice AI proxy (~/aiproxy) as the LLM layer; a written content policy per category. |
| **Risks** | False positives frustrate submitters; LLM cost per submission; policy wording is a product/legal decision, not a code one. |
| **Validation** | 100% of new pending items carry a risk score + suggested action; median admin decision time drops; zero prohibited-content items reach "approved" in a red-team batch. |

First 3 steps:
1. Write a one-page content policy per category (what's teaser-ok, what's auto-reject).
2. Build a shared `moderationTriage` function: submission text -> Venice AI -> {risk_score, policy_flags, suggested_action} stored on the entity.
3. Surface score + flags in AdminReview, sorted riskiest-first; auto-hold above a threshold.

---

## Long term — Real money: shared Stripe payments service + ledger — **SHARED**

**SHARED platform upgrade:** one server-side payments service (Stripe Checkout/Connect + a WalletEvent ledger) built once for all ~30 apps; arcanum-vault plugs tips and meetup deposits into it. Do not build Stripe inside this repo.

| | |
|---|---|
| **Impact** | Turns fake entity-row "payments" into revenue: real tips, paid meetup deposits held in escrow, author payouts. This is the product's business model. |
| **Effort** | XL platform (months incl. Connect onboarding, webhooks, refunds); L for this app's adoption. |
| **Dependencies** | Both medium upgrades (trust-nothing-client model, moderation); Stripe account + Connect for payouts; platform WalletEvent contract; legal review of paying for this content category (Stripe prohibited-business list is a real constraint here). |
| **Risks** | Stripe may refuse the vertical — validate with Stripe support before building; chargebacks on "knowledge" purchases; in-person meetup payments carry safety/liability weight (consider dropping or heavily gating meetups). |
| **Validation** | A test-mode tip produces: Stripe charge, WalletEvent row, updated server-computed tip_total, and author balance — all reconciling to the cent; webhook replay is idempotent. |

First 3 steps:
1. Confirm with Stripe that the content vertical is acceptable (do this before any code).
2. Define the platform WalletEvent ledger contract (charge, refund, payout, escrow-hold) in workspace-contracts.
3. Build the shared checkout + webhook function pair; wire arcanum tips as the first consumer, entity rows become read models of the ledger.

---

## Moonshot — Trust-graded knowledge marketplace (pay-to-unlock)

| | |
|---|---|
| **Impact** | Redefines the product from a tip jar into a marketplace: teasers free, full content unlocked per-secret or via subscription; authors earn revenue share; verification tiers ("tested by N buyers", money-back flag) create the trust layer no competitor in this niche has. |
| **Effort** | XL (months, after payments land) |
| **Dependencies** | Payments service + ledger; server-side content gating (full `content` field must never reach an unentitled client — today it ships in every entity read); moderation triage; reviewer/reputation system. |
| **Risks** | Paying for "forbidden knowledge" sharpens the legal exposure — needs curation toward legal-but-edgy (survival, DIY, historical occult) and hard bans elsewhere; refund abuse (content can't be un-seen); marketplace cold start. |
| **Validation** | Unlock conversion rate on teasers >2-3%; repeat-purchase rate; refund rate under a set threshold; author retention month over month. |

First 3 steps:
1. Move full `content` behind an entitlement-checked function (teaser public, body gated) — this is valuable even pre-payments.
2. Add `Unlock` entity + price field on Secret; simulate purchases with ledger test mode.
3. Pilot with 10 curated, legally-clean secrets and measure teaser->unlock conversion.

---

## Integration ready — Adopt the shared platform contracts — **SHARED contracts, local adoption**

The contract definitions (UserRef, UsageEvent, WalletEvent, Signal, ModerationItem) are a one-time platform deliverable in workspace-contracts; the per-repo work below is arcanum-vault's adoption slice. The manifest already flags this repo merge-candidate.

| | |
|---|---|
| **Impact** | Makes the merge cheap: views/ratings become UsageEvents, tips become WalletEvents, the pending/approved/rejected queue becomes the shared ModerationItem shape, `created_by` strings become UserRefs. One moderation console and one payments ledger can then serve arcanum + Prism + siblings. |
| **Effort** | M (after the medium server-side work; mostly mapping, not invention) |
| **Dependencies** | Server-side functions upgrade (events must be emitted server-side or they're forgeable); contract schemas frozen in workspace-contracts; shared observability sink (even a simple events table + pm2 log shipping on the VPS). |
| **Risks** | Premature freezing: contracts should be validated against 2-3 sibling apps' shapes before arcanum migrates; dual-write period needs a cutover plan. |
| **Validation** | Every view/rate/tip/moderation action in arcanum emits a schema-valid UsageEvent/WalletEvent/ModerationItem; a cross-app dashboard reads arcanum events with zero app-specific code. |

First 3 steps:
1. Diff arcanum's 4 entities against Prism's and one other sibling's; extract the common Listing/ModerationItem/Tip shapes into workspace-contracts schemas.
2. Emit UsageEvent (view, rate) and WalletEvent (tip, fake for now) from the new server functions, dual-writing alongside current fields.
3. Add a `contract-version` field to entities and a CI check (shared) that validates emitted events against the schemas.

---

## Sequence

1. Quick win (permissions + bin/ purge) — now.
2. Server-side aggregates/moderation — unblocks everything.
3. Contract adoption + AI triage — in parallel.
4. Payments (after Stripe vertical check) -> then the pay-to-unlock moonshot.
