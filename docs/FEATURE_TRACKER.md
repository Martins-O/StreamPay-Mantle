# StreamPay Feature Tracker

This file tracks the major product features shipped so far, their health, and the upcoming initiatives we plan to tackle next. Percentages represent the estimated functional completeness in the current build.

## Shipped Features

| Feature | Description | Progress | Notes |
| --- | --- | --- | --- |
| Core streaming lifecycle | Create, pause, resume, cancel, and claim streams with on-chain enforcement and vault custody. | 95% | Covers single & batch flows; UX still needs faster state refresh post-transaction.
| Token approval flow | In-app allowance management so senders can approve the StreamManager without leaving the dashboard. | 90% | Works end-to-end; could add unlimited approval toggle and clearer messaging.
| Vault & yield wiring | Deposits route to StreamVault with optional strategy push for idle capital. | 70% | Strategy configuration manual; no UI to rebalance or surface yield APY yet.
| Notifications | Push/WalletConnect hooks broadcast key events (create, claim, pause, resume). | 60% | Stubs exist; needs production channel + granular opt-in controls.
| Analytics dashboard | Live candlestick chart with hourly/daily views of streamed vs projected flow. | 85% | Animates in real time; consider historical storage + export to CSV.
| Templates & batch creation | Pre-built templates and spreadsheet-like entry for streaming multiple recipients. | 75% | Lacks per-recipient duration and better error surfacing when parsing rows.

## Upcoming / Stretch Goals

| Priority | Feature | Outcome | Target |
| --- | --- | --- | --- |
| P0 | Stream health monitor | Predict sender balance runways, alert both parties before streams revert. | Hackathon demo (ASAP) |
| P0 | Stream intent marketplace | Allow recipients to publish stream templates that senders can fund in one click. | Hackathon demo |
| P1 | Programmable yield splitter | Let senders choose reserve vs strategy ratios per stream, show earned yield to recipients. | Post-demo polish |
| P1 | Automation triggers | Webhooks/Zapier hooks when claimable crosses thresholds or streams pause. | Post-demo |
| P2 | Cross-chain streaming router | Showcase cross-domain claim on Mantle + L1 via messaging bridge. | Stretch goal |
| P2 | Proof-of-flow credentials | Mint attestations for reliable senders/recipients to unlock perks. | Stretch goal |

## Change Log

- 2025-11-04: Initial tracker created with current feature snapshot and roadmap candidates.

Update this document as features evolve so the team and judges can quickly see progress.
