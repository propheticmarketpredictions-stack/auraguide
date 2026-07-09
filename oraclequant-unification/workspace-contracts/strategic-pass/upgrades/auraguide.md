# auraguide — Strategic Upgrades

**What it is:** Consumer "what's on now" TV/streaming guide. One page (`src/pages/Guide.jsx`) asks Gemini (via Base44 `Core.InvokeLLM`, `add_context_from_internet: true`) to invent top-25 picks per service (Netflix, Hulu, Max, Prime, Apple TV+, Peacock, Paramount+, Disney+, Pluto, Live TV) plus a date/hour "future schedule". Profile (name, birthday, location) lives in localStorage and is injected into prompts. Donation banner for revenue.
**Stack:** React 18 + Vite 6, Tailwind/Radix, @base44/sdk 0.8 (`requiresAuth: false`), no server functions, no tests, no CI. Standard Base44 template dep bloat. 11 unrelated deck bash scripts in `bin/`.
**Maturity:** early. **Risk:** medium — open client-side LLM spend, hallucinated listings with no disclaimer, no error handling (failed call = stuck spinner), PII in prompts.

---

## Quick wins (<1 day each)

### 1. Truth label + error handling + Refresh cooldown
- **Impact:** Fixes the two things a first real user hits: a failed `InvokeLLM` leaves loading state stuck forever (no try/catch in `fetchService`/`fetchSchedule`), and listings look authoritative but are LLM guesses. Cooldown blunts one-click credit burn from the Refresh button.
- **Effort:** S
- **Dependencies:** None.
- **Risks:** None; disclaimer may slightly reduce perceived polish — better than a trust blowup.
- **Validation:** Kill network mid-fetch → UI shows retry card, not eternal spinner. Disclaimer visible on every listing view. Refresh disabled 60s after use.
- **First 3 steps:**
  1. Wrap both fetches in try/catch/finally; add `error` state + retry button; `finally { setLoading(false) }`.
  2. Add a persistent footer/badge: "Listings are AI-generated and may be inaccurate — verify before you tune in."
  3. Add a 60s cooldown timestamp per service on Refresh; disable button and show countdown.

### 2. Evict the deck `bin/` scripts (pre-merge hygiene)
- **Impact:** 11 orchestration scripts (bus/ask/relay/anchor/rollback) that read a mesh proxy token from disk don't belong in a consumer app repo. Removing them unblocks the planned platform merge and ends product/tooling entanglement.
- **Effort:** S
- **Dependencies:** Canonical deck repo exists (see ai-workspace.md upgrade 2 — same SHARED consolidation).
- **Risks:** Something may invoke this copy — grep pm2/cron/shell profiles first.
- **Validation:** `git ls-files bin/` empty; deck workflows still run from the canonical checkout.
- **First 3 steps:**
  1. `grep -rn "auraguide/bin" ~ 2>/dev/null` + check `pm2 ls` and crontab.
  2. Confirm scripts are identical to the canonical deck copies (diff), then `git rm -r bin/`.
  3. Commit with a pointer note to the canonical deck repo.

---

## Medium (days–2 weeks)

### 3. Server-side cached guide: one LLM call per service-hour, shared by all users
- **Impact:** Kills the open-spend hole (client calls `InvokeLLM` directly with `requiresAuth: false` — anyone with the URL burns credits). A Base44 server function generates each service's top-25 once per hour and serves it from cache: cost drops from O(users × tabs) to O(10/hour), tabs load instantly, and abuse hits a cache, not the model. Personalization (name/age/location) stays as a light client-side re-rank or a second cheap personalized pass.
- **Effort:** M
- **Dependencies:** SHARED LLM proxy pattern (upgrade 6) — build the auth/rate-limit/metering wrapper once, this repo is customer #1 or #2 of it.
- **Risks:** Cache staleness for "live now" claims (acceptable at 30–60 min TTL); moving PII server-side needs the same care as client-side (strip birthday, send age bracket only).
- **Validation:** LLM invocations/day flat as DAU grows; p50 tab load <300ms from cache vs ~5-10s today; direct client `InvokeLLM` path removed from bundle.
- **First 3 steps:**
  1. Create `base44/functions/guide.ts`: takes `serviceId`, checks a `GuideSnapshot` entity for a fresh row (TTL 60 min), else invokes LLM and stores it.
  2. Point `fetchService` at the function; delete direct `Core.InvokeLLM` usage from the client.
  3. Add per-caller rate limit (e.g. 30 req/hr) and log one UsageEvent per LLM invocation (schema from upgrade 6).

---

## Long term (months)

