# Migration sequence

This is the safest reversible order for future implementation.

## Stage 0

- keep all current product behavior unchanged
- keep all work additive
- prefer adapters over rewrites

## Stage 1: decision layer

1. confirm canonical repos
2. confirm duplicate/archive candidates
3. freeze shared naming for the first contract set

Blocking files:
- `CANONICAL_REPOS.md`
- `execution-queue.json`
- `RISK_REGISTER.md`

## Stage 2: contract layer

1. `RepoManifest`
2. `UserRef`
3. `UsageEvent`
4. `WalletEvent`
5. `Signal`
6. `AgentEvent`

Pilot repos:
- `prism`
- `oraclequant`
- `emberscot`
- `overlayflow`

## Stage 3: telemetry layer

1. request IDs
2. raw immutable event capture
3. normalized events
4. derived product events

## Stage 4: shared adapters

1. provider gateway wrappers
2. shared logging shape
3. shared config validation
4. overlay contracts

## Stage 5: consolidation

1. merge duplicate repos only after contract parity
2. archive spec repos only after decision capture
3. keep rollback path for every adapter introduction
