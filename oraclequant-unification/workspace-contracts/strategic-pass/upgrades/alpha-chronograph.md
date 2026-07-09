# alpha-chronograph — Strategic Upgrades

**What it is:** A declared placeholder repo ("undocumented concept pending scope clarification" per repo-manifest.json) that was accidentally seeded with a byte-identical copy of the Deck orchestration CLI (11 bash scripts: bus, ask, relay, anchor, deck-*). The deck workspace's own log calls this seeding "bin/-pollution".
**Stack:** Bash + jq + flock + inline python3, talks to the local mesh proxy (127.0.0.1:8787). No README, no .gitignore, no tests, single commit.
**Maturity:** early. **Risk:** medium — identity confusion (name/manifest/contents all disagree), silent duplicate of `/home/coder/deck/bin` that will drift, and no .gitignore so a runtime `.token` or `projects/` bus feed (full LLM prompts/replies) dropped here is trivially committable.

---

## Quick win

### 1. Resolve the identity crisis: strip the copied bin/, declare scope, seal the leak paths
- **Tier:** quick_win
- **Impact:** Removes the "bin/-pollution" the deck log already flags, kills the duplicate-drift risk at its cheapest moment (copies are still identical), and closes the only secret-leak path this repo has (a `.token` or bus feed created in the repo root is currently committable). After this, every agent and human that opens the repo sees the truth instead of three contradictory stories.
- **Effort:** S (under an hour)
- **Dependencies:** A one-line decision from you: does "alpha-chronograph" have a real concept behind it (see upgrades 3-4), or should it be archived? The cleanup is the same either way.
- **Risks:** None real. Nothing on the VPS invokes this checkout's bin/ (the live tooling is `/home/coder/deck/bin`); grep pm2/cron first to confirm.
- **Validation:** `git ls-files` shows no `bin/`; `git check-ignore .token projects/ backups/ checkpoints.tsv` passes; README and repo-manifest.json tell the same story; a fresh Claude session describes the repo correctly.
- **First 3 steps:**
  1. `grep -rn "alpha-chronograph/bin" ~ 2>/dev/null` + check `pm2 ls` and `crontab -l` to confirm nothing calls this copy.
  2. `git rm -r bin/` with commit message pointing at the canonical home (`/home/coder/deck`, see upgrade 2); add `.gitignore` with `.token`, `*.token`, `projects/`, `backups/`, `checkpoints.tsv`.
  3. Write a 10-line README + update repo-manifest.json: either the real concept (recommend the signal-timing ledger, upgrade 3) or `status: archived`.

## Medium

### 2. SHARED — One canonical Deck tooling repo, consumed everywhere via PATH, with CI
- **Tier:** medium — **SHARED PLATFORM UPGRADE** (do once, benefits every repo that vendored Deck bin/: this repo, ai-workspace, aeris-biologics, and any others)
- **Impact:** The Deck bin/ now exists in at least three checkouts with no sync mechanism. One canonical `deck` repo (mirroring `/home/coder/deck`) with shellcheck + bus round-trip smoke tests in CI ends the silent-fork problem for the whole org. Already specified in detail in `strategic-pass/upgrades/ai-workspace.md` (upgrade 2) — this repo's part is only to delete its copy and point at the canonical home.
- **Effort:** M platform-wide (2-4 days); S for this repo's slice (covered by upgrade 1 step 2)
- **Dependencies:** Upgrade 1; decision on canonical home (recommendation: a proper `deck` repo in the org, `/home/coder/deck` becomes its checkout).
- **Risks:** Hardcoded paths somewhere on the VPS; grep before deleting copies. Keep the recovery-branch behavior of `deck-rollback` tested before other repos rely on it.
- **Validation:** `which deck` resolves to exactly one checkout org-wide; CI green on shellcheck + a bus new/post/jq-parse/tail round trip; zero repos left with a vendored bin/.
- **First 3 steps:** (see ai-workspace.md upgrade 2 for the full platform plan)
  1. Create/confirm the canonical `deck` repo and push `/home/coder/deck` to it.
  2. Add PATH export + CI workflow there.
  3. Delete vendored copies (this repo via upgrade 1, ai-workspace via its own plan).

## Long term

