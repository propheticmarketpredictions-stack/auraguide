# OracleQuant Platform — Scored Improvement Roadmap

Every item is a net improvement (no tradeoff debate). Scored on a clear scale so you can pick by
value, and tagged by what it costs to run.

## The scale
- **Impact** 1–5 (5 = moves the whole platform)
- **Effort** 1–5 (1 = an afternoon, 5 = a real project)
- **Cost tag:**
  - `FREE` — code/config/docs only, **no Venice credits**, runs anytime.
  - `VENICE` — calls the AI brain, **needs Venice credits** to run/verify.
  - `FOUNDER` — a real-world action only you can do (accounts, funding, stopping jobs).

Ordered best-first (high impact, then low effort).

| # | Improvement | Impact | Effort | Cost | Where |
|---|-------------|:------:|:------:|------|-------|
| 1 | **Archive duplicates with pointer READMEs** (oraclequant-copy → oraclequant, seth-copy2 behind seth-copy). Instant clarity, zero risk. | 3 | 1 | FREE | workspace |
| 2 | **Surface the Brain's accuracy in the UI** — a Brain Ring + reliability chart built from the `scoreModelAccuracy` data you already store. Users *see* it grow. | 4 | 2 | FREE | oraclequant/src |
| 3 | **Cost-saver pass on the brain** — adaptive cache TTL, batch the morning briefing, dedupe identical model calls. Directly stretches Venice credits. | 3 | 2 | FREE | analyzeMarket, prophecyEngine |
| 4 | **Fixed, versioned OOS dataset for the trading bot** — save real bars to CSV so backtests are reproducible (today each run pulls a fresh window). | 3 | 1 | FREE | crypto-trading-bot |
| 5 | **Multi-coin pooling for the trading bot** — pool many assets to reach the 200-trade bar the edge test needs (single coin only makes ~40). Pre-register first. | 4 | 3 | FREE | crypto-trading-bot |
| 6 | **Ship the shared shell around Markets** (top bar, app-switcher, Brain widget) — migration step 1, makes OracleQuant the platform. | 5 | 4 | FREE | oraclequant/src |
| 7 | **Extract the Brain into a per-user service** — the unification centerpiece: calibration weights per user, not global. This is what makes the brain *yours*. | 5 | 4 | VENICE | oraclequant/base44 |
| 8 | **Adopt shared contracts on the pilots** (prism, emberscot, overlayflow) — UserRef + event emission. Additive, reversible. | 4 | 3 | FREE | 3 repos |
| 9 | **Autopilot as a headless paper service** + `/autopilot` control surface — first cross-shirt Brain proof (Markets scored by real outcomes). | 4 | 4 | FREE | crypto-trading-bot |
| 10 | **Add a 7th model or drop the weakest** — the Brier weights tell you which model earns its place. | 3 | 2 | VENICE | prophecyEngine |
| 11 | **Expand question types** (sports, weather, econ) — more of the brain's range, same pipeline. | 3 | 2 | VENICE | analyzeMarket |
| 12 | **Wire the digital-clone agent** (emberscot) — give it tools so it actually learns your style, not just a spec. | 3 | 3 | VENICE | emberscot |
| 13 | **Commit the Copilot handoff** into the clean crypto-bot repo (after de-duping jobs). | 2 | 1 | FREE | crypto-trading-bot |
| 14 | **Stop the duplicate colliding background jobs** — keep one owner per repo. | 4 | 1 | FOUNDER | — |

## Run order when credits are tight
Do all `FREE` items first (1–6, 8, 9, 13) — they cost no Venice credits and several *save* credits
(items 3, 4). Save the `VENICE` items (7, 10, 11, 12) for when credits are topped up. Item 7 is the
big one — do it first among the Venice items, since it's the heart of "grow your own AI brain."

## What needs you (FOUNDER)
- Item 14: stop the duplicate jobs.
- Top up Venice credits before the VENICE items.
- Trading bot only: recover Coinbase, fund Kraken with a trade-only key (still paper until an edge is proven).

