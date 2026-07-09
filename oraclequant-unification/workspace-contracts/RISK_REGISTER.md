# Risk register

| ID | Risk | Area | Likelihood | Impact | Mitigation | Reversible guard |
|---|---|---|---|---|---|---|
| R1 | Shared contracts drift across 42 repos | manifests/contracts | medium | high | validate every manifest before deeper rollout | additive files only |
| R2 | Duplicate repos diverge further | canonicalization | high | high | freeze canonical decisions before contract extraction | decisions live in one file |
| R3 | Raw-data capture accidentally stores secrets or private unsafe material | local-first data layer | medium | critical | explicit no-secrets rule, allowlists, redaction boundary | keep raw capture behind adapters |
| R4 | A second local-first pattern appears and conflicts with Deck/OverlayFlow bus | architecture | medium | high | treat Deck and overlayflow bin tools as the current reference implementation | document reference before coding |
| R5 | Pilot repo contracts overfit one app | shared contracts | medium | high | start with minimal fields and version schemas early | use optional fields first |
| R6 | OverlayFlow layers get merged conceptually even though they serve different roles | overlay stack | high | medium | keep site, proxy, and android roles separate in manifests and canonical file | layer-specific manifests |
| R7 | Reversible docs become stale and misleading | planning | medium | medium | add validator and execution queue | delete stale docs if superseded |
