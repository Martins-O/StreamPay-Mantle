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
# Optional: enable WalletConnect QR flows
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
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
The interface needs deployed contract addresses to read/write data. After running the Foundry deployment scripts, append the values from `contracts/deployment.env` to `.env.local`.

If no addresses are configured the dashboard will stay in read-only mode and prompt you to supply the required env variables.

## Building for Production
```bash
npm run build
```
The compiled assets will be emitted to `dist/`. Host those assets on any static provider (Vercel, Netlify, IPFS, etc.).
