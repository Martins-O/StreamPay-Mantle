# Mantle StreamYield

> AI-powered tokenized cashflow + yield streaming protocol for real-world businesses on Mantle.

Mantle StreamYield extends the original StreamPay contracts into a full-stack RealFi rail:

- **Businesses** tokenize subscriptions, invoices, or rent into `RevenueToken`s, stream repayments via the `StreamEngine`, and publish AI-signed risk updates.
- **Investors** deposit stablecoins into `YieldPool`s, receive `YieldBackedToken` shares, and earn pro-rata yield the moment revenue flows in.
- **AI Risk Service** continuously scores each merchant, the backend signs payloads, and `RiskOracleAdapter` enforces exposure on-chain.

## System Architecture

```mermaid
graph TD
    subgraph Mantle
        RF[RevenueTokenFactory]
        RT[RevenueToken]
        SE[StreamEngine]
        YP[YieldPool]
        YBT[YieldBackedToken]
        RO[RiskOracleAdapter]
    end

    subgraph Off-chain
        FE[React Frontend]
        BE[TypeScript Backend]
        AI[FastAPI Risk Service]
        DB[(Lightweight Store)]
    end

    Business --> FE
    Investor --> FE
    FE <--> BE
    BE <--> AI
    BE -->|signed payload| RO
    Business --> RF --> RT --> SE --> YP
    RT --> RO
    SE --> YP --> InvestFlow[Investors]
```

### Repo Layout

| Path | Purpose |
| --- | --- |
| `contracts/` | Foundry workspace with `RevenueTokenFactory`, `RevenueToken`, `YieldPool`, `YieldBackedToken`, `RiskOracleAdapter`, `StreamDescriptor`, and `StreamEngine` (wrapper around legacy streaming logic). |
| `frontend/` | Vite + React app (Wagmi, shadcn) with Landing, Business Dashboard, Investor Dashboard, and the legacy streaming console. |
| `backend/` | Node.js + Express API for business registration, AI orchestration, and risk signing. Includes Vitest coverage for the risk service. |
| `ai-service/` | FastAPI microservice producing deterministic risk scores based on revenue + volatility inputs. |
| `docs/` | Architecture notes, deployment checklist, demo script, and the new `pitch.md`. |

## 🚀 Quick Start for Judges

