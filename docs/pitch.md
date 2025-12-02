# Mantle StreamYield – Pitch Notes

## One-liner
AI-scored RevenueTokens stream real-world yield to Mantle investors. Businesses tokenize ARR/rent/invoices, investors deposit stablecoins, and an AI oracle keeps risk transparent on-chain.

## Problem
- Working capital is trapped inside 30-90 day invoices and recurring subscriptions.
- Existing streaming tools don’t solve underwriting or investor visibility.
- Risk is communicated via PDFs, not signatures that contracts can trust.

## Solution
1. **RevenueTokenFactory** – Businesses mint ERC-20 claims with tenor + expected revenue metadata.
2. **StreamEngine** – Proven StreamPay logic repackaged to route repayments into YieldPools.
3. **YieldPool + YBT** – Investors deposit USDC/MNT, receive YieldBackedToken shares, and earn live streamed yield.
4. **AI Risk Oracle** – FastAPI service scores each business, backend signs payloads, `RiskOracleAdapter` enforces utilization caps on-chain.

## Why Mantle
- Ultra-low fees for second-by-second streaming + NFT receipts.
- Modular architecture encourages pairing RealFi assets with AI oracles.
- Mantle’s RealFi + AI hackathon theme is addressed end-to-end in one repo.

## Demo Flow (5 min)
1. **Business dashboard** (`/business`)
   - Connect wallet, register metadata, refresh AI risk (see signed payload + band).
   - Mint a RevenueToken (Wagmi transaction) and route a stream via `/dashboard`.
2. **Backend**
   - Show API logs for `/api/business/:addr/risk` calling the FastAPI scorer and signing payloads.
3. **Investor dashboard** (`/investor`)
   - Browse pools (risk band, APY, TVL), approve USDC, and call `deposit()` on YieldPool.
4. **Contracts**
   - Highlight Foundry tests covering mint → deposit → revenue streaming → risk update.

## Traction Hooks
- Extendable to invoice factoring, creator advances, real estate rent rolls.
- AI oracle can plug into off-chain data sources (banking, Plaid, ERP) for richer scoring.
- StreamEngine already issues transferable receipts (from StreamPay) for secondary markets.
