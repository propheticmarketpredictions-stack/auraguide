# OracleQuant Unification — the Method (the final, right way)

**What this is:** the canonical method for folding all ~40 apps in the
`propheticmarketpredictions-stack` org into ONE product, **OracleQuant**. This document is the
"method of the final way it was done." It is intentionally copied into every repo so it is
**findable from GitHub** (and therefore from Base44, which reads GitHub).

**Why it was missing:** the planning files (`BUILD_PLAN.md`, `IMPROVEMENTS.md`,
`oraclequant-unified-vision.html`, `workspace-contracts/`) lived at the workspace **root**, which is
**not a git repo**. They were never committed to any GitHub repo, so Base44 could not find them.
This bundle fixes that: the method now lives inside every repo, with the full home-of-record in
`oraclequant`.

---

## The vision — one Brain, six shirts

OracleQuant is **one Brain worn six ways**. The Brain is shared; each "shirt" is a route namespace
on one shell with one accent color. Three independent design agents converged on this same
structure — strong signal it is right.

### The body — 5 shared organs (live in `oraclequant` + Base44 + the VPS)
1. **The Brain** — oraclequant's `analyzeMarket` 6-model ensemble (IQR outlier removal +
   confidence-weighted fusion + Platt/logistic calibration), made per-user and recalibrated nightly.
2. **Venice gateway** — `~/aiproxy`; every LLM call routes through it (unifies the brain, shares the
   cache, saves credits).
3. **Contracts** — from `workspace-contracts`: `UserRef`, `UsageEvent`, `Signal`, `WalletEvent`,
   `AgentEvent`, `RepoManifest`.
4. **Risk engine** — from the trading bots: EV, ¼-Kelly, drawdown limits, paper-first.
5. **Shared shell / design system** — top bar, app-switcher, Brain widget; black + phosphor green,
   JetBrains Mono.

### The six shirts (route namespaces, one accent token each)
| Shirt | Namespace | Canonical repos | Accent |
|---|---|---|---|
| Markets | `oraclequant` | oraclequant | phosphor green |
| Autopilot | `/autopilot` | crypto-trading-bot + kalshi | amber |
| Commerce | `/commerce` | prism | violet |
| Life | `/life` | celestial-guidance, inkwell-prophet, cosmic-passport, auraguide | rose |
| Pocket | `/pocket` | overlayflow stack | cyan |
| Forge | `/forge` | emberscot, deck, ai-workspace | ember |

---

## THE MECHANISM — how each shirt joins (the "final way")

**One trunk, branches only for migration/features.** Each shirt is folded in through **3 reversible
steps**. Nothing is deleted until the new home is at parity.

1. **CONTRACT** — the app adopts the shared contracts from `workspace-contracts` (UserRef,
   UsageEvent, Signal, WalletEvent, AgentEvent). This is **additive** — no runtime behavior changes.
2. **LAYER** — `git subtree` the app into a **route namespace** inside the trunk
   (`git subtree add --prefix=apps/<shirt> <repo> main`). **History is preserved.** The app now
   lives under the shell as a namespace; the old repo still exists.
3. **ARCHIVE** — once the namespace is at parity, **freeze the old repo** with a pointer README
   ("moved into oraclequant/apps/<shirt>"). Reversible until this step.

### Invariants
- **Headless services never move** into the shell. Only control surfaces (pages/UI) enter as
  namespaces. Proxies, bots, and workers stay as their own services.
- **Live money is triple-gated:** a `live/*` promote + a secret file kept **outside** the tree + a
  runtime flag. No path to real funds without all three.
- **Everything additive first.** Prefer adapters over rewrites. Every step is reversible by removing
  an adapter folder, disabling a flag, or deleting a new file.

---

## The safe order (see `MIGRATION_SEQUENCE.md` + `BUILD_PLAN.md` for the full sequence)

- **Stage 0 — Stabilize:** one owner per repo, confirm Base44↔GitHub sync direction, keep behavior
  unchanged.
- **Stage 1 — Decision:** confirm canonical repos + archive candidates (`CANONICAL_REPOS.md`).
- **Stage 2 — Contract:** land the 6 shared contracts; pilots = prism, oraclequant, emberscot,
  overlayflow.
- **Stage 3 — Telemetry:** request IDs, raw immutable capture, normalized + derived events.
- **Stage 4 — Adapters:** provider gateway wrappers, shared logging/config, overlay contracts.
- **Stage 5 — Consolidation:** merge duplicate repos ONLY after contract parity; archive spec repos
  ONLY after decision capture; keep a rollback path for every adapter.

The ordered, executable version (Phase 0–7, with `NOW`/`VENICE`/`FOUNDER`/`HOLD` tags and cost
notes) is `BUILD_PLAN.md`. The full 36-repo catalog is `IMPROVEMENTS.md`. The picture is
`oraclequant-unified-vision.html`.

---

## The golden rule (it saved us twice)

Before archiving or overwriting **any** repo:

```
git log --oneline origin/main -3     # is the remote still moving?
```

and check that no other background job's `cwd` points at that repo. **The workspace changes in real
time — verify, then act.** Never archive a repo whose remote is still moving.

---

## What is in this bundle

- `METHOD.md` — this file (the canonical method).
- `oraclequant-unified-vision.html` — the picture ("one Brain, six shirts").
- `BUILD_PLAN.md` — the ordered executable sequence (Phase 0–7).
- `IMPROVEMENTS.md` — the full 36-repo catalog + cross-cutting wins.
- `workspace-contracts/` — the migration sequence, canonical repos, schemas, and risk register.

The complete home-of-record (this bundle + the launch deliverables: `PROPOSAL.md`, `ONBOARDING.md`,
`LAUNCH_CHECKLIST.md`, `getrich-landing.html`) lives in the **`oraclequant`** repo.

> This bundle makes the method **findable**. It does **not** perform the merge — the merge is the
> incremental work described above, done one shirt at a time.
