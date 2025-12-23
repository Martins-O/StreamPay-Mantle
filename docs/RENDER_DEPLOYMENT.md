# Render Deployment Guide

## Quick Fix for Current Error

The error `Cannot find module '/opt/render/project/src/backend/dist/index.js'` occurs because Render is trying to run the backend from the repository root instead of the `backend/` directory.

### Option 1: Use render.yaml (Recommended)

A `render.yaml` file has been created in the root of the repository. To use it:

1. Go to your Render Dashboard
2. Click on your existing service
3. Go to **Settings** → **Build & Deploy**
4. Delete the old service (or update it)
5. Create a new service and select "Use render.yaml"
6. Render will automatically detect the configuration

### Option 2: Update Existing Service Manually

If you want to keep your existing service:

#### Backend Service Configuration

1. **Root Directory**: `backend`
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Node Version**: 18 or higher

#### Environment Variables (Backend)

Required:
- `PORT`: `4000`
- `RISK_SIGNER_PRIVATE_KEY`: Your private key (from contracts deployment)
- `RISK_ORACLE_ADDRESS`: `0x49387C2bbF79348e80809eb534542E70ff139fEA`
- `RISK_ORACLE_CHAIN_ID`: `5003`
- `AI_SERVICE_URL`: URL of your AI service (or mock value if not deployed)
- `ALLOWED_ORIGINS`: `*` (or your frontend URL)

Optional:
- `NODE_ENV`: `production`
- `YIELD_POOL_REGISTRY`: `./config/pools.local.json`

### Option 3: Deploy Frontend and Backend Separately

#### Backend (Node.js)

**Service Type**: Web Service
**Runtime**: Node

```
Name: streampay-backend
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

#### Frontend (Static Site)

**Service Type**: Static Site
**Runtime**: Static

```
Name: streampay-frontend
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

---

## Full Deployment Steps

### 1. Backend API

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Configure:
   - **Name**: `streampay-backend`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   PORT=4000
   NODE_ENV=production
   RISK_SIGNER_PRIVATE_KEY=<your-private-key>
   RISK_ORACLE_ADDRESS=0x49387C2bbF79348e80809eb534542E70ff139fEA
   RISK_ORACLE_CHAIN_ID=5003
   AI_SERVICE_URL=http://localhost:8001
   ALLOWED_ORIGINS=*
   ```

5. Create the service - it should deploy successfully

6. Note the backend URL (e.g., `https://streampay-backend.onrender.com`)

### 2. Frontend Static Site

1. Create a new **Static Site** on Render
2. Connect your GitHub repository
3. Configure:
   - **Name**: `streampay-frontend`
   - **Region**: Oregon
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   VITE_STREAM_MANAGER_ADDRESS=0x60bd590bc841D8558B279F064459a91Afd0d6015
   VITE_STREAM_VAULT_ADDRESS=0x3B4AB8Bd7D5Bc7D92447bE88D95c0844E1296792
   VITE_MOCK_USDT_ADDRESS=0x5dB24867c863dE8262c12627381199556DF2d546
   VITE_STREAM_TOKEN_ADDRESS=0x5dB24867c863dE8262c12627381199556DF2d546
   VITE_REVENUE_FACTORY_ADDRESS=0x6f0021c43d7b26A8058EC7880df807B65727A33E
   VITE_RISK_ORACLE_ADDRESS=0x49387C2bbF79348e80809eb534542E70ff139fEA
   VITE_PRIMARY_YIELD_POOL=0x9187487Bd77c200d7f1Fa798c797D1a6cC65627D
   VITE_MANTLE_RPC_URL=https://mantle-sepolia.drpc.org
   VITE_BACKEND_API_URL=<your-backend-url>
   ```

5. Replace `<your-backend-url>` with the URL from step 1.6

6. Create the service - it should deploy successfully

### 3. Configure Redirects (Frontend)

Add these redirect rules in Render dashboard for SPA routing:

**Rewrite Rules**:
- Source: `/*`
- Destination: `/index.html`
- Action: Rewrite

### 4. AI Service (Optional)

The AI service is not required for basic functionality if you're only doing demos. The backend will handle the risk scoring logic without it.

If you want to deploy it:

**Option A: Render (Python)**
1. Create a **Web Service**
2. Root Directory: `ai-service`
3. Runtime: Python 3.11
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

**Option B: Mock it**
Set `AI_SERVICE_URL=http://localhost:8001` in backend env vars and the backend will handle scoring internally.

---

## Troubleshooting

### Build Fails - "Cannot find module"

**Problem**: Render is running from the wrong directory

**Solution**: Set **Root Directory** to `backend` or `frontend` in service settings

### Backend Health Check Fails

**Problem**: Health check endpoint timing out

**Solution**:
1. Check environment variables are set
2. Verify `PORT` is set to `4000`
3. Check logs: `Render Dashboard → Your Service → Logs`

### Frontend Shows 404 on Routes

**Problem**: Missing SPA redirect rules

**Solution**: Add rewrite rule `/* → /index.html` in Render dashboard

### CORS Errors

**Problem**: Backend not allowing frontend origin

**Solution**: Update `ALLOWED_ORIGINS` in backend env vars to include your frontend URL

---

## Testing Deployment

Once deployed, test these endpoints:

### Backend
```bash
# Health check
curl https://your-backend.onrender.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Frontend
Visit `https://your-frontend.onrender.com` and verify:
- Landing page loads
- Wallet connection works
- Business dashboard accessible
- Investor dashboard accessible

---

## Cost Estimate

**Free Tier Limits** (Render):
- Backend: 750 hours/month (spins down after 15 min idle)
- Frontend: Unlimited static hosting
- Total Cost: **$0/month** for hackathon demo

**Note**: Free tier services spin down after inactivity. First request may take 30-60 seconds to wake up.

---

## Production Considerations

For production deployment after the hackathon:

1. **Upgrade to Paid Plan**: $7-25/month for always-on services
2. **Add Redis**: For caching risk scores and pool metrics
3. **Database**: Replace JSON store with PostgreSQL
4. **CDN**: Use Cloudflare for faster static asset delivery
5. **Monitoring**: Add Sentry or similar for error tracking
6. **Secrets Management**: Use Render's secret management or AWS Secrets Manager
7. **Deploy AI Service**: For real-time risk scoring
8. **Custom Domain**: Point your domain to Render services

---

## Quick Links

- [Render Documentation](https://render.com/docs)
- [render.yaml Specification](https://render.com/docs/yaml-spec)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Troubleshooting Deploys](https://render.com/docs/troubleshooting-deploys)
