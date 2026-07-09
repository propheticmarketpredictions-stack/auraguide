# ai-workspace — Strategic Upgrades

**What it is:** Not a product — the spec/prompt/tooling workspace for the Deck multi-agent orchestration idea. `specs/` = ~5,100 lines of raw pasted Claude/Gemini transcripts; `bin/` = 11 solid bash scripts (project bus, ask/relay via aiproxy, anchor confidence gate, checkpoint/rollback); `prompts/promptLibrary.js` = 15 sports-betting prompts for a future Deck Library page.
**Stack:** Bash + jq + flock + inline python3, one ES-module JS file, Markdown. No README, no package.json, no tests, no CI.
**Maturity:** early (all 11 commits from 2026-07-07). **Risk:** medium — no `.gitignore` while `bin/ask`/`bin/anchor` read a plaintext token from `./.token`; CLAUDE.md describes a nonexistent Emberscot repo layout; `bin/` duplicates the live `/home/coder/deck/bin` (identical today, will drift).

---

## Quick win

### 1. Stop the token leak and fix the lying CLAUDE.md
- **Impact:** Closes the one path where a careless `git add .` publishes the aiproxy token (repo is on GitHub, scripts expect `./.token`, nothing blocks it). Rewriting CLAUDE.md stops every future agent session from being misled into editing a fictional Emberscot `src/` tree — one Gemini transcript in this very repo already calls the current CLAUDE.md "actively-harmful fiction".
- **Effort:** S (30-60 min)
- **Dependencies:** None.
- **Risks:** None. Pure removal of risk.
- **Validation:** `git check-ignore .token projects/` passes; `git ls-files | grep -E '\.token|^projects/'` is empty; CLAUDE.md names only files that exist; a fresh agent session correctly describes the repo.
- **First 3 steps:**
  1. Add `.gitignore` with `.token`, `*.token`, `projects/`, `profile/clone-profile.md`.
  2. Rewrite CLAUDE.md: purpose (Deck spec + tooling archive), real layout (bin/, specs/, prompts/, agents/), pointer to `/home/coder/deck` as the live runtime, hard rule "never commit .token".
  3. Add a 15-line root README so GitHub visitors (and agents) see the same truth; delete or rewrite PROMPTS.md's Emberscot fiction.

## Medium

### 2. SHARED — One canonical home for Deck tooling, with CI smoke tests
- **SHARED PLATFORM UPGRADE.** The Deck `bin/` is vendored in at least three places (this repo, `/home/coder/deck`, aeris-biologics and likely other Base44 apps). Fix once: pick one canonical repo, everything else consumes via PATH.
- **Impact:** Kills the two-sources-of-truth problem before the copies drift (identical today — cheapest moment to converge). CI catches breakage in the only real code this repo owns.
- **Effort:** M (2-4 days)
- **Dependencies:** Decide the canonical home — recommendation: the org's `deck` repo owns `bin/` + runtime; `ai-workspace` keeps specs/prompts only. Check pm2/cron/scripts for hardcoded paths first.
- **Risks:** Something on the VPS may invoke this repo's `bin/` copies; grep before deleting. Keep `/home/coder/deck` as a git checkout of the canonical repo, not a loose folder.
- **Validation:** `which deck` resolves to one checkout; `git rm -r bin/` here leaves nothing broken; GitHub Actions runs shellcheck + a bus round-trip test (new project → post → jq-parse bus.jsonl → tail) green on every push.
- **First 3 steps:**
  1. `grep -rn "ai-workspace/bin\|deck/bin" ~ /etc/systemd --include='*' 2>/dev/null` + check `pm2 ls` and crontab for callers.
  2. Make `/home/coder/deck` the canonical git repo (it already has README/SPEC/profile); add PATH export in shell profile; `git rm -r bin/` in ai-workspace with a pointer commit.
  3. Add `.github/workflows/ci.yml` to the deck repo: shellcheck all of bin/, then a mock-proxy bus/checkpoint/rollback smoke test (no real token needed).

### 3. Distill 5,100 transcript lines into SPEC v1 + archive the raw chats
- **Impact:** The specs are the repo's actual value, but they're unreadable raw transcripts with personal conversation content sitting on GitHub. A curated SPEC.md (bus event schema, anchor protocol, roadmap, decisions taken vs rejected) becomes the buildable source of truth; transcripts move to `archive/` clearly labeled as raw inputs.
- **Effort:** M (2-3 days, mostly editorial)
- **Dependencies:** None; pairs well with upgrade 1's CLAUDE.md rewrite.
- **Risks:** History still contains the personal content even after moving files — repo is private, acceptable; don't rewrite history unless it goes public. Distillation can silently drop decisions — link each SPEC section back to its transcript source.
- **Validation:** SPEC.md under ~400 lines covers: bus schema, anchor gate protocol, ask/relay contract, v1 scope; an agent given only SPEC.md can correctly describe how to add a new bus event type.
- **First 3 steps:**
  1. Extract the bus event schema and anchor RATIONALE/DECISION/CONFIDENCE/VERDICT protocol from `specs/claude-deck-spec.md` and the blueprint into a new `SPEC.md`.
  2. `git mv specs/ archive/transcripts/` with a header note "raw inputs, superseded by SPEC.md".
  3. Skim the 4,233-line blueprint for decisions not yet in SPEC.md; log each as a one-line entry in a DECISIONS.md.

## Long term

