# OracleQuant Build Plan — the executable sequence

Companion to `IMPROVEMENTS.md` (the catalog) and `oraclequant-unified-vision.html` (the picture).
This file is the ORDER OF OPERATIONS: do these top to bottom. Each step says exactly what to do,
whether it's safe to run now, and what it costs.

Legend: `NOW` = safe/reversible, no credits · `VENICE` = needs Venice credits · `FOUNDER` = only
you can do it · `HOLD` = wait until the workspace is calm (jobs de-duplicated, remotes settled).

---

## Phase 0 — Stabilize (do this FIRST or everything else races)
- `FOUNDER` **Stop duplicate background jobs.** Keep one owner per repo. The crypto-bot alone had
  ~6 jobs; seth-copy2's remote moved under us mid-edit. Until this is done, treat all repo edits as
  `HOLD`. (Job list is in the chat / `concurrent-jobs-collision` memory.)
- `FOUNDER` **Confirm Base44 → GitHub sync direction** for each live app, so local commits don't
  fight the Base44 source of truth.
- `NOW` **Clear the stray local archive commit** in seth-copy2 (never pushed; remote is safe):
  `cd ~/github/propheticmarketpredictions-stack/seth-copy2 && git reset --hard origin/main`

## Phase 1 — Trunk core (the body) — mostly code, no credits
- `DONE` Salvaged 6 Base44 agents into `oraclequant/base44/agents` (local commit, unpushed).
- `DONE` Added `oraclequant/src/contracts/` (5 zod schemas, runtime-verified) + `src/lib/invokeBrain.js` (local commit, unpushed).
- ~~`NOW` Add `oraclequant/src/contracts/`~~ — copy the schemas from `workspace-contracts`
  (UserRef, UsageEvent, Signal, WalletEvent, AgentEvent) as importable modules. Additive; nothing
  breaks. This is the backbone every shirt plugs into.
- `NOW` Extract `analyzeMarket`'s ensemble+calibration into a `brain/` service module with
  request-ID + cost logging (per `oraclequant/PHASE_2_LOCAL_FIRST_PLAN.md`). Code move only.
- `NOW` Build the shared shell (top bar, app-switcher, Brain widget) around existing Markets pages.
- `VENICE` Make calibration PER-USER (store weights per user; nightly rescale). The centerpiece.
  Needs live ensemble runs to verify. Do this first among VENICE items.

## Phase 2 — Kill every fake checkout (one shared payments module)
- `NOW` Extract the working Stripe wallet/ledger from `kernelhub` (or `prism`) into a shared
  `payments` module in the trunk.
- `NOW` Then wire it into the apps whose checkout is currently fake: `aeris-biologics`,
  `arcanum-vault`, `escrowvault`, `extremehappy`, `cosmic-passport`, `zeroday-walls`, `velvet`.
  One module, seven fixes.

## Phase 3 — Route every LLM call through your aiproxy (unifies the brain + saves credits)
- `NOW` Add a tiny `invokeBrain()` adapter over the Venice aiproxy.
- `NOW` Swap Base44 `Core.InvokeLLM` for it in: `celestial-guidance`, `novaname`, `auraguide`,
  `folio`, `cognitoboost`, `inkwell-prophet`, `syncpulse`, `nebulachat`, `vaultpaper`, `cloakphone`.
  Central cache = fewer duplicate model calls = lower Venice spend.

## Phase 4 — Security (do before folding these into shared data)
- `DONE` `overlayflow-aiproxy`: fixed the credit race — single in-memory ledger + serialized
  writes + reserve/settle. Verified with a concurrency test (old lost 499/500 charges; fix
  conserves all). Local commit, unpushed; REVIEW before deploying to the running ~/aiproxy.
- `NOW` Encrypt at rest: `vaultlaunch` account passwords (reuse bundled openpgp.js); `cloakphone`
  SMS bodies + AI transcripts.

## Phase 5 — Unify the two brains + ready agents
- `VENICE` Extract SETH's persona + self-updating memory bank (`seth-copy`) behind the aiproxy as
  the personal-memory layer of the one brain. (Re-decide seth-copy vs seth-copy2 first — seth-copy2
  is live again.)
- `NOW` Sync the 6 salvaged agents to Base44 so they go live in the app.

## Phase 6 — Fold-ins and archives (only after contract parity, per repo)
- `NOW` Salvage `oraclequant-copy`'s unique PAGES (Arbitrage, Analytics, PositionCalculator, Vault,
  Watchlists, Premium, Community) into the trunk, THEN archive oraclequant-copy.
- `NOW` Dedupe the Deck tooling: keep one canonical `bin/` (it's identical in 7 repos incl. trunk).
- `HOLD` Fold Life apps (`celestial-guidance`, `cosmic-passport`, `cognitoboost`, `bridgeconnect`,
  `novaname`, `auraguide`, `vaultlaunch`, `folio`) into one `/life` namespace.
- `HOLD` Archive-with-pointer the off-mission tail (`velvet`, `zeroday-walls`, `overlayflow`
  landing) AFTER salvaging their Stripe/gallery bits. Never archive a repo whose remote is still
  moving — check `git log origin/main` first.

## Phase 7 — Autopilot & real edge (crypto-trading-bot — COLLISION ZONE, hold until Phase 0)
- `NOW` Save a fixed, versioned OHLCV CSV so backtests are reproducible.
- `NOW` Run walk-forward validation (`core/validate.py`) on that real data: v1 vs v2 win_prob for
  an honest EDGE / NO-EDGE verdict. No live money until EDGE on 200+ trades + weeks of paper.
- `FOUNDER` Fund Kraken with a trade-only key (still paper until an edge is proven).

---

### The golden rule that saved us twice
Before archiving or overwriting ANY repo: `git log --oneline origin/main -3` and check no job's
cwd points at it. The workspace changes in real time — verify, then act.
