                                                                                                                                                                              # Liquifi Service Integration Guide

This guide explains how to connect and deploy all Liquifi platform services.

## Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│  Backend API │────────▶│ AI Service  │
│  (React)    │         │  (Express)   │         │  (FastAPI)  │
│  Port: 3000 │         │  Port: 4000  │         │ Port: 8001  │
└──────┬──────┘         └──────┬───────┘         └─────────────┘
       │                       │
       │                       │
       └───────────────────────▼
                    ┌──────────────────┐
                    │ Smart Contracts  │
                    │  (Mantle L2)     │
                    └──────────────────┘
```

## Services

1. **Frontend (React + Vite)** - User interface on port 3000
2. **Backend API (Express + TypeScript)** - Business logic and orchestration on port 4000
3. **AI Service (FastAPI + Python)** - Risk scoring service on port 8001
4. **Smart Contracts** - Deployed on Mantle Sepolia testnet

---

## Environment Configuration

### 1. Frontend `.env.local`

Location: `/frontend/.env.local`

```env
# Core contract addresses
VITE_STREAM_MANAGER_ADDRESS=0x60bd590bc841D8558B279F064459a91Afd0d6015
VITE_STREAM_VAULT_ADDRESS=0x3B4AB8Bd7D5Bc7D92447bE88D95c0844E1296792
VITE_MOCK_USDT_ADDRESS=0x5dB24867c863dE8262c12627381199556DF2d546
VITE_STREAM_TOKEN_ADDRESS=0xE60411A07a4Be365BAB5CA7C48315Ccf512BF8c0
VITE_REVENUE_FACTORY_ADDRESS=0x6f0021c43d7b26A8058EC7880df807B65727A33E
VITE_RISK_ORACLE_ADDRESS=0x49387C2bbF79348e80809eb534542E70ff139fEA
VITE_PRIMARY_YIELD_POOL=0x9187487Bd77c200d7f1Fa798c797D1a6cC65627D

# Mantle RPC URL
VITE_MANTLE_RPC_URL=https://mantle-sepolia.drpc.org

# Backend + AI services ✅ NOW CONFIGURED
VITE_BACKEND_API_URL=http://127.0.0.1:4000
VITE_AI_SERVICE_URL=http://127.0.0.1:8001

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=39831ec94057d8e5da5d644b0d56e364
PORT=3000
```

**Status**: ✅ Configured

### 2. Backend `.env`

Location: `/backend/.env`

```env
PORT=4000
AI_SERVICE_URL=http://127.0.0.1:8001
RISK_SIGNER_PRIVATE_KEY=0x1ed549bc8b1e39ed8c55ec3c150ecfd751207e8f65c72b3854845490ced15e4f
RISK_ORACLE_ADDRESS=0x49387C2bbF79348e80809eb534542E70ff139fEA
YIELD_POOL_REGISTRY=./config/pools.local.json
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Status**: ✅ Configured

### 3. AI Service `.env`

Location: `/ai-service/.env`

```env
AI_SERVICE_PORT=8001
AI_LOG_LEVEL=INFO
```

**Status**: ✅ Created

---

## Starting All Services

### Option 1: Use the Start Script (Recommended)

```bash
# From project root
./start-services.sh
```

This automatically starts:
- AI Service on port 8001
- Backend API on port 4000
- Frontend on port 3000

Press `Ctrl+C` to stop all services.

### Option 2: Start Services Manually

**Terminal 1 - AI Service:**
```bash
cd ai-service
source .venv/bin/activate  # or: .venv\Scripts\activate on Windows
uvicorn app:app --reload --port 8001
```

**Terminal 2 - Backend API:**
```bash
cd backend
npm run dev
# Runs on port 4000
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on port 3000
```

---

## Service Connection Flow

### Business Registration Flow

```
1. User fills registration form in Frontend (Business.tsx)
   ↓
2. Frontend → POST /api/business/register → Backend API
   ↓
3. Backend stores profile in DataStore (JSON file)
   ↓
4. Backend → POST /score-business → AI Service
   ↓
5. AI Service calculates risk score (0-100) + band (LOW/MEDIUM/HIGH)
   ↓
6. Backend signs risk data with EIP-712 signature
   ↓
7. Backend returns: { profile, risk: { score, band, signature, rationale } }
   ↓
8. Frontend displays profile + risk score
   ↓
9. User calls createRevenueToken() on smart contract with signature
```

### Risk Score Refresh Flow

```
1. User clicks "Refresh Risk" in Frontend
   ↓
2. Frontend → POST /api/business/{address}/risk → Backend API
   ↓
3. Backend → POST /score-business → AI Service (with updated params)
   ↓
4. AI Service recalculates risk score
   ↓
5. Backend signs new risk data
   ↓
6. Backend returns: { record: { score, band, signature, rationale } }
   ↓
7. Frontend displays updated risk score
```

---

## Health Checks

Verify all services are running:

```bash
# AI Service
curl http://127.0.0.1:8001/health
# Expected: {"ok": true}

# Backend API
curl http://127.0.0.1:4000/health
# Expected: {"ok": true, "time": 1234567890}

# Frontend
curl http://127.0.0.1:3000
# Expected: HTML response
```

---

## API Endpoints

### AI Service (Port 8001)

- `GET /health` - Health check
- `POST /score-business` - Calculate risk score
  ```json
  {
    "address": "0x123...",
    "monthlyRevenue": 75000,
    "revenueVolatility": 15,
    "missedPayments": 0,
    "useVerifiedData": false
  }
  ```
- `POST /verify-revenue` - Simulate external revenue verification

### Backend API (Port 4000)

