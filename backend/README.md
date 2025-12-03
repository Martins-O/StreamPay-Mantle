# Backend API

TypeScript Express API that orchestrates the AI risk service and signs payloads for the contracts.

## Setup

```bash
cd backend
cp .env.example .env            # edit private key, oracle address, allowed origins
./setup.sh                      # installs node_modules
mkdir -p data                    # ensure lightweight store path exists
```

## Development

```bash
npm run dev                     # runs on PORT (default 4000)
```

## Testing

```bash
npm test
```

## Configuration

| Variable | Purpose |
| --- | --- |
| `AI_SERVICE_URL` | FastAPI risk microservice base URL (defaults to `http://127.0.0.1:8001`). |
| `RISK_SIGNER_PRIVATE_KEY` | Hex private key used to sign payloads for `RiskOracleAdapter`. |
| `RISK_ORACLE_ADDRESS` | On-chain adapter address printed by `contracts/deploy.sh`. |
| `YIELD_POOL_REGISTRY` | Path to the JSON file describing demo pools exposed via `/api/pools` (update the addresses after every deployment). |
| `ALLOWED_ORIGINS` | Comma-separated list of frontend origins for CORS. |

The API expects the AI service to be reachable at `AI_SERVICE_URL` and writes its lightweight JSON datastore inside `data/store.json`. Update `config/pools.local.json` with the deployed `baseToken`, `yieldPool`, and minted `revenueToken` addresses so `/api/pools` mirrors on-chain state. Run `./start-services.sh` from repo root to boot AI + backend + frontend simultaneously during local development.
