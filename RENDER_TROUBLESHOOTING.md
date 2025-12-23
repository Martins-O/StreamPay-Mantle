# Render Deployment Troubleshooting

## Current Error: Cannot find module '/opt/render/project/src/backend/dist/index.js'

This error means Render is trying to run the backend from the **repository root** instead of the **backend directory**.

---

## 🔥 IMMEDIATE FIX - Choose One Method:

### Method 1: Update Existing Service (Quickest)

**Do this in your Render Dashboard:**

1. Go to your service: https://dashboard.render.com/
2. Click on your backend service
3. Click **Settings** (left sidebar)
4. Scroll to **"Build & Deploy"** section
5. **CRITICAL**: Set **Root Directory** to `backend`
6. Set **Build Command** to: `npm ci && npm run build`
7. Set **Start Command** to: `node dist/index.js`
8. Click **"Save Changes"**
9. Click **"Manual Deploy"** → **"Deploy latest commit"**

**Screenshot of what to look for:**
```
┌─────────────────────────────────────────┐
│ Build & Deploy                          │
├─────────────────────────────────────────┤
│ Root Directory: backend          ← SET THIS!
│ Build Command: npm ci && npm run build │
│ Start Command: node dist/index.js      │
└─────────────────────────────────────────┘
```

---

### Method 2: Use render.yaml (Automated)

The repo now includes a `render.yaml` file that handles this automatically.

1. Go to Render Dashboard
2. **Delete** your existing backend service (if you created one manually)
3. Click **"New +"** → **"Blueprint"**
4. Select your GitHub repo: `Martins-O/StreamPay-Mantle`
5. Render will detect `render.yaml` and show you the services
6. Add required environment variables (see below)
7. Click **"Apply"**

---

### Method 3: Use Render's Web Interface (Alternative)

If the above doesn't work, create a NEW service:

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub: `Martins-O/StreamPay-Mantle`
3. Configure:
   - **Name**: `streampay-backend`
   - **Region**: Oregon
   - **Branch**: `main`
   - **Root Directory**: `backend` ← **MUST SET THIS**
   - **Runtime**: Node
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `node dist/index.js`
4. Add environment variables (see section below)
5. Click **"Create Web Service"**

---

## 🔑 Required Environment Variables

Add these in Render Dashboard → Your Service → Environment:

```bash
# REQUIRED
PORT=4000
RISK_SIGNER_PRIVATE_KEY=<your-deployer-private-key>
RISK_ORACLE_ADDRESS=0x49387C2bbF79348e80809eb534542E70ff139fEA
RISK_ORACLE_CHAIN_ID=5003

# OPTIONAL (with defaults)
NODE_ENV=production
AI_SERVICE_URL=http://localhost:8001
ALLOWED_ORIGINS=*
YIELD_POOL_REGISTRY=./config/pools.local.json
```

**Where to get RISK_SIGNER_PRIVATE_KEY:**
- This is the same private key you used to deploy the contracts
- Should match the address that deployed the RiskOracleAdapter
- **Never commit this to git!**

---

## ✅ Verify Deployment is Working

After deployment completes (2-3 minutes):

```bash
# Check health endpoint
curl https://your-backend.onrender.com/health

# Expected response:
{"status":"ok","timestamp":"2025-12-23T08:30:00.000Z"}

# Check if API is responding
curl https://your-backend.onrender.com/api/config

# Expected response:
{"contractAddresses":{...},"aiServiceUrl":"..."}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module" error persists

**Cause**: Root Directory is not set to `backend`

**Solution**:
- Double-check the Root Directory field shows `backend`
- Clear any cached settings: Settings → Build & Deploy → Clear Build Cache
- Try deleting and recreating the service

### Issue 2: Build succeeds but service crashes on start

**Cause**: Missing environment variables

**Solution**:
- Check Environment tab has all required vars
- Look for specific error in logs: Dashboard → Your Service → Logs
- Common culprit: `RISK_SIGNER_PRIVATE_KEY` not set

### Issue 3: Health check fails after deployment

**Cause**: Port mismatch or health check path wrong

**Solution**:
- Ensure `PORT` env var is set to `4000`
- Check Health Check Path is set to `/health`
- Wait 30-60 seconds after first deploy (free tier cold start)

### Issue 4: CORS errors when accessing from frontend

**Cause**: `ALLOWED_ORIGINS` not set correctly

**Solution**:
```bash
# For development/hackathon:
ALLOWED_ORIGINS=*