## Cross-cutting wins (one change, many repos)
These beat per-repo fixes because each one clears a whole class of problems.

| Theme | What & why | Impact | Cost |
|---|---|:--:|---|
| **A. One shared payments module** | 8+ commerce apps have unwired or duplicated Stripe (aeris, arcanum, escrowvault, extremehappy, cosmic-passport, kernelhub, velvet, zeroday-walls). Build once from the working Stripe (kernelhub/prism), reuse. Kills every "fake checkout" at once. | 5 | FREE |
| **B. Route ALL LLM calls through aiproxy/Venice** | ~12 apps call Base44 `Core.InvokeLLM` directly. Centralizing gives model control + one cache/cost path = **saves Venice credits**. | 5 | FREE |
| **C. Dedupe the Deck tooling** | Identical `bin/` (deck/bus/relay/anchor) sits in **7 repos incl. the trunk**. Keep one canonical copy; promote it as the brain's agent event-bus + decision audit. | 3 | FREE |
| **D. Unify the two brains** | You have TWO: OracleQuant's market ensemble (learns via Brier weights) AND **SETH** (personal chat + self-updating memory bank). Plus 6 ready-made agents in oraclequant-copy. Consolidate into one brain core. | 4 | VENICE |
| **E. Encrypt secrets at rest** | cloakphone (SMS bodies) and vaultlaunch (account passwords) store plaintext. Fix before folding into the shared data layer. | 4 | FREE |
| **F. Fix the aiproxy credit race** | `overlayflow-aiproxy` does full-file read-modify-write per request, so concurrent calls clobber balances and lose charges. Real money bug. Serialize + reserve/settle. | 4 | FREE |

## Every repo, its role, and its top improvement (all 36)

