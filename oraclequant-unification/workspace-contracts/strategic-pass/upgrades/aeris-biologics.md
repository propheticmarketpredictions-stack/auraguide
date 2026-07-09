# aeris-biologics — Strategic Upgrades

**What it is:** Base44 React storefront + education site for herbal lung-health supplements. Product grid (Product entity), in-memory cart drawer, markdown article library (Resource entity), 4-phase lung-recovery protocol page. No backend functions, no real checkout (Stripe deps unused).
**Stack:** React 18 + Vite 6, Base44 SDK, TanStack Query, Tailwind/Radix. Vendored Deck CLI in `bin/` (belongs to the deck workspace).
**Maturity:** early. **Risk:** medium — zero tests, cart can't take money, unverified health claims, and `bin/ask`/`bin/anchor` read a mesh token from `<repo>/.token` which `.gitignore` does not cover.

---

## Quick win

### 1. Kill the token-leak vector, evict the Deck CLI
- **Impact:** Removes the one path where `git add -A` publishes the mesh proxy token or AI conversation logs to GitHub. Also stops per-app drift of Deck tooling.
- **Effort:** S (under an hour)
- **Dependencies:** Deck CLI must already live in its canonical repo (it does — `bin/` hardcodes `/home/coder/deck`); consume from PATH.
- **Risks:** Something on the VPS may call this repo's `bin/` copies; grep cron/pm2/scripts first.
- **Validation:** `git ls-files | grep -E '\.token|^projects/|^bin/'` returns nothing; `.gitignore` has `.token` and `projects/`; deck commands still work from PATH.
- **First 3 steps:**
  1. Add `.token`, `projects/`, and `*.token` to `.gitignore` (do this even before removing bin/).
  2. `grep -r "aeris-biologics/bin" ~ --include="*.sh"` + check pm2/cron for references.
  3. `git rm -r bin/` with a commit noting the canonical deck repo location.

### 2. Persist the cart (localStorage)
- **Impact:** Cart currently dies on refresh — the single cheapest conversion fix once checkout exists, and useful groundwork now.
- **Effort:** S
- **Dependencies:** None.
- **Risks:** Stale prices in stored carts; re-fetch Product on load and reconcile.
- **Validation:** Add item, hard-refresh, cart intact; price reflects current Product entity.
- **First 3 steps:**
  1. Read `CartDrawer.jsx` / cart state (likely in `AppLayout.jsx`) to find the store.
  2. Wrap cart state in a `useLocalStorage`-style hook keyed `aeris:cart:v1` storing product IDs + qty only.
  3. On mount, re-fetch products via TanStack Query and drop IDs that no longer exist.

## Medium

### 3. SHARED — Stripe Checkout as a shared Base44 function
- **SHARED PLATFORM UPGRADE.** Build once, consume from every Base44 storefront (aeris, Prism, future template apps). Do not implement checkout inside this repo.
- **Impact:** Turns aeris (and Prism) from brochures into shops. One PCI/webhook surface instead of N.
- **Effort:** M (a week including webhook + order entity)
- **Dependencies:** Stripe account; a shared `Order`/`LineItem` entity contract in workspace-contracts; Base44 backend functions.
- **Risks:** Base44 function limits on webhooks; refunds/tax scope creep — start with one-time payments, defer subscriptions.
- **Validation:** Test-mode purchase end-to-end produces an Order entity + Stripe payment intent; same function code deployed to two apps.
- **First 3 steps:**
  1. Define the checkout contract in workspace-contracts: `createCheckoutSession({items[], successUrl, cancelUrl}) -> url`, plus Order schema.
  2. Implement as a Base44 function in one canonical repo; wire Prism first (it is further along), aeris second.
  3. In aeris, replace the dead Stripe deps with a "Checkout" button calling the shared function; delete `@stripe/react-stripe-js` (not needed for hosted Checkout).

### 4. Health-claims compliance pass
- **Impact:** "Respiratory restoration" / smoker-recovery copy is classic FDA warning-letter territory for supplements. Fix before any paid traffic — this is existential for the product, not polish.
- **Effort:** M (2-4 days: audit copy, rewrite, add structure)
- **Dependencies:** None technical. Research current DSHEA structure/function-claim rules first (do not trust memory).
- **Risks:** Softer claims may cut conversion; that is the correct tradeoff. Not legal advice — flag for real review before scale.
- **Validation:** Every product and Resource page carries the FDA disclaimer; no disease-treatment claims ("treats", "cures", "restores lung function") remain in Product entity, Resource markdown, or Protocol page.
- **First 3 steps:**
  1. Grep src/ + Resource entity content for claim language; build a findings list.
  2. Add a site-wide DSHEA disclaimer component in `AppLayout.jsx` and per-product disclaimer in `ProductCard.jsx`.
  3. Rewrite Protocol page framing from "recovery/restoration" to structure/function language ("supports respiratory health").