# For production:
ALLOWED_ORIGINS=https://your-frontend.onrender.com,https://your-custom-domain.com
```

### Issue 5: Service spins down after 15 minutes

**Cause**: This is normal behavior on Render's free tier

**Solution**:
- First request after idle will take 30-60 seconds (cold start)
- For hackathon demo, send a request before judging to wake it up
- For production, upgrade to paid plan ($7/month) for always-on service

---

## 📋 Debugging Checklist

Before asking for help, verify:

- [ ] Root Directory is set to `backend` (not blank, not `/backend`, just `backend`)
- [ ] Build Command is `npm ci && npm run build`
- [ ] Start Command is `node dist/index.js` (not `npm start`)
- [ ] All required environment variables are set (especially `RISK_SIGNER_PRIVATE_KEY`)
- [ ] Branch is set to `main` (or your deployment branch)
- [ ] Latest commit is deployed (check commit hash in logs)
- [ ] Build logs show "Build successful 🎉"
- [ ] Start logs show server starting on port 4000

---

## 📊 Reading Render Logs

**Build Logs** (Settings → Logs → Build):
```
==> Cloning from https://github.com/Martins-O/StreamPay-Mantle...
==> Checking out commit abc123
==> Changing to backend directory         ← Should see this!
==> Running 'npm ci && npm run build'
==> Build successful 🎉
```

**Deploy Logs** (Settings → Logs → Deploy):
```
==> Deploying...
==> Running 'node dist/index.js'          ← Should see this!
Server listening on port 4000             ← Should see this!
```

If you see different output, your Root Directory is likely wrong.

---

## 🆘 Still Having Issues?

If you've tried everything above and it's still not working:

1. **Check Build Output**: In Render logs, look for the line `ls -la dist/` in build output
   - It should show files like `index.js`, `config.js`, etc.
   - If it says "No such file or directory", the build failed

2. **Verify Directory Structure**: In Render Shell (if available on your plan):
   ```bash
   pwd                  # Should show: /opt/render/project/src
   ls                   # Should show: README.md, backend/, frontend/, etc.
   cd backend && ls     # Should show: dist/, node_modules/, package.json
   node dist/index.js   # Try running manually
   ```

3. **Check Node Version**: Render uses Node 22 by default
   - If you need a different version, add `.node-version` file in `backend/`:
     ```
     18.20.8
     ```

4. **Share Logs**: If asking for help, share:
   - Full build log (especially the "Changing to directory" lines)
   - Full deploy log (especially the "Running..." line)
   - Screenshot of your "Build & Deploy" settings

---

## 🎯 Quick Verification Script

Create a temporary file `backend/verify-deploy.js`:

```javascript
console.log('Working directory:', process.cwd());
console.log('Directory contents:', require('fs').readdirSync('.'));
console.log('Dist exists?', require('fs').existsSync('./dist'));
console.log('Dist/index.js exists?', require('fs').existsSync('./dist/index.js'));
```

Temporarily change Start Command to: `node verify-deploy.js && node dist/index.js`

This will show you what directory Render is running from.

---

## 💡 Why This Happens

Render's default behavior:
1. Clone your repo to `/opt/render/project/src/`
2. If **Root Directory** is blank → run commands from `/opt/render/project/src/`
3. If **Root Directory** is `backend` → run commands from `/opt/render/project/src/backend/`

Your project structure:
```
StreamPay-Mantle/          ← Render root by default
├── backend/               ← Where package.json lives
│   ├── dist/              ← Build output here
│   │   └── index.js       ← This is what we need to run
│   ├── package.json
│   └── src/
├── frontend/
└── README.md
```

Without setting Root Directory, Render tries to:
- Run `node dist/index.js` from the repo root
- Looks for `/opt/render/project/src/dist/index.js` ← Doesn't exist!
- Actually at: `/opt/render/project/src/backend/dist/index.js` ← Here!

**Solution**: Set Root Directory to `backend` so Render runs from there!

---

## ✨ Success Indicators

You'll know it's working when:

1. **Build logs show**:
   ```
   ==> Changing to /opt/render/project/src/backend
   ==> Running 'npm ci && npm run build'
   dist/:
   total 36
   -rw-r--r-- 1 render render 1960 index.js
   -rw-r--r-- 1 render render  895 config.js
   ```

2. **Deploy logs show**:
   ```
   ==> Running 'node dist/index.js'
   {"level":30,"time":...,"msg":"Server listening on port 4000"}
   ```

3. **Service URL responds**:
   ```bash
   curl https://your-service.onrender.com/health
   # {"status":"ok","timestamp":"..."}
   ```

**Good luck!** 🚀