- `GET /health` - Health check
- `GET /api/config` - Get backend configuration
- `POST /api/business/register` - Register new business
- `GET /api/business/:address` - Get business profile
- `GET /api/business/:address/risk` - Get current risk score
- `POST /api/business/:address/risk` - Refresh risk score
- `GET /api/pools` - Get all YieldPools
- `GET /api/pools/:id/metrics` - Get pool metrics

---

## Testing the Integration

### 1. Start All Services

```bash
./start-services.sh
```

### 2. Open Frontend

Navigate to: http://localhost:3000

### 3. Test Business Registration

1. Go to **Business** workspace
2. Connect your wallet
3. Fill in registration form:
   - Business name
   - Industry (SaaS, Trade Finance, Real Estate)
   - Monthly revenue: $75,000
   - Revenue volatility: 15%
   - Contact email
4. Click "Register Profile"
5. Backend will call AI service and return risk score
6. You should see: Risk score (0-100), band (LOW/MEDIUM/HIGH), rationale

### 4. Test Risk Refresh

1. Click "Refresh Risk Score"
2. Optionally adjust revenue/volatility
3. Backend calls AI service again
4. New risk score appears

### 5. Test Smart Contract Integration

1. After registration, click "Mint RevenueToken"
2. Frontend calls `createRevenueToken()` with signed risk data
3. Smart contract verifies signature on-chain
4. RevenueToken ERC-20 is deployed

---

## Troubleshooting

### Frontend can't reach backend

**Problem**: `Failed to fetch` errors in browser console

**Solution**:
1. Verify backend is running: `curl http://127.0.0.1:4000/health`
2. Check CORS configuration in `backend/.env`:
   ```
   ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```
3. Check frontend `.env.local` has:
   ```
   VITE_BACKEND_API_URL=http://127.0.0.1:4000
   ```
4. Restart frontend dev server (Vite needs restart for env changes)

### Backend can't reach AI service

**Problem**: Backend logs show "Connection refused" to port 8001

**Solution**:
1. Verify AI service is running: `curl http://127.0.0.1:8001/health`
2. Check backend `.env`:
   ```
   AI_SERVICE_URL=http://127.0.0.1:8001
   ```
3. Check AI service is listening on correct port:
   ```bash
   cd ai-service
   source .venv/bin/activate
   uvicorn app:app --reload --port 8001
   ```

### Smart contract calls fail

**Problem**: Transactions revert or signature verification fails

**Solution**:
1. Verify contract addresses in frontend `.env.local` match deployed contracts
2. Check wallet is connected to Mantle Sepolia (Chain ID: 5003)
3. Verify RPC URL is working:
   ```
   VITE_MANTLE_RPC_URL=https://mantle-sepolia.drpc.org
   ```
4. Ensure risk signature is fresh (< 1 hour old)

### Port already in use

**Problem**: `EADDRINUSE` errors when starting services

**Solution**:
```bash
# Find and kill process on port
lsof -i :3000  # or :4000 or :8001
kill -9 <PID>

# Or use different ports
PORT=3001 npm run dev  # Frontend
PORT=4001 npm run dev  # Backend
AI_SERVICE_PORT=8002 uvicorn app:app  # AI Service
```

---

## Production Deployment

### Environment Variables for Production

Update these for production:

**Frontend**:
- `VITE_BACKEND_API_URL=https://api.liquifi.io`
- `VITE_AI_SERVICE_URL` → Remove (AI service should not be public)
- `VITE_MANTLE_RPC_URL=https://rpc.mantle.xyz` (mainnet)
- Update all contract addresses to mainnet deployments

**Backend**:
- `AI_SERVICE_URL=http://ai-service:8001` (internal Docker network)
- `RISK_SIGNER_PRIVATE_KEY` → Use secrets manager (AWS Secrets, Vault)
- `ALLOWED_ORIGINS=https://app.liquifi.io`
- `PORT=4000`

**AI Service**:
- Should NOT be publicly accessible
- Only backend should communicate with it
- Deploy in same VPC/network as backend

### Deployment Options

See the main deployment guide for:
- Docker Compose setup
- Railway deployment
- AWS ECS deployment
- Vercel (frontend) + Railway (backend) setup

---

## Security Checklist

- [ ] AI Service is NOT publicly accessible (only backend can reach it)
- [ ] Backend CORS only allows your frontend domain
- [ ] Private keys stored in secure key management (not in .env)
- [ ] Rate limiting enabled on backend API
- [ ] Frontend uses HTTPS in production
- [ ] Different private keys for testnet/mainnet
- [ ] Smart contract addresses verified before deployment

---

## Architecture Decisions

### Why separate AI Service?

- **Speed**: FastAPI/Python for fast ML inference
- **Isolation**: AI logic separate from business logic
- **Scalability**: Can scale AI service independently
- **Security**: Keep AI service internal, not exposed to public

### Why backend signer?

- **Security**: Private key never touches frontend/browser
- **Reliability**: Centralized signing with rate limiting
- **Auditability**: All signatures logged in backend

### Why off-chain risk scoring?

- **Cost**: On-chain ML would be prohibitively expensive
- **Speed**: Off-chain scoring completes in < 60 seconds
- **Flexibility**: Easy to update ML models without contract upgrades
- **Trust**: EIP-712 signatures provide cryptographic proof

---

## Next Steps

1. ✅ Environment variables configured
2. ✅ All services can communicate
3. ⏭️ Test full business registration flow
4. ⏭️ Test risk refresh flow
5. ⏭️ Test RevenueToken minting with signed data
6. ⏭️ Test investor deposit into YieldPool
7. ⏭️ Deploy to production

---

## Support

- Backend API logs: `backend/` (uses Pino logger)
- AI Service logs: Console output from FastAPI
- Frontend errors: Browser DevTools console
- Smart contract events: [Mantle Explorer](https://explorer.testnet.mantle.xyz)

**All services are now connected and ready to use!** 🚀
