# Canonical repos

This file records **provisional canonical decisions** for future merge work.

These choices are reversible. They do not change runtime behavior.

## Core decisions

| Area | Canonical / reference | Related repos | Disposition |
|---|---|---|---|
| Commerce + AI monolith | `prism` | other Base44 commerce-style apps | use as primary pilot and contract source |
| Prediction-market intelligence | `oraclequant` | `oraclequant-copy` | `oraclequant-copy` should merge into or archive behind `oraclequant` |
| Crypto execution / research engine | `crypto-trading-bot` | `kalshi-trading-bot` | `kalshi-trading-bot` remains spec input, not canonical runtime |
| Workspace control plane pilot | `emberscot` | `ai-workspace`, `deck` | `emberscot` is the execution pilot; `deck` is the local-first reference architecture |
| Local-first bus reference | `deck` and `overlayflow/bin/*` | workspace-wide | treat existing bus/checkpoint/rollback tools as the reference pattern |
| OverlayFlow landing surface | `overlayflow` | `overlayflow-aiproxy`, `overlayflow-android` | not duplicates, three layers of one system |
| OverlayFlow proxy layer | `overlayflow-aiproxy` | `overlayflow`, `overlayflow-android` | reusable service candidate |
| OverlayFlow device/client layer | `overlayflow-android` | `overlayflow`, `overlayflow-aiproxy` | mobile client layer |
| SETH family | `seth-copy` | `seth-copy2` | provisional canonical app is `seth-copy`; `seth-copy2` is a variant until proven primary |

## Notes

- `oraclequant` and `crypto-trading-bot` are **not duplicates**. One is a product intelligence surface, the other is a research/execution engine.
- `overlayflow`, `overlayflow-aiproxy`, and `overlayflow-android` should be treated as **one stack with three responsibilities**, not as merge duplicates.
- `deck` is best used as a **reference architecture** for local-first capture, checkpoint, rollback, and relay patterns.
