# Local-first raw-data execution plan

This is a reversible planning file. It does not change runtime behavior.

## Goal

Create a workspace-wide pattern that keeps the strongest possible raw signal while staying safe:

1. raw capture layer
2. normalized layer
3. derived intelligence layer
4. product-facing layer

## Rules

- raw inputs stay immutable
- normalization is versioned
- derived outputs must reference source records
- secrets and unsafe private data are never stored as raw-data artifacts
- every future runtime rollout should be gated behind repo-local flags or isolated adapters

## Phase order

### Phase 1
- manifests in every repo
- local-first architecture note in every repo
- pilot repos identified

### Phase 2
- add contract folders to pilot repos
- define event and data schemas
- add reversible adapters only

### Phase 3
- add provider telemetry
- add request IDs and usage logs
- add raw-to-normalized pipelines

### Phase 4
- integrate shared contracts across repos
- choose canonical repos
- deprecate duplicate paths gradually

## Pilot repos

- prism
- oraclequant
- emberscot
- overlayflow

## First shared contracts to define

- UserRef
- UsageEvent
- WalletEvent
- Signal
- AgentEvent
- RepoManifest

## Reversibility standard

Every future implementation step should be reversible by:
- removing an adapter folder
- disabling a feature flag
- deleting a new manifest/contract file
- leaving existing product behavior untouched unless explicitly approved