## Long term

### 5. SHARED — One commerce core, many themed storefronts
- **SHARED PLATFORM UPGRADE.** aeris's Product (name/price/ingredients/category/subscription) and Resource (markdown CMS) schemas duplicate Prism's shape. Extract a shared catalog + cart + checkout + content package that all ~30 Base44 apps consume; each app keeps only theme, copy, and entity data.
- **Impact:** New storefront in days not weeks; one place to fix cart/checkout/SEO bugs; aeris shrinks to a theme + content.
- **Effort:** XL (months, incremental)
- **Dependencies:** Upgrade 3 (shared checkout) landed; workspace-contracts as the schema source of truth; a versioning/publishing story for the shared package (npm workspace or git subtree, given Base44's sync model).
- **Risks:** Base44's per-app codegen may fight a shared package — validate the import path early with one component. Premature abstraction: extract from two real apps (aeris + Prism), not speculation.
- **Validation:** aeris and Prism both render catalog + cart from the same package version; a schema change lands in both via one PR.
- **First 3 steps:**
  1. Diff aeris `base44/entities/Product.jsonc` against Prism's product schema; write the unified schema into workspace-contracts.
  2. Extract `ProductCard` + `CartDrawer` + cart hook into a shared package; consume in aeris only.
  3. Migrate Prism to it; only then declare the contract stable.

## Moonshot

### 6. Adaptive protocol coach (protocol-as-a-product)
- **Impact:** Redefines aeris from supplement brochure to guided-program product: user signs up, gets the 4-phase protocol as a day-by-day plan with check-ins, symptom tracking, and an AI coach (Venice proxy) that adapts pacing and suggests the right product/phase bundle. Subscription revenue tied to program progress, not just pills. This is the only durable moat — copy and catalog are commodity.
- **Effort:** XL
- **Dependencies:** Shared auth + UserRef (upgrade 7), checkout with subscriptions (upgrade 3 phase 2), Venice proxy access from Base44 functions, and upgrade 4 first — an AI coach making health claims multiplies compliance risk.
- **Risks:** Health-adjacent AI advice is a regulatory and safety minefield; constrain the coach to protocol logistics and general wellness language, hard-block medical questions. Retention product needs notifications Base44 may not offer (email fallback).
- **Validation:** Cohort metric: % of signups still checking in at day 30; protocol-subscriber LTV vs one-off buyers.
- **First 3 steps:**
  1. Model `ProtocolEnrollment` + `CheckIn` entities (user, phase, day, symptoms, adherence).
  2. Turn the static Protocol page into an enrolled/unenrolled view with a daily checklist — no AI yet.
  3. Prototype the coach as a Base44 function proxying Venice with a locked system prompt + claim-safe guardrails; test with 5 users.

## Integration ready

### 7. SHARED — Adopt platform contracts: auth, UserRef, UsageEvent, observability
- **SHARED PLATFORM UPGRADE.** Define once in workspace-contracts, then wire every Base44 app the same way; aeris is a low-risk pilot because it has only 2 entities and no auth today (`requiresAuth: false` in `base44Client.js`).
- **Impact:** Moves aeris into the merged platform: one identity across apps, cross-app usage analytics (UsageEvent), purchases as WalletEvents, email-signup and cart activity emitted as Signals. Kills the client-side-only email signup.
- **Effort:** M for aeris once contracts exist; L for the contract definitions themselves.
- **Dependencies:** workspace-contracts schemas for UserRef/UsageEvent/WalletEvent/Signal; decision on identity provider (Base44 built-in auth vs shared service); shared secrets pattern (Base44 env, never repo files — reinforces upgrade 1).
- **Risks:** Requiring login on a content site kills top-of-funnel — keep browsing anonymous, auth only at cart/protocol enrollment. Event schema churn: version events (`v1`) from day one.
- **Validation:** A page view / add-to-cart / signup in aeris appears in the shared UsageEvent store with a resolvable UserRef; same emitter module runs unmodified in Prism.
- **First 3 steps:**
  1. Land UserRef + UsageEvent v1 schemas in workspace-contracts (fields: app_id, user_ref, event_type, payload, ts).
  2. Build a tiny shared `emitEvent()` client module; call it from aeris page views and cart actions.
  3. Flip `requiresAuth` behavior to optional-auth: anonymous browse, Base44 login at checkout/enrollment, mapping session → UserRef.

---

**Suggested order:** 1 → 2 → 4 → 3 → 7 → 5 → 6. Do the 30-minute token fix today.
