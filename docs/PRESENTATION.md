# StreamPay Mantle – Presentation Script

Use this outline for a 5–7 minute live walkthrough. Each numbered section maps to a slide or screen share segment.

## 1. Hook (Slide)
- **Title:** "Real-time Revenue Streaming on Mantle"
- **Narrative:** Working capital is trapped in invoices and ARR. StreamPay turns those receivables into yield-bearing flows secured by AI risk scores.

## 2. Architecture Snapshot (Slide)
- Diagram callouts:
  - `StreamEngine + StreamVault` on Mantle
  - `RevenueTokenFactory` for business-side tokenization
  - `YieldPool + YieldBackedToken` for investors
  - Backend Express service + FastAPI scorer feeding `RiskOracleAdapter`
- Reinforce that every component in the repo maps 1:1 to the boxes shown.

## 3. Business Workspace (Live demo)
1. Connect wallet on `/business`.
2. Show existing profile or register a new one.
3. Click **Refresh AI risk** → point out the signed payload + nonce/expiry.
4. Mint a RevenueToken (or show the transaction history if already minted).

## 4. Backend + AI (Terminal)
- Tail the backend logs while triggering `/api/business/:address/risk`.
- Highlight the FastAPI request, the signed `RiskPayload`, and where it is cached.
- Optional: paste the payload into `cast call` to verify `RiskOracleAdapter.hashPayload` matches.

## 5. Investor Cockpit (Live demo)
1. Navigate to `/investor`.
2. Show the pool card populated from `backend/config/pools.local.json`.
3. Approve Mock USDT → deposit into the YieldPool.
4. Point out how risks bands/APY/TVL update instantly after the backend refresh.

## 6. Legacy Console (Live demo)
- Open `/legacy-console` to prove advanced controls exist: stream table, NFT ownership, pause/resume/cancel buttons, batch creation/claiming, and vault balances per token.

## 7. Technical Receipts (Slide)
- List deployed addresses (StreamEngine, Vault, Mock USDT, RevenueTokenFactory, RiskOracleAdapter, YieldPool, YieldBackedToken).
- Mention Foundry tests + Forge scripts (`Deploy.s.sol`, `MintRevenueToken.s.sol`).

## 8. Closing (Slide)
- Reiterate Mantle alignment: low fees, AI + RealFi synergy.
- Next steps: notify hooks, pool analytics, automated yield management.
- CTA: “We’re ready to onboard the next batch of RealFi businesses on Mantle.”

> Tip: keep every slide uncluttered. The strength of the presentation comes from showing real contracts + dashboards running locally with the addresses highlighted in `docs/DEPLOYMENT.md`.
