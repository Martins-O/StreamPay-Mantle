# StreamPay Feature Tracker

This file tracks the major product features shipped so far, their health, and the upcoming initiatives we plan to tackle next. Percentages represent the estimated functional completeness in the current build.

## Shipped Features

| Feature | Description | Progress | Notes |
| --- | --- | --- | --- |
| Core streaming + vault custody | StreamEngine + StreamVault handle create/pause/resume/cancel/claim flows with multi-token support and yield strategy hooks. | 100% | All lifecycle paths covered by Foundry tests and surfaced in the legacy console. |
| Business workspace & AI risk | Wallet onboarding, profile registration, AI score refresh, signed payload display, and RevenueToken mint form. | 90% | Live scoring + backend signing shipped; next step is pushing payloads on-chain automatically from the UI. |
| RevenueTokenFactory + mint scripts | Businesses can mint tenor-bound ERC-20s via the UI or `MintRevenueToken.s.sol`, feeding pools. | 85% | Factory deployed + helper script; need UI listing of minted tokens and metadata editing. |
| Investor cockpit & pool registry | Backend JSON registry drives pool cards (risk band, APY, TVL) and Wagmi-powered approvals/deposits. | 85% | Works with real pools; add multi-pool sorting + withdraw flow post-demo. |
| Legacy console + advanced ops | Power dashboard lists every stream, NFT receipt holder, vault balances, batch creation, and batch claiming. | 80% | UX polished; automate reminders + CSV exports in a follow-up. |

## Upcoming / Stretch Goals

| Priority | Feature | Outcome | Target |
| --- | --- | --- | --- |
| P0 | Notifications & alerts | Wire Push/WalletConnect Notify to broadcast create/claim/pause events and add email/webhook fallbacks. | Immediate polish |
| P0 | Pool analytics | Surface on-chain streamed volume, utilization caps, and risk history in `/investor`. | Immediate polish |
| P1 | Automated yield mgmt | UI to adjust reserve ratios + push idle balances to strategies directly from the dashboard. | Post-demo |
| P1 | Stream health monitor | Predict sender runways and warn both parties before claims fail. | Post-demo |
| P2 | Stream templates/marketplace | Recipients publish receivable templates, senders fund them in a click. | Stretch |
| P2 | Cross-chain withdrawals | Research Mantle ↔ L1 bridging for streamed funds. | Stretch |

## Change Log

- 2025-02-18: Updated tracker to reflect deployed RevenueToken + pool registry + AI backend work.
- 2025-02-14: Added NFT receipt + batch claim milestone and marked core streaming lifecycle as complete.
- 2025-01-04: Initial tracker created with current feature snapshot and roadmap candidates.

Update this document as features evolve so the team and judges can quickly see progress.