### 4. Ground listings in real data; LLM only ranks and explains
- **Impact:** Removes the existential product flaw: every listing today is a hallucination, including future-dated "schedules" the model cannot know. Feed real catalog/EPG data (TMDB trending + a streaming-availability API for on-demand; TVmaze or Gracenote for live/schedule), then use the LLM for what it's good at — personalization, one-line pitches, "because you liked X". The schedule view becomes real; trust becomes the moat instead of the liability.
- **Effort:** L
- **Dependencies:** API selection + keys (TMDB is free; Streaming Availability API ~cheap; Gracenote costs real money — start free-tier). Server-side function layer from upgrade 3.
- **Risks:** API coverage gaps per service (Pluto live schedules are hardest); licensing terms for display; costs scale with catalog freshness needs.
- **Validation:** Spot-check 25 listings against the actual service — target >90% verifiably real (today: unmeasured, likely far lower); zero invented titles in schedule view.
- **First 3 steps:**
  1. Prototype: fetch TMDB "trending + watch providers" for Netflix US, render through the existing ChannelCard grid, no LLM.
  2. Add LLM as a re-ranker/annotator over the real list (input: real titles + profile; output: order + 12-word pitches).
  3. Evaluate TVmaze (free) vs Gracenote for the live-TV tab; pick and wire one, keep AI-only mode behind a labeled fallback.

---

## Moonshot

### 5. "Aura" — the cross-service TV concierge
- **Impact:** Redefines the product from a static list into the layer people open before the remote: unified taste profile learned from thumbs/watches, deep links that launch the show in the right app, household profiles, and push alerts ("Your show starts in 10 min on NBC", "Season 3 just dropped on Max"). Nobody owns the cross-service guide; the incumbents (Apple TV app, Google TV) are locked to their hardware. A web-first, personality-driven concierge with donation/premium tiers is a genuinely differentiated wedge.
- **Effort:** XL
- **Dependencies:** Upgrades 3 + 4 (real data, server-side brain), shared auth so taste profiles persist across devices (upgrade 6), push infra (web push or email digest first).
- **Risks:** Deep-link coverage varies by service/platform; retention is the whole game — needs real engagement loops, not just lists; scope creep — ship one loop (follow a show → get alerted) before all of it.
- **Validation:** D7 retention >20% for users who follow ≥1 show; alert click-through >15%; weekly return visits without a prompt.
- **First 3 steps:**
  1. Add "follow" hearts on ChannelCard, stored per user (server entity, not localStorage).
  2. Ship one notification loop: daily email/web-push digest of followed shows airing today (from upgrade 4's real schedule data).
  3. Add deep links (netflix.com/title/…, hulu app links) on cards; measure tap-through.

---

## Integration ready

### 6. SHARED — Adopt platform contracts: auth, UserRef profile, UsageEvent metering, shared secrets/observability
- **SHARED PLATFORM UPGRADE** — designed once, applied across the ~30 Base44 apps; auraguide is an early adopter, not the owner.
- **Impact:** Moves auraguide from anonymous-localStorage island to platform citizen: Base44 auth on (`requiresAuth: true` or platform SSO), profile stored against a shared `UserRef` (portable across OracleQuant/Prism/auraguide), every LLM call emits a `UsageEvent` (app, user, model, tokens, cost) into the shared observability sink so spend is finally visible per app, and API keys live in shared server-side secrets — never the client. This is the precondition for the merge its own manifest already asks for (`status: merge-candidate`).
- **Effort:** M here (L once for the platform pieces).
- **Dependencies:** workspace-contracts schemas for UserRef/UsageEvent finalized; shared LLM proxy function template; upgrade 2 done (deck scripts out).
- **Risks:** Auth wall may cut casual traffic — offer a guest mode that still routes through the metered proxy; localStorage → UserRef migration needs a one-time import prompt.
- **Validation:** `requiresAuth: false` gone; profile survives a browser wipe after sign-in; a per-app spend dashboard shows auraguide's daily LLM cost from UsageEvents; repo passes the workspace-contracts manifest validator.
- **First 3 steps:**
  1. Define/confirm `UserRef` + `UsageEvent` JSON schemas in workspace-contracts (once, shared).
  2. Flip auraguide to authenticated client + guest fallback; move profile writes to a `UserProfile` entity keyed by UserRef, with localStorage import on first sign-in.
  3. Emit UsageEvent from the guide server function (upgrade 3) and register auraguide in the shared observability sink.

### Also SHARED (note, not repo-specific work)
- **Base44 template de-bloat:** Stripe, three.js, leaflet, quill, jspdf, recharts ship unused in this and most template apps. Fix the template once; each app inherits a smaller bundle on next sync.

---

## Priority order
1. Quick win 1 (trust + error handling) — today
2. Quick win 2 (evict deck bin/) — today
3. Medium 3 (cached server-side guide) — this closes the spend hole
4. Integration 6 (platform contracts) — alongside 3, shares the same server function
5. Long term 4 (real data) — the product only matters if listings are real
6. Moonshot 5 (concierge) — only after 4 proves out