### 3. Give the name a real product: the signal-timing provenance ledger
- **Tier:** long_term
- **Impact:** "Alpha chronograph" is a genuinely good concept the portfolio lacks: an append-only, tamper-evident ledger that timestamps every prediction/Signal the moment it is emitted (by OracleQuant, Prism, the kalshi engine, the new crypto bot), then scores it later against outcomes. Without emission-time provenance you can never prove a prediction predated the event — which is the entire credibility problem of a predictions business. The Deck bus (flock-serialized JSONL appends) is 80% of the storage primitive already; this repo would own the schema, the append service, and the scoring pass.
- **Effort:** L (1-2 months part-time: schema + append API + backfill adapters + scoring job + small dashboard)
- **Dependencies:** Upgrade 5 (shared Signal contract) so every producer emits the same shape; upgrade 2 so the bus primitive has one home; outcome data sources per market (kalshi settlements, price feeds via existing APIs).
- **Risks:** Scope creep into a full data platform — keep v1 to "receive Signal, hash+timestamp, append, score daily". Outcome matching is the hard part (market resolution mapping); start with the venue that has cleanest settlement data (Kalshi).
- **Validation:** Every Signal emitted by at least two producer apps lands in the ledger within 1s with a monotonic timestamp; a daily scoring job produces per-model/per-app hit-rate and calibration numbers; you can answer "what was our 30-day accuracy on X" from one query.
- **First 3 steps:**
  1. Write a 1-page SPEC in this repo: Signal-in schema (aligned to workspace-contracts), ledger record (ts, producer, signal_id, payload_hash, payload), scoring model.
  2. Prototype the appender as a tiny FastAPI service reusing the flock-JSONL pattern; wire the kalshi engine as first producer.
  3. Add the daily scoring script + one markdown/HTML report; iterate on outcome matching.

## Moonshot

### 4. Public, verifiable track record — "proof of alpha" for the whole portfolio
- **Tier:** moonshot
- **Impact:** Extend the ledger into a publicly auditable track record: each prediction's hash is committed at emission time (to a public git repo, a transparency log, or a cheap chain anchor), payloads revealed after resolution. Result: cryptographic proof that your models called markets in advance — the strongest possible marketing asset for a solo predictions business, and a product in itself (subscribers verify instead of trust). No competitor at your scale offers this; it could redefine what OracleQuant/Prism sell.
- **Effort:** XL (a quarter, on top of upgrade 3)
- **Dependencies:** Upgrade 3 working internally for 30+ days with honest numbers; legal/compliance sanity check on publishing prediction performance; a public commitment channel (public GitHub repo of daily hash roots is enough to start — no blockchain needed).
- **Risks:** Publishing a bad track record is worse than none — gate the public launch on internal numbers you'd defend. Commit-reveal must be airtight (no ability to quietly drop losing predictions: publish daily Merkle roots over ALL signals, not selected ones).
- **Validation:** An outside party, given only the public commitments, can independently verify hit-rate for a month of predictions; at least one prospective user/subscriber cites verifiability as the reason they trust the product.
- **First 3 steps:**
  1. Add payload hashing + daily Merkle-root output to the upgrade-3 ledger.
  2. Auto-push daily roots to a public repo (ask before creating it — org default is private).
  3. Build the verify script anyone can run (`verify.py <month>` → hit-rate + proof check) and dogfood it for 30 days before announcing.

## Integration ready

### 5. Align the event format with the shared platform contracts (Signal/UsageEvent) + shared secrets/observability conventions
- **Tier:** integration_ready
- **Impact:** The bus.jsonl shape (`ts/type/who/text`) is this repo's one reusable idea, but it's a private dialect. Mapping it onto the workspace-contracts platform types — bus `decision`/`checkpoint` events as `UsageEvent`, model outputs destined for the ledger as `Signal`, producer identity as `UserRef` — makes anything built here (upgrade 3 especially) consumable by every Base44 frontend and the future shared dashboard on day one. Same pass adopts the platform secrets rule (token read only from `/home/coder/mesh/.token`, never a repo-local `.token`) and emits events a shared observability tail can consume.
- **Effort:** M (2-4 days once the contract JSON schemas exist in workspace-contracts)
- **Dependencies:** The Signal/UsageEvent/UserRef schemas being pinned in workspace-contracts (partly SHARED: defining those schemas is a do-once platform task; this repo's adapter is the local part). Upgrade 1 done first.
- **Risks:** Contracts still moving — version the envelope (`schema_version` field, like repo-manifest already does) so early events survive schema evolution. Don't let contract work block upgrade 3's prototype; adapt at the boundary.
- **Validation:** `validate-manifests.mjs`-style validator passes over a day of emitted events; one shared consumer (e.g. a dashboard tail or the repo-editor app) renders this repo's events with zero custom parsing; `git ls-files | grep token` empty forever.
- **First 3 steps:**
  1. Draft `signal.schema.json` + `usage-event.schema.json` in workspace-contracts (SHARED, once) mapping from the bus fields: ts→emitted_at, who→UserRef/producer, type→event kind, text→payload.
  2. Write a 30-line adapter (bash or python) that wraps bus appends in the versioned envelope and validates against the schema.
  3. Remove `$DECK/.token` support from any script this repo ends up owning; read only the shared mesh token path, and add that rule to the README.

---

**Highest leverage:** Upgrade 1 — an hour of work removes the flagged pollution, the drift fork, and the token/bus-log leak path, and forces the scope decision that everything else depends on.