### Prerequisites
- MetaMask or compatible Web3 wallet
- Mantle Sepolia testnet configured (Chain ID: 5003)
- Testnet MNT tokens from [Mantle Faucet](https://faucet.sepolia.mantle.xyz/)

### Current Deployment (Mantle Sepolia Testnet)

The contracts are deployed and ready to test:

| Contract | Address | Explorer Link |
|----------|---------|---------------|
| StreamEngine | `0x60bd590bc841D8558B279F064459a91Afd0d6015` | [View on Explorer](https://explorer.sepolia.mantle.xyz/address/0x60bd590bc841D8558B279F064459a91Afd0d6015) |
| YieldPool | `0x9187487Bd77c200d7f1Fa798c797D1a6cC65627D` | [View on Explorer](https://explorer.sepolia.mantle.xyz/address/0x9187487Bd77c200d7f1Fa798c797D1a6cC65627D) |
| RiskOracleAdapter | `0x49387C2bbF79348e80809eb534542E70ff139fEA` | [View on Explorer](https://explorer.sepolia.mantle.xyz/address/0x49387C2bbF79348e80809eb534542E70ff139fEA) |
| RevenueTokenFactory | `0x6f0021c43d7b26A8058EC7880df807B65727A33E` | [View on Explorer](https://explorer.sepolia.mantle.xyz/address/0x6f0021c43d7b26A8058EC7880df807B65727A33E) |
| Mock USDT (Test Token) | `0x5dB24867c863dE8262c12627381199556DF2d546` | [View on Explorer](https://explorer.sepolia.mantle.xyz/address/0x5dB24867c863dE8262c12627381199556DF2d546) |

### Try It Out

**Option 1: Use Deployed Frontend** (if hosted)
- Visit the hosted app (URL TBD)
- Connect your wallet
- Try the Business or Investor flows

**Option 2: Run Locally**
```bash
# Clone the repo
git clone https://github.com/Martins-O/StreamPay-Mantle.git
cd StreamPay-Mantle

# Quick start all services
./start-services.sh

# Or start individually:
# Terminal 1: AI Service
cd ai-service && source .venv/bin/activate && uvicorn app:app --reload --port 8001

# Terminal 2: Backend
cd backend && npm install && npm run dev

# Terminal 3: Frontend
cd frontend && npm install && npm run dev
```

Then visit `http://localhost:3000` and explore:
- **Business Dashboard** (`/business`) - Register, get AI risk score, mint RevenueTokens, view streams
- **Investor Dashboard** (`/investor`) - Browse pools, deposit stablecoins, earn yield
- **Legacy Console** (`/legacy-console`) - Advanced stream management tools

### Test Flow (5 minutes)

1. **Get testnet funds**: Visit [Mantle Faucet](https://faucet.sepolia.mantle.xyz/) for MNT
2. **Business setup**: Go to `/business`, register your profile, click "Refresh Risk Score"
3. **Mint revenue token**: Fill in expected revenue and tenor, mint a RevenueToken
4. **View streams**: See your streams displayed as NFT cards with status indicators
5. **Investor flow**: Switch to `/investor`, browse pools, deposit test USDT to earn yield

## Getting Started

### 0. Environment checklist

1. `cp contracts/.env.example contracts/.env` and fill `PRIVATE_KEY`, RPC URLs, and (optionally) `RISK_SIGNER_ADDRESS`. When omitted, the deployer address becomes the signer used by the backend + oracle.
2. `cp backend/.env.example backend/.env` and set `AI_SERVICE_URL`, `RISK_SIGNER_PRIVATE_KEY`, `RISK_ORACLE_ADDRESS`, and `RISK_ORACLE_CHAIN_ID` (matches the network used during deployment).
3. `cp frontend/.env.example frontend/.env.local` and paste the deployed contract addresses once the Foundry script runs.
4. `cd ai-service && ./setup.sh` to create the virtualenv and install FastAPI deps.

### 1. Contracts (Mantle)

```bash
cd contracts
cp .env.example .env   # fill PRIVATE_KEY, RPC_URL, optional overrides
forge test              # runs StreamYield integration tests
./deploy.sh             # deploy StreamEngine, YieldPool, oracle, factory
# copy the printed addresses into contracts/deployment.env, backend/.env, frontend/.env.local
```

### 2. Backend API

```bash
cd backend
cp .env.example .env
# edit PORT, AI_SERVICE_URL, RISK_SIGNER_PRIVATE_KEY, RISK_ORACLE_ADDRESS, RISK_ORACLE_CHAIN_ID, etc.
npm install
npm run dev             # Express server on http://localhost:4000
# npm test              # Vitest suite covering risk signing helpers
```

### 3. AI Risk Microservice

```bash
cd ai-service
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env.local
# populate VITE_* addresses (StreamEngine, RevenueFactory, YieldPool, backend URL)
npm install
npm run dev             # Vite dev server on http://localhost:3000
```

### Dev Workflow

1. Start the AI service (`cd ai-service && source .venv/bin/activate && uvicorn app:app --reload --port 8001`) or run all components via `./start-services.sh` from repo root.
2. Boot the backend (`cd backend && npm run dev`). It loads contract/risk addresses from `.env`, polls the AI service, signs payloads, and exposes `/api/*` routes + metrics.
3. Launch the frontend (`cd frontend && npm run dev`) to access landing, Business workspace, Investor cockpit, and the legacy console.
4. Touch the legacy `/legacy-console` route whenever you need the original multi-stream tooling.

## Key Features

- **RevenueTokenFactory + RevenueToken** – tokenizes future cashflow with expected revenue / tenor metadata. Businesses or the factory can link tokens to pools.
- **YieldPool + YieldBackedToken** – share-based pool with live `totalAssets`, capacity caps derived from AI risk band, and `deposit/withdraw/onRevenueReceived` flows.
- **RiskOracleAdapter** – verifies ECDSA payloads from the backend signer, stores score + band, and exposes data to pools or UIs.
- **StreamEngine** – wraps the proven `StreamManager` streaming code while tagging streams with YieldPool metadata.
- **StreamDescriptor** – generates on-chain SVG metadata for stream NFT receipts with visual representations of payment streams.
- **Backend API** – handles business registration, fetches AI scores, signs risk payloads, and exposes investor-ready pool metrics.
- **AI Microservice** – FastAPI scoring endpoint with deterministic rules using revenue / volatility / missed payments → `LOW/MEDIUM/HIGH` bands.
- **Frontend UX**
  - Landing page rethemed for Mantle StreamYield with CTA for Businesses vs Investors.
  - Business dashboard: register profile, refresh AI risk, mint RevenueTokens via Wagmi, and view live streams with NFT visualization.
  - Investor dashboard: browse pools, view Mantle metrics, approve + deposit stablecoins into YieldPool contracts.
  - Stream NFT cards: visual receipt cards showing stream status (Active/Paused/Inactive) with real-time updates.

## Testing

| Layer | Command |
| --- | --- |
| Smart contracts | `cd contracts && forge test` |
| Backend | `cd backend && npm test` (Vitest) |
| Frontend | `cd frontend && npm run lint` / `npm run test` (if configured) |

> The forge suite covers the new StreamYield integration: RevenueToken minting, capacity gating from `RiskOracleAdapter`, and signature validation. Backend Vitest specs cover risk-payload signing (requires Node deps).

## Demo Script

1. **Business flow**
   - Connect wallet on `/business`, register company metadata.
   - Refresh risk score – backend calls the AI service, signs payload, and the UI shows band + timestamp.
   - Mint a `RevenueToken` (uses Wagmi + Factory). Stream assets via `/dashboard` (legacy console) into the selected `YieldPool`.
2. **Investor flow**
   - Visit `/investor`, pick a pool, review AI risk & APY, approve USDC, and deposit. The UI calls `deposit()` on the configured YieldPool.
3. **Risk telemetry**
   - Trigger `/api/business/:address/risk` to push a new score. The risk band instantly updates on both dashboards.

## Why Mantle

- **Ultra-low fees**: The StreamEngine mints NFTs + streams multiple ERC-20s for pennies on Mantle testnet.
- **Modular stack**: Mantle's modular rollup lets us compose RealFi rails (revenue tokens + AI oracles) without touching L1.
- **RealFi focus**: Mantle's 2025 hackathon theme aligns with tokenized cashflow + AI underwriting — StreamYield showcases a full vertical slice.

## Deployment

### Render (Hosting)

For deploying to Render, see [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed instructions.

**Quick Fix for Common Error**: If you see `Cannot find module '/opt/render/project/src/backend/dist/index.js'`, you need to set the **Root Directory** to `backend` in your Render service settings.

The repository includes a `render.yaml` file for automated deployment of both backend and frontend services.

### Other Platforms

- **Vercel/Netlify**: Frontend can be deployed as a static site (set build directory to `frontend/`)
- **Railway/Fly.io**: Backend can be deployed as a Node.js app (set root to `backend/`)
- **AWS/GCP/Azure**: Standard container/VM deployment with Docker

## Docs & Pitch

See `docs/` for architecture, deployment steps, and the new [`docs/pitch.md`](docs/pitch.md) cheat sheet for hackathon judges.
