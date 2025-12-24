# Render Deployment Guide for Liquifi Backend

Complete guide to deploy the Liquifi backend API on Render.com

## Prerequisites

- [ ] Render.com account created
- [ ] GitHub repository with your code
- [ ] Backend environment variables ready (see below)

---

## Step 1: Prepare Backend for Deployment

### 1.1 Fix `.renderignore` (Already Fixed ✅)

The `.renderignore` file should NOT exclude `tsconfig.json`. We've already fixed this:

```
node_modules/
.env
.env.local
tests/
*.test.ts
*.test.js
```

### 1.2 Verify `package.json` Scripts

Your [backend/package.json](backend/package.json) should have:

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts"
  }
}
```

✅ Already configured correctly!

### 1.3 Ensure Dependencies are Correct

Move TypeScript from `devDependencies` to `dependencies` for Render builds:

```bash
cd backend
npm install --save typescript @types/node @types/express @types/cors
```

**Note**: Render needs TypeScript as a production dependency to compile your code.

---

## Step 2: Create Render Web Service

### 2.1 Create New Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository containing your code

### 2.2 Configure Build Settings

**Basic Settings:**
- **Name**: `liquifi-backend` (or your preferred name)
- **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch**: `main` (or your production branch)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**:
  ```bash
  npm install && npm run build
  ```
- **Start Command**:
  ```bash
  npm start
  ```

**Advanced Settings:**
- **Auto-Deploy**: Yes (recommended)
- **Instance Type**: Free (or Starter for production)

---

## Step 3: Configure Environment Variables

Go to **Environment** tab in Render dashboard and add these variables:

### Required Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `10000` | Render assigns port 10000 by default |
| `AI_SERVICE_URL` | `https://your-ai-service.onrender.com` | URL of your deployed AI service |
| `RISK_SIGNER_PRIVATE_KEY` | `0x1ed549bc...` | Private key for signing risk scores |
| `RISK_ORACLE_ADDRESS` | `0x49387C2bbF79348e80809eb534542E70ff139fEA` | RiskOracle contract address |
| `RISK_ORACLE_CHAIN_ID` | `5003` | Mantle Sepolia testnet |
| `YIELD_POOL_REGISTRY` | `./config/pools.local.json` | Path to pool registry |
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | Your frontend URL(s) |

### Example Configuration

```env
PORT=10000
AI_SERVICE_URL=https://liquifi-ai.onrender.com
RISK_SIGNER_PRIVATE_KEY=0x1ed549bc8b1e39ed8c55ec3c150ecfd751207e8f65c72b3854845490ced15e4f
RISK_ORACLE_ADDRESS=0x49387C2bbF79348e80809eb534542E70ff139fEA
RISK_ORACLE_CHAIN_ID=5003
YIELD_POOL_REGISTRY=./config/pools.local.json
ALLOWED_ORIGINS=https://liquifi.vercel.app,https://liquifi-preview.vercel.app
```

**Security Note**: For production, use Render's secret management or environment variable encryption for `RISK_SIGNER_PRIVATE_KEY`.

---

## Step 4: Deploy AI Service First

Before deploying the backend, deploy the AI service since the backend depends on it.

### 4.1 Create AI Service on Render

1. **New Web Service** → Select repository
2. **Configure**:
   - **Name**: `liquifi-ai-service`
   - **Root Directory**: `ai-service`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn app:app --host 0.0.0.0 --port $PORT
     ```

3. **Environment Variables**:
   ```env
   PORT=10000
   AI_LOG_LEVEL=INFO
   PYTHON_VERSION=3.11
   ```

4. **Deploy** and note the service URL (e.g., `https://liquifi-ai.onrender.com`)

### 4.2 Update Backend AI_SERVICE_URL

Go back to backend service environment variables and update:
```
AI_SERVICE_URL=https://liquifi-ai.onrender.com
```

---

## Step 5: Deploy Backend