| Repo | What it is | Role | Top improvement |
|---|---|---|---|
| oraclequant | Kalshi AI-ensemble intelligence (live) | **core-body** | Extract the analyzeMarket ensemble behind Signal/Market/Edge contracts + cost logging (its own Phase-2) |
| seth-copy | SETH: AI persona chat + self-updating memory bank | **core-body (brain)** | Extract persona+memory behind Venice aiproxy as shared brain (dup resolved) |
| crypto-trading-bot | Paper-first venue-agnostic trading bot | shirt:Autopilot | Run walk-forward validation on REAL ccxt data (v1 vs v2) for an honest EDGE verdict |
| prism | Atelier commerce/dropship monolith | shirt:Commerce (pilot) | Extract shared contracts (UserRef/WalletEvent/Tier) + telemetry-wrap Venice/Stripe |
| emberscot | Coupon marketplace + contracts pilot | shirt:Commerce | Add `src/contracts` (AgentEvent/ProjectRef/PreferenceSignal zod) per its Phase-2 |
| cryptomansion | Membership crypto research portal | shirt:Markets | Replace the Google-Sheet CSV scrape for trade alerts with a real alerts API in core |
| novavault | Crypto companion (demo wallets) | fold→Markets | Salvage CoinGecko proxy + price widgets + portfolio; drop demo wallets |
| aeris-biologics | Supplement storefront | shirt:Commerce | Wire real Stripe checkout + persist cart |
| arcanum-vault | "Underground knowledge" marketplace | shirt:Commerce | Wire Stripe into tip/consult/patent flows (monetization is fake) |
| escrowvault | Escrow marketplace (DEMO_MODE) | shirt:Commerce | Replace DEMO_MODE with one real Stripe escrow rail |
| extremehappy | E-commerce storefront | shirt:Commerce | Persist cart + add real order/checkout flow |
| kernelhub | Repo/hardware marketplace + ICJ wallet | fold→Commerce | Extract its working Stripe wallet/ledger into the shared payments module |
| cosmic-passport | Astrology "passport" + amulet shop | fold→Life | Wire Stripe or fold the passport generator into Life |
| celestial-guidance | Astrology→career/course guidance | fold→Life | Move getAstroRecommendations prompts behind aiproxy/Venice |
| novaname | AI name suggestions + name-change flow | shirt:Life | Route name-gen through the shared brain via an adapter |
| auraguide | AI "what's on now" TV/streaming picks | shirt:Life | Ground picks in real EPG/TMDB data; route LLM through aiproxy |
| vaultlaunch | Social-accounts + privacy dashboard | shirt:Life | Encrypt stored passwords at rest (openpgp) before folding |
| cognitoboost | Brain-training / flashcards | fold→Life | Fold the challenge/flashcard module; rewire to core auth + brain |
| bridgeconnect | Community app (CommonGround) | fold→Life | Fold 4 entities/5 pages as a community module; retire |
| folio | AI-written books + gamified reader | fold→Life | Swap Core.InvokeLLM for aiproxy; extract Book/XP schema to contracts |
| inkwell-prophet | AI deep-research inquiry trees | fold→Forge | Extract the inquiry-tree engine behind aiproxy as a shared research service |
| syncpulse | (=Inkwell Prophet) multi-agent research | fold→Forge | Extract the recursive research engine behind aiproxy; fold UI into Forge |
| nebulachat | Multi-LLM chat via aiproxy | fold→brain | Extract chat surface into core shared AI-brain chat; retire dup login |
| vaultpaper | AI phone-wallpaper generator | fold→Forge | Swap Base44 GenerateImage for Venice aiproxy |
| urban-alchemist | Grow guides + AI T-shirt gen + seed shop | fold→Forge | Persist T-shirt designs (salvage the studio); drop the seed marketplace (legal risk) |
| cloakphone | Virtual phone number + AI replies | fold | Encrypt SMS/transcripts at rest; or extract Telnyx+billing as shared comms |
| ebay-integration | eBay Sell API CLI | fold→Commerce | Make it an importable connector + unattended OAuth callback |
| zeroday-walls | Hacker-aesthetic wallpaper shop | archive-salvage | Salvage Stripe premium-unlock + gallery into Commerce; archive |
| velvet | Dating/social app + token wallet | archive-salvage | Salvage the Stripe token-wallet; archive the dating/webcam product |
| overlayflow | OverlayFlow marketing landing (mock features) | archive-salvage | Repurpose as the single OQ marketing front door; strip fake features |
| overlayflow-aiproxy | Node Venice proxy w/ credit metering | shared-service | Fix the credit-accounting race (serialize writes; reserve/settle) |
| overlayflow-android | FloatDock: Android floating-bubble launcher | shirt:Pocket | Consolidate with ~/FloatDock copy; add Gradle wrapper; point bubbles at OQ |
| alpha-chronograph | (=Deck) bash AI-orchestration CLI | shared-service | Promote bus/relay/anchor into core as the brain's event-bus; fix the mislabel |
| oracle-app-ICJAVELIN | (=Deck) same orchestration CLI | infra | Fix identity mismatch; re-manifest as founder tooling; decide if Deck = build harness |
| ai-workspace | Deck scripts + prompt library + stale specs | archive-salvage | Salvage deck scripts + promptLibrary.js into core; delete stale Emberscot docs |
| kalshi-trading-bot | Spec-only Kalshi bot (+ stray deck bin/) | fold→Autopilot | Turn its Kelly/exposure numbers into a machine-readable risk config; archive |

## Archive / salvage decisions (2026-07-08)
- **seth-copy canonical.** `seth-copy2` **ARCHIVED** (local commit, not pushed — nothing unique was lost; it's a strict subset).
- **oraclequant-copy: DO NOT archive yet.** It holds 22 files the trunk lacks — most importantly **6 Base44 brain agents** (alert_manager, crypto_signals, market_analyst, oracle_predictions, position_calculator, trade_tracker) plus pages (Arbitrage, Analytics, PositionCalculator, Vault, Watchlists, Premium, Community). Salvage these into the trunk FIRST, then archive. Its deck tooling is already identical in the trunk (nothing to salvage there).
- **Deck tooling** is duplicated identically across 7 repos including the trunk — dedupe to one canonical copy.
