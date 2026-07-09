# bridgeconnect — Strategic Upgrades

**What it is:** Community mutual-support app (in-app brand "CommonGround", repo name BridgeConnect): member profiles, private DMs, meetings with democratic speaker voting, and a categorized resource directory (housing, jobs, food, mental health, legal, education).
**Stack:** React 18 + Vite 6, Tailwind/Radix (49 ui components), @base44/sdk 0.8 (`requiresAuth: false`), 4 entities, no server functions, no tests, no CI. 11 unrelated deck bash scripts in `bin/`.
**Maturity:** early. **Risk:** high — `Messages.jsx` lists ALL Message records and filters client-side, so DM privacy rests entirely on unverified Base44 entity rules. Vulnerable audience (mental-health/housing help) makes this severe.

---

## Quick wins (<1 day each)

### 1. Close the DM privacy hole with entity-level rules — HIGHEST LEVERAGE
- **Impact:** Today any signed-in (or possibly anonymous, given `requiresAuth: false`) client can call `Message.list()` and read everyone's private DMs. For an app serving people seeking mental-health and housing help, this is the one thing that must be true before anyone real uses it. Setting Base44 entity security rules (Message readable only by sender/recipient, writable only with `sender_id == auth user`) plus `requiresAuth: true` in `src/api/base44Client.js` closes it without writing a backend.
- **Effort:** S
- **Dependencies:** Base44 dashboard access to set entity rules; verify the SDK subscribe channel respects the same rules.
- **Risks:** Client-side filter in `loadMessages()` will silently show fewer rows if rules are wrong — must test with two real accounts, not one. Realtime `Message.subscribe` may bypass rules; if it does, drop it for polling until upgrade 3.
- **Validation:** Log in as account B, run `base44.entities.Message.list()` in the console: zero rows from A↔C conversations. Anonymous session cannot list Members or Messages at all.
- **First 3 steps:**
  1. In Base44 app settings, set Message rules: read = `sender_id == user.id || recipient_id == user.id`; create = `sender_id == user.id`; no update/delete by non-owner.
  2. Flip `requiresAuth: false` → `true` in `base44Client.js`; confirm login redirect still works.
  3. Two-account test: A DMs C, B lists messages and subscribes; confirm B sees nothing.

### 2. Evict deck `bin/` scripts + `.token` gitignore hygiene — SHARED
- **Impact:** SHARED across ~30 Base44 repos (same play as auraguide/ai-workspace). 11 orchestration scripts (bus/ask/relay/anchor/rollback) live in this product repo; `bin/ask` reads a mesh proxy token from `<repo>/.token`, which `.gitignore` does NOT exclude — a live accidental-commit path for a secret. Remove the scripts (canonical copies exist in the deck workspace) and add `.token` to the shared gitignore template.
- **Effort:** S
- **Dependencies:** Canonical deck repo confirmed; shared `.gitignore` template in workspace-contracts.
- **Risks:** Something on the VPS may invoke this copy — grep pm2/cron/shell profiles first.
- **Validation:** `git ls-files bin/` empty; `.token` in `.gitignore` of every Base44 repo; deck workflows still run from the canonical checkout.
- **First 3 steps:**
  1. `grep -rn "bridgeconnect/bin" ~ 2>/dev/null` + check `pm2 ls` and crontab for references.
  2. `git rm -r bin/` after diffing against the canonical deck copies.
  3. Add `.token` to the shared gitignore template and roll it out portfolio-wide.

---

## Medium (days–2 weeks)

### 3. Server-side messaging + vote integrity functions
- **Impact:** Entity rules (upgrade 1) stop reads, but writes are still client-authored: `sender_id`, `sender_name`, meeting attendee lists, and speaker vote counts are all mutated from the browser and trivially forgeable. A small set of Base44 backend functions — `sendMessage`, `listMyConversations`, `voteSpeaker`, `rsvpMeeting` — derives identity from the auth token server-side, enforces one-vote-per-member, and gives the client a stable API instead of raw entity mutation. This is also the app's first real contract for the platform merge.
- **Effort:** M
- **Dependencies:** Upgrade 1 done (rules as defense-in-depth under the functions).
- **Risks:** Base44 function cold-start latency on DM send (mitigate with optimistic UI); migration of existing Message rows is trivial (schema unchanged).
- **Validation:** Crafted `Message.create` with a spoofed `sender_id` is rejected; double-voting a speaker from the console fails; DM send p95 under ~1s with optimistic rendering.
- **First 3 steps:**
  1. Write `base44/functions/messages.ts` with `send` (derives sender from auth) and `listMine` (server-filtered, paginated); point `Messages.jsx` at it and delete the list-all-and-filter code.
  2. Write `meetings.ts` with `vote`/`rsvp` enforcing membership + one vote per user.
  3. Lock entity rules down further: no direct client `create` on Message/Meeting once functions are live.

### 4. Product identity + trust basics: one brand, onboarding, report/block
- **Impact:** Repo says BridgeConnect, UI says CommonGround, README is the Vite template — nobody (including future-you) knows what this product is. Pick one name, write a 10-line real README stating the audience and scope, and ship the two trust features a mutual-support community cannot launch without: block a member (hides their DMs/profile from you) and report content (writes a Report entity an admin can review). Cheap now, existential before real users in this demographic.
- **Effort:** M
- **Dependencies:** None; report queue admin view can be a simple filtered list page gated to admin role.
- **Risks:** Naming decision needs the founder (you) — options: keep CommonGround (rename repo) or keep BridgeConnect (rebrand UI). Don't let it stall the trust features.
- **Validation:** Repo, Base44 app name, and UI all match; blocked member's messages no longer render for the blocker; a report round-trips to an admin list.
- **First 3 steps:**
  1. Decide the name; rename repo or update `Layout`/copy accordingly; replace template README with purpose/audience/entities/run instructions.
  2. Add `Block` and `Report` entities (or fields) + a "block / report" menu on member cards and messages.
  3. Add an admin-only Reports page listing open reports with resolve action.