### 4. Deck daemon: the bus as a service (SSE + phone dashboard)
- **Impact:** The structural jump from "bash scripts I run in tmux" to a running system: a small FastAPI daemon that owns the bus files, exposes `POST /bus/{project}` and `GET /bus/{project}/stream` (SSE), and serves a mobile-first dashboard — live feed, anchor NEEDS-YOU queue with approve/reject buttons, and the Deck Library page that finally consumes `promptLibrary.js`. This is what makes Deck usable from Termius/Android instead of only inside a shell.
- **Effort:** L (1-2 months incremental)
- **Dependencies:** Upgrade 2 (one canonical repo), your existing stack (FastAPI + pm2 + Caddy — no new infra). Scripts keep working: they call the daemon when it's up, fall back to direct file append when not.
- **Risks:** Auth surface — reuse the aiproxy token check, bind to localhost behind Caddy. Concurrency: daemon becomes the single writer, which actually removes the flock complexity. Scope creep into full dashboard-ware; ship feed + queue first, Library second.
- **Validation:** From the phone browser: watch a live bus feed, approve one queued anchor decision, and copy a prompt from the Library — all in one session; `bus post` from shell appears in the SSE stream within 1s.
- **First 3 steps:**
  1. Write the daemon skeleton: read/append bus.jsonl per project, SSE tail endpoint, token-checked; run under pm2 behind Caddy.
  2. Single mobile HTML page: project list → live feed (SSE) → anchor queue with approve/reject that posts a decision event.
  3. Port `promptLibrary.js` prompts into a `/library` page with copy-to-clipboard; retire the JS module or serve it as the data file.

## Moonshot

### 5. AnchorSmith as the portfolio's decision layer
- **Impact:** Redefines the product. Today anchor is a one-shot router for one project. The moonshot: your decision clone runs continuously across the whole ~30-repo portfolio — every agent, workflow, and app posts decisions to project buses; AnchorSmith auto-approves what matches your trained profile (gate ≥ threshold), queues the rest to your phone, and every verdict it makes is itself logged as training data that sharpens the profile. You become the exception handler for your own company instead of the bottleneck. This is the actual thesis buried in the 4,233-line blueprint.
- **Effort:** XL (quarters)
- **Dependencies:** Upgrades 2, 4, and 6 (daemon as the substrate, contracts so all repos speak one event language); a real decision-profile pipeline (mine your logged bus decisions + git history into the profile instead of a hand-written template); push notifications to Android (the FloatDock app is a natural host for the NEEDS-YOU queue).
- **Risks:** Autonomy blast radius — keep the v1 rule hard: documents and routing only, no shell, outward/irreversible actions always queue. Confidence scores from an LLM are vibes; calibrate the gate against your actual overrides (if you reverse >10% of auto-approvals, raise the gate). Profile drift; version and review it monthly.
- **Validation:** Over a month: % of routine decisions auto-resolved without you, override rate on auto-approvals (<5%), median time-to-decision for queued items (phone notification → verdict).
- **First 3 steps:**
  1. Instrument first: log every real decision you make (approve/reject/edit) as bus decision events for 2 weeks — no automation yet.
  2. Build the profile miner: summarize those logged decisions into a structured clone-profile.md, replacing the blank template.
  3. Turn anchor loose on the lowest-stakes project with the gate at 90, review every auto-decision weekly, lower the gate as override rate proves out.

## Integration ready

### 6. SHARED — Promote the bus + anchor contracts into workspace-contracts; adopt shared secrets and observability
- **SHARED PLATFORM UPGRADE.** Define once, consume everywhere. This repo already owns the two contracts the merged platform needs for agent activity: the bus event schema (`{ts, type: msg|decision|checkpoint|dud|task, who, text}`) and the anchor verdict protocol (RATIONALE/DECISION/CONFIDENCE/VERDICT + numeric gate). Formalize them next to UserRef/UsageEvent/WalletEvent/Signal instead of leaving them implied by bash.
- **Impact:** Any Base44 app, worker, or dashboard can emit/consume agent events without reading bash source; bus decision/task events become the platform's Signal-compatible agent feed; one observability story (bus events → shared event store) instead of per-repo logs. Secrets: kills the `./.token` file pattern portfolio-wide in favor of one env-injected token location.
- **Effort:** M for the contract docs + emitter; the schema is already proven in code.
- **Dependencies:** workspace-contracts as the home (exists); agreement on versioning (`v: 1` field added to bus.jsonl events); the aiproxy request/response contract (`{token, model, messages} → {reply, balance}`) documented alongside, since ask/relay/anchor all consume it.
- **Risks:** Freezing the schema too early — mark v1 minimal and additive-only. Two event vocabularies (bus events vs UsageEvent) — define the mapping explicitly (bus `decision`/`task` → Signal, `msg` stays local) rather than merging them.
- **Validation:** `workspace-contracts/` contains `bus-event.v1.schema.json` + `anchor-verdict.v1.md` + `aiproxy.v1.md`; `validate-manifests.mjs`-style validation passes bus.jsonl samples; one non-Deck repo (e.g. the crypto bot or a Base44 function) emits a valid bus event using the shared spec with zero Deck code.
- **First 3 steps:**
  1. Write `bus-event.v1.schema.json` (JSON Schema, additive-only policy) and `anchor-verdict.v1.md` in workspace-contracts, sourced from the working bash implementations.
  2. Document the aiproxy HTTP contract and the shared-secrets rule: token from `MESH_TOKEN` env or one canonical path, never `<repo>/.token` — update ask/anchor/relay to warn when falling back to file.
  3. Add a `v: 1` field to bus appends in `bin/bus` and a 20-line validator script; wire it into the CI from upgrade 2.

---

**Suggested order:** 1 → 2 → 3 → 6 → 4 → 5. Do upgrade 1 today; it is 30 minutes and removes the only live risk.
