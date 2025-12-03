# StreamPay Mantle Frontend

This directory contains the Vite + React interface for the StreamPay Mantle protocol. The app lets senders create payment streams, recipients track live accruals, and both parties manage claims/cancellations on Mantle testnet.

## Tech Stack
- Vite + React 18 with TypeScript
- Wagmi v2 / Viem for on-chain interactions
- Tailwind CSS + shadcn/ui for styling
- Framer Motion & Recharts for visual feedback

## Getting Started
```bash
# From repo root
cd frontend

# Install dependencies
npm install

# Create an environment file
cp .env.example .env.local
```

Update `.env.local` with your deployment details:
```ini
VITE_STREAM_MANAGER_ADDRESS=0x...
VITE_STREAM_VAULT_ADDRESS=0x...
VITE_MOCK_USDT_ADDRESS=0x...
VITE_REVENUE_FACTORY_ADDRESS=0x...
VITE_RISK_ORACLE_ADDRESS=0x...
VITE_PRIMARY_YIELD_POOL=0x...
VITE_BACKEND_API_URL=http://127.0.0.1:4000
VITE_WALLETCONNECT_PROJECT_ID=your_project_id   # optional
```

Then run the dev server:
```bash
npm run dev
```

## Available Scripts
- `npm run dev` – start the Vite dev server (default port 5173)
- `npm run build` – create a production build in `dist/`
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint across the project

## Wallet Support
The UI exposes every Wagmi connector that is available at runtime:
- Injected wallets (MetaMask, Brave, Rabby, etc.)
- WalletConnect (requires `VITE_WALLETCONNECT_PROJECT_ID`)

Users can choose their provider from the “Connect Wallet” dialog in the navbar or dashboard.

## Contract Configuration
The interface needs deployed contract addresses to read/write data. After running `contracts/deploy.sh`, copy the printed addresses (or the ones you add to `contracts/deployment.env`) into `.env.local` so the Business workspace and Investor cockpit talk to the latest deployments.

If no addresses are configured the dashboard will stay in read-only mode and prompt you to supply the required env variables.

## NFT Receipts & Batch Claiming

Every stream minted through the UI now issues an ERC-721 receipt to the recipient. The dashboard shows per-token breakdowns for each NFT and exposes:

- **Multi-token streams** – add more than one ERC-20 allocation to a single stream
- **Batch claiming** – select multiple NFT receipts and withdraw them in one transaction
- **Transfer awareness** – as soon as an NFT moves to a new wallet, the UI updates the owner’s stream list automatically

Educate stream recipients to keep their NFT safe (or transfer it intentionally) because it is the credential required to continue claiming.

## Building for Production
```bash
npm run build
```
The compiled assets will be emitted to `dist/`. Host those assets on any static provider (Vercel, Netlify, IPFS, etc.).