Click **"Deploy"** or push to your GitHub branch.

### Build Process

Render will:
1. Clone your repository
2. Navigate to `backend/` directory
3. Run `npm install`
4. Run `npm run build` (compiles TypeScript → JavaScript in `dist/`)
5. Run `npm start` (starts `node dist/index.js`)

### Monitor Deployment

Watch the **Logs** tab for:
```
Mantle StreamYield backend listening on :10000
```

If successful, your backend is live at: `https://your-service.onrender.com`

---

## Step 6: Update Frontend Configuration

Update your frontend's production environment variables:

**For Vercel:**

Go to Vercel project settings → Environment Variables:

```env
VITE_BACKEND_API_URL=https://liquifi-backend.onrender.com
VITE_AI_SERVICE_URL=  # Leave empty - AI service should not be public
VITE_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
# ... other variables
```

**Local Development:**

Keep your local `.env.local` pointing to `http://127.0.0.1:4000` for local development.

---

## Step 7: Test Deployment

### Health Check

```bash
curl https://your-backend.onrender.com/health
```

Expected response:
```json
{"ok": true, "time": 1734956730355}
```

### Config Endpoint

```bash
curl https://your-backend.onrender.com/api/config
```

Expected response:
```json
{
  "riskOracleAddress": "0x49387C2bbF79348e80809eb534542E70ff139fEA",
  "aiServiceUrl": "https://liquifi-ai.onrender.com",
  "poolRegistryPath": "./config/pools.local.json"
}
```

### Test Business Registration

```bash
curl -X POST https://your-backend.onrender.com/api/business/register \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890123456789012345678901234567890",
    "name": "Test Business",
    "industry": "SaaS",
    "monthlyRevenue": 75000,
    "revenueVolatility": 15,
    "contactEmail": "test@example.com"
  }'
```

---

## Common Deployment Issues & Fixes

### Issue 1: Build Fails - "Cannot find module 'typescript'"

**Problem**: TypeScript is in `devDependencies` but Render doesn't install dev dependencies by default.

**Fix**: Move TypeScript to `dependencies`:
```bash
cd backend
npm install --save typescript @types/node @types/express @types/cors
git add package.json package-lock.json
git commit -m "fix: move TypeScript to dependencies for Render deployment"
git push
```

### Issue 2: Build Fails - "Cannot find tsconfig.json"

**Problem**: `.renderignore` is excluding `tsconfig.json`

**Fix**: Already fixed! We removed `tsconfig.json` from `.renderignore`.

### Issue 3: CORS Errors from Frontend

**Problem**: Frontend can't connect due to CORS

**Fix**: Add frontend URL to `ALLOWED_ORIGINS` in Render environment variables:
```
ALLOWED_ORIGINS=https://liquifi.vercel.app,https://liquifi-preview.vercel.app
```

### Issue 4: "Port already in use" or Service Won't Start

**Problem**: Hardcoded port instead of using Render's `PORT` environment variable

