# Local-first reference

This workspace already contains a concrete local-first pattern.

## Reference implementation

- `overlayflow/bin/bus`
- `overlayflow/bin/deck-checkpoint`
- `overlayflow/bin/deck-rollback`
- `overlayflow/bin/deck-backup`
- `overlayflow/bin/relay`
- `deck/specs/claude-deck-spec.md`
- `deck/specs/gemini-orchestration-blueprint.md`

## Mapping

| Concept | Current reference |
|---|---|
| Immutable raw capture | `overlayflow/bin/bus` |
| Checkpoint boundary | `overlayflow/bin/deck-checkpoint` |
| Rollback guard | `overlayflow/bin/deck-rollback` |
| Backup / retention | `overlayflow/bin/deck-backup` |
| Relay / derived outputs | `overlayflow/bin/relay` |
| Human design spec | `deck/specs/*` |

## Rule

Future local-first work should extend this reference before inventing a second competing pattern.
