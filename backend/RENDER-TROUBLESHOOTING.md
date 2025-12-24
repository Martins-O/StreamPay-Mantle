# Render Deployment Troubleshooting

Quick fixes for common Render deployment failures for Liquifi backend.

## Quick Diagnosis

Check your Render build logs for these common error patterns:

### Error 1: "Cannot find module 'typescript'"

```
Error: Cannot find module 'typescript'
```

**Cause**: TypeScript is in `devDependencies` but Render doesn't install dev deps in production builds.

**Fix**:
```bash
cd backend
./fix-render-deps.sh
git add package.json package-lock.json
git commit -m "fix: move TypeScript to dependencies"
git push
```

---

### Error 2: "Cannot find tsconfig.json"

```
error TS5058: The specified path does not exist: 'tsconfig.json'
```

**Cause**: `.renderignore` was excluding `tsconfig.json`

**Status**: ✅ Already fixed! We removed it from `.renderignore`

---

### Error 3: Build succeeds but "Application failed to respond"

```
==> Your service is live 🎉
==> Application failed to respond on port 10000
```

**Cause**: Backend not listening on `process.env.PORT`

**Check**: Our [config.ts](src/config.ts#L20) already handles this:
```typescript
port: Number(process.env.PORT ?? 4000)
```

**Status**: ✅ Should work correctly

**Additional Check**: Make sure your Render environment variables include `PORT=10000` (Render sets this automatically)

---

### Error 4: CORS Errors After Deployment

```
Access to fetch at 'https://backend.onrender.com' from origin 'https://frontend.vercel.app'
has been blocked by CORS policy
```

**Cause**: Frontend URL not in `ALLOWED_ORIGINS`

**Fix**: Add to Render environment variables:
```
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-frontend-preview.vercel.app
```

---

### Error 5: "Module not found" Errors in Runtime

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module './services/dataStore.js'
```

**Cause**: TypeScript compiled but imports don't have `.js` extensions

**Check**: Your imports should look like:
```typescript
import { DataStore } from "./services/dataStore.js";  // ✅ Good
import { DataStore } from "./services/dataStore";     // ❌ Bad for ES modules
```

**Status**: Check your source files if this occurs

---

### Error 6: Environment Variable Issues

```
Error: RISK_SIGNER_PRIVATE_KEY is required
```

**Fix**: Add all required environment variables in Render dashboard:

**Required Variables**:
- `PORT` - Auto-set by Render (10000)
- `AI_SERVICE_URL` - Your deployed AI service URL
- `RISK_SIGNER_PRIVATE_KEY` - From your local `.env`
- `RISK_ORACLE_ADDRESS` - Contract address
- `RISK_ORACLE_CHAIN_ID` - 5003 for Mantle Sepolia
- `YIELD_POOL_REGISTRY` - `./config/pools.local.json`
- `ALLOWED_ORIGINS` - Your frontend URLs (comma-separated)

---

## Step-by-Step Fix Process

### Fix 1: Move TypeScript to Production Dependencies

```bash
cd backend
npm install --save typescript @types/node @types/express @types/cors
```

This moves TypeScript from `devDependencies` to `dependencies` in package.json.

**Verify**:
```bash
grep -A10 '"dependencies"' package.json | grep typescript
```

Should show TypeScript in `dependencies` section, not `devDependencies`.

### Fix 2: Commit and Push

```bash
git add package.json package-lock.json .renderignore
git commit -m "fix: configure backend for Render deployment

- Move TypeScript to production dependencies
- Remove tsconfig.json from .renderignore
- Ensure build can compile on Render"
git push origin main
```

### Fix 3: Verify Render Configuration

In Render dashboard, verify:

**Build & Deploy Settings**:
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Environment Variables** (at minimum):
```
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
AI_SERVICE_URL=https://your-ai-service.onrender.com
RISK_SIGNER_PRIVATE_KEY=0x1ed549bc8b1e39ed8c55ec3c150ecfd751207e8f65c72b3854845490ced15e4f
RISK_ORACLE_ADDRESS=0x49387C2bbF79348e80809eb534542E70ff139fEA
RISK_ORACLE_CHAIN_ID=5003
YIELD_POOL_REGISTRY=./config/pools.local.json
```

### Fix 4: Manual Deploy

After pushing changes:
1. Go to Render dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Watch the logs in real-time

---

## Render Build Process Checklist

The build should follow these steps:

1. ✅ Clone repository
2. ✅ Navigate to `backend/` directory
3. ✅ Run `npm install` (installs all dependencies including TypeScript)
4. ✅ Run `npm run build` (runs `tsc -p tsconfig.json`)
   - Reads `src/**/*.ts` files
   - Compiles to `dist/**/*.js` files
   - Uses `tsconfig.json` for configuration
5. ✅ Run `npm start` (runs `node dist/index.js`)
6. ✅ Server starts on port 10000
7. ✅ Logs show: "Mantle StreamYield backend listening on :10000"

---

## Test After Deployment

### 1. Health Check

```bash
curl https://your-backend.onrender.com/health
```

Expected:
```json
{"ok": true, "time": 1734956730355}
```

### 2. Config Check

```bash
curl https://your-backend.onrender.com/api/config
```

Expected:
```json
{
  "riskOracleAddress": "0x49387C2bbF79348e80809eb534542E70ff139fEA",
  "aiServiceUrl": "https://your-ai-service.onrender.com",
  "poolRegistryPath": "./config/pools.local.json"
}
```

### 3. CORS Check (from browser)

Open browser console at your frontend URL and run:
```javascript
fetch('https://your-backend.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
```

Should show health response WITHOUT CORS errors.

---

## Still Having Issues?

### Check Render Logs

1. Go to your service in Render dashboard
2. Click **"Logs"** tab
3. Look for error messages during:
   - **Build phase**: Errors during `npm install` or `npm run build`
   - **Deploy phase**: Errors when starting the server
   - **Runtime phase**: Errors after server starts

### Common Log Messages

**Success**:
```
==> Preparing...
==> Installing dependencies
==> Building...
==> Starting service...
Mantle StreamYield backend listening on :10000
==> Your service is live 🎉
```

**Failure at Build**:
```
==> npm run build failed
error TS2307: Cannot find module 'express'
```
→ Check dependencies

**Failure at Start**:
```
==> Application failed to respond on port 10000
```
→ Check that server is listening on `process.env.PORT`

**Failure at Runtime**:
```
Error: AI_SERVICE_URL is not configured
```
→ Check environment variables

---

## Get Help

If issues persist:

1. **Share Render Logs**: Copy the full build/deploy logs from Render
2. **Check Environment**: Verify all environment variables are set correctly
3. **Local Test**: Run `npm run build && npm start` locally to ensure it works
4. **Compare**: Make sure local and Render environments match

---

## Quick Reference

**Run the fix script**:
```bash
cd backend
./fix-render-deps.sh
```

**Verify TypeScript location**:
```bash
grep -A15 '"dependencies"' package.json
```

**Check build locally**:
```bash
npm run build
ls -la dist/
npm start
```

**Test deployed service**:
```bash
curl https://your-service.onrender.com/health
```

---

**Most Common Fix**: Run `./fix-render-deps.sh`, commit, and push! 🚀