**Fix**: Our [config.ts](backend/src/config.ts#L20) already handles this correctly:
```typescript
port: Number(process.env.PORT ?? 4000)
```

Render automatically sets `PORT=10000`.

### Issue 5: AI Service Connection Fails

**Problem**: Backend can't reach AI service

**Fix**:
1. Verify AI service is deployed and healthy: `curl https://your-ai-service.onrender.com/health`
2. Update backend's `AI_SERVICE_URL` to match deployed AI service URL
3. Ensure AI service is public (Render allows web services to call each other)

### Issue 6: Free Tier Spin-Down

**Problem**: Render free tier services spin down after 15 minutes of inactivity

**Fix**:
- **Immediate**: First request after spin-down takes 30-60 seconds to wake up
- **Long-term**: Upgrade to Starter plan ($7/month) for always-on service
- **Workaround**: Use a service like UptimeRobot to ping your endpoint every 10 minutes

---

## Render.yaml (Alternative Deployment)

For infrastructure-as-code deployment, create `render.yaml` in project root:

```yaml
services:
  # Backend API
  - type: web
    name: liquifi-backend
    runtime: node
    rootDir: backend
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: PORT
        value: 10000
      - key: AI_SERVICE_URL
        sync: false
      - key: RISK_SIGNER_PRIVATE_KEY
        sync: false
      - key: RISK_ORACLE_ADDRESS
        value: 0x49387C2bbF79348e80809eb534542E70ff139fEA
      - key: RISK_ORACLE_CHAIN_ID
        value: 5003
      - key: YIELD_POOL_REGISTRY
        value: ./config/pools.local.json
      - key: ALLOWED_ORIGINS
        sync: false

  # AI Service
  - type: web
    name: liquifi-ai-service
    runtime: python
    rootDir: ai-service
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PORT
        value: 10000
      - key: AI_LOG_LEVEL
        value: INFO
      - key: PYTHON_VERSION
        value: 3.11
```

Deploy with: `render blueprint sync`

---

## Production Checklist

Before going to production:

- [ ] Use different private key for mainnet
- [ ] Update contract addresses to mainnet
- [ ] Change `RISK_ORACLE_CHAIN_ID` to mainnet (5000)
- [ ] Update `VITE_MANTLE_RPC_URL` to mainnet RPC
- [ ] Add proper rate limiting (consider API gateway)
- [ ] Set up monitoring (Sentry, Datadog, etc.)
- [ ] Enable HTTPS only (Render does this by default)
- [ ] Set up custom domain
- [ ] Configure backup strategy for `data/store.json`
- [ ] Move secrets to secure key management (AWS Secrets Manager, Vault)
- [ ] Enable logging and monitoring
- [ ] Set up alerts for service downtime
- [ ] Upgrade from Free to Starter plan ($7/month) for always-on

---

## Monitoring & Logs

### View Logs

In Render dashboard:
1. Go to your service
2. Click **"Logs"** tab
3. Watch real-time logs

### Custom Logging

Your backend uses Pino logger. Logs appear in Render's log viewer:

```typescript
logger.info("Mantle StreamYield backend listening on :10000");
logger.error({ err }, "Unable to start backend");
```

### Health Monitoring

Set up UptimeRobot or similar to monitor:
- `https://your-backend.onrender.com/health` (every 5 minutes)
- Alert if response is not 200 OK

---

## Scaling Considerations

### Horizontal Scaling

Render supports multiple instances:
- Go to service → **"Settings"** → **"Scaling"**
- Increase instance count (requires paid plan)

### Database

Currently using JSON file storage (`data/store.json`). For production:
1. Use PostgreSQL (Render offers managed PostgreSQL)
2. Update `DataStore` to use database instead of file
3. Share database across multiple instances

### Caching

Consider adding Redis for:
- Caching risk scores (TTL: 1 hour)
- Rate limiting
- Session management

---

## Cost Estimate

**Free Tier** (Good for testing):
- Backend: Free
- AI Service: Free
- **Total**: $0/month
- **Limitation**: Services spin down after 15 min inactivity

**Starter Plan** (Good for production):
- Backend: $7/month (always-on)
- AI Service: $7/month (always-on)
- PostgreSQL: $7/month (optional)
- **Total**: $14-21/month

---

## Support & Resources

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Python on Render](https://render.com/docs/deploy-fastapi)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Build & Deploy](https://render.com/docs/builds-deploys)

---

## Summary

1. ✅ Fixed `.renderignore` to include `tsconfig.json`
2. ✅ Backend package.json is correctly configured
3. ✅ Config uses `process.env.PORT` for Render compatibility
4. ⏭️ Deploy AI service first, note the URL
5. ⏭️ Deploy backend with AI service URL in environment variables
6. ⏭️ Update frontend `VITE_BACKEND_API_URL` to point to deployed backend
7. ⏭️ Test all endpoints

**Your backend is now ready to deploy on Render!** 🚀