---

## Long term (months)

### 5. Extract the Community Core as the portfolio's shared social layer — SHARED
- **Impact:** SHARED. Member/Message/Meeting/Resource here is a generic community layer that any social-ish app in the ~30-app portfolio will re-invent (profiles, DMs, events, directories). Extract it once: a shared entity contract set + a small package of headless hooks/components (`useConversation`, `useMeeting`, member card, message thread) versioned in workspace-contracts, backed by the server functions from upgrade 3. bridgeconnect becomes the reference implementation instead of one of N divergent copies.
- **Effort:** L
- **Dependencies:** Upgrades 1+3 (secure contract worth sharing); workspace-contracts repo as the schema home; at least one second consuming app to prove reuse.
- **Risks:** Premature abstraction if no second app actually needs it — gate the extraction on a confirmed second consumer; Base44 per-app entity isolation may force a "shared schema, per-app data" model rather than one shared datastore.
- **Validation:** A second Base44 app renders a working DM thread using only the shared package + contract, zero copied page code; schema changes land in one place and propagate.
- **First 3 steps:**
  1. Write `community-core.md` contract in workspace-contracts: canonical Member/Message/Meeting/Resource JSON schemas + function signatures from upgrade 3.
  2. Refactor bridgeconnect pages to consume a local `src/community/` module shaped exactly like the future package.
  3. Pick the second consumer app and lift `src/community/` into a shared package (git subtree or npm workspace) when it signs on.

---

## Moonshot

### 6. CommonGround as multi-tenant "community-in-a-box" with AI needs↔offers matching
- **Impact:** Redefines the product from one generic community app into a white-label platform any real-world support org (recovery groups, churches, tenant unions, mutual-aid networks) can stand up in minutes: their own space, meetings with the existing democratic speaker voting, and a resource directory that becomes a live mutual-aid marketplace — members post needs ("moving help Saturday", "resume review") and offers, and an LLM matcher (via the platform's shared LLM proxy) suggests matches and drafts the intro DM. The voting + resources + DM primitives already in this repo are exactly the substrate; tenancy and matching are the leap. This is the only app in the portfolio pointed at community organizations as paying customers.
- **Effort:** XL
- **Dependencies:** Upgrades 1, 3, 5 (secure, contract-driven core); shared LLM proxy + UsageEvent metering from the platform pass; a moderation story per tenant (upgrade 4's report/block, elevated to tenant admins).
- **Risks:** Multi-tenancy on Base44 may exceed the platform (per-tenant data isolation) — may force graduation to a FastAPI backend on the VPS with Base44 as frontend only; matching vulnerable people carries real safety duty (human confirm before intro, no auto-sharing of location/phone).
- **Validation:** Two pilot orgs onboarded self-serve with isolated data; ≥30% of posted needs get a member-accepted match within 72h; a tenant admin resolves a report without your involvement.
- **First 3 steps:**
  1. Add `community_id` to all four entities and a Community entity; scope every query/function by it.
  2. Split Resource into `Need`/`Offer` posts with status lifecycle (open → matched → fulfilled).
  3. Prototype the matcher as a server function: embed/score open needs vs offers within a community, surface top-3 suggestions to a coordinator for human-confirmed intros.

---

## Integration-ready (platform merge)

### 7. Adopt the shared platform contracts: auth, UserRef, UsageEvent, observability — SHARED
- **Impact:** SHARED — done once, applied per-app in hours. bridgeconnect currently has its own ad-hoc identity (`Member.user_id` string copied around, denormalized `sender_name`/`recipient_name` on every message) and zero telemetry. Conforming it means: `requiresAuth: true` against the portfolio's shared auth; Member/Message reference a canonical `UserRef` (id + display fields resolved at render, not written into rows); every meaningful action (dm_sent, meeting_rsvp, vote_cast, resource_added, report_filed) emits a standard `UsageEvent`; errors/latency ship to the shared observability sink; secrets follow the shared pattern (nothing like `.token` in-repo). This is what makes upgrade 5's shared community core mergeable instead of just co-located, and gives you the first real usage data on whether this merge-candidate deserves to live.
- **Effort:** M (per app, after the SHARED platform pieces exist)
- **Dependencies:** Platform-pass definitions of UserRef/UsageEvent schemas and the shared auth + observability endpoints; upgrade 3's functions are the natural single emit-point for events.
- **Risks:** Renaming/reshaping `user_id` → UserRef touches every page — do it inside the upgrade-3 function layer so the client barely changes; event emission must never block or leak DM content (metadata only, no message bodies).
- **Validation:** A `UserRef` from another portfolio app resolves to the same person here; UsageEvents from bridgeconnect appear in the shared dashboard within a minute of the action; secret scan of the repo is clean.
- **First 3 steps:**
  1. Map current fields to the shared contracts: `Member.user_id` → `UserRef.id`; drop denormalized names from Message writes (resolve at render).
  2. Add a tiny `emitUsageEvent()` helper inside the upgrade-3 server functions covering the 5 core actions (metadata only).
  3. Point the app at shared auth (`requiresAuth: true` + platform login flow) and register it in the shared observability sink; verify events flow end-to-end.

---

## Sequence at a glance

1 (privacy rules) → 2 (evict bin/) → 3 (server functions) → 4 (identity + report/block) → 7 (platform contracts) → 5 (shared community core) → 6 (multi-tenant moonshot).
Nothing user-facing ships to real people before 1 and 3 are done.
