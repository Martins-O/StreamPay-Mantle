# Hackathon Submission Checklist

Use this checklist to ensure your Mantle StreamYield project is ready for submission.

---

## 📋 Pre-Submission Checklist

### ✅ Code & Repository

- [x] All code committed to main branch
- [x] Recent NFT enhancements pushed (StreamDescriptor + StreamNFTCard)
- [x] No uncommitted changes in working directory
- [ ] Repository is public on GitHub
- [ ] Repository has a clear description and topics/tags
- [x] `.gitignore` properly configured (no secrets, no `node_modules`, no `.env`)
- [x] All dependencies documented in package.json / requirements.txt

**Verification Commands**:
```bash
git status                    # Should show "nothing to commit, working tree clean"
git log --oneline -n 5       # Verify recent commits are pushed
git remote -v                # Confirm GitHub remote is correct
```

---

### ✅ Smart Contracts

- [x] All contracts compile without errors: `cd contracts && forge build`
- [x] All tests pass: `cd contracts && forge test`
- [x] Deployment script updated with StreamDescriptor
- [ ] Contracts deployed to Mantle Sepolia testnet
- [ ] Deployment addresses documented in README and env files
- [ ] Contracts verified on Mantle Explorer (optional but recommended)
- [x] Gas optimization notes documented (stream creation ~358k gas)

**Verification Commands**:
```bash
cd contracts
forge build                   # Should compile successfully
forge test                    # Should show 100% pass rate
./deploy.sh                   # Deploy to testnet (if not already done)
```

**Post-Deployment**:
- [ ] Copy deployed addresses to `contracts/deployment.env`
- [ ] Update `frontend/.env.local` with new addresses
- [ ] Update `backend/.env` with RISK_ORACLE_ADDRESS
- [ ] Update README.md deployment table with new addresses

---

### ✅ Backend API

- [x] All dependencies installed: `cd backend && npm install`
- [x] TypeScript compiles: `cd backend && npm run build`
- [x] Tests pass: `cd backend && npm test`
- [x] Environment variables configured in `.env`
- [ ] Backend starts successfully: `cd backend && npm run dev`
- [ ] Health endpoint responds: `curl http://localhost:4000/health`
- [ ] Risk signing works (test via Vitest)

**Verification Commands**:
```bash
cd backend
npm install
npm run build                 # Should compile TypeScript
npm test                      # Should pass all Vitest tests
npm run dev &                 # Start in background
curl http://localhost:4000/health  # Should return {"status":"ok"}
kill %1                       # Stop background process
```

---

### ✅ AI Service

- [x] Virtual environment created: `cd ai-service && ./setup.sh`
- [x] Dependencies installed: `pip install -r requirements.txt`
- [ ] Service starts: `uvicorn app:app --reload --port 8001`
- [ ] Score endpoint works: `curl -X POST http://localhost:8001/score-business -H "Content-Type: application/json" -d '{"address":"0x123","monthlyRevenue":50000,"revenueVolatility":0.1,"missedPayments":0,"useVerifiedData":false}'`
- [ ] Tests pass: `cd ai-service && pytest` (if tests exist)

**Verification Commands**:
```bash
cd ai-service
source .venv/bin/activate
uvicorn app:app --reload --port 8001 &
sleep 3
curl -X POST http://localhost:8001/score-business \
  -H "Content-Type: application/json" \
  -d '{"address":"0x123","monthlyRevenue":50000,"revenueVolatility":0.1,"missedPayments":0,"useVerifiedData":false}'
# Should return JSON with score, band, rationale
kill %1
```

---

### ✅ Frontend

- [x] All dependencies installed: `cd frontend && npm install`
- [x] TypeScript compiles: `cd frontend && npm run build`
- [x] No linting errors: `cd frontend && npm run lint`
- [x] Environment variables configured in `.env.local`
- [ ] Frontend starts: `cd frontend && npm run dev`
- [ ] All pages load without errors:
  - [ ] `/` - Landing page
  - [ ] `/business` - Business dashboard
  - [ ] `/investor` - Investor dashboard
  - [ ] `/legacy-console` - Legacy console
  - [ ] `/how-it-works` - How it works
  - [ ] `/about` - About page
- [ ] Wallet connection works (MetaMask on Mantle Sepolia)
- [ ] Stream NFT cards display correctly on Business dashboard

**Verification Commands**:
```bash
cd frontend
npm install
npm run lint                  # Should show no errors
npm run build                 # Should build successfully
npm run dev &                 # Start in background
sleep 5
curl http://localhost:3000    # Should return HTML
kill %1
```

---

### ✅ Documentation

- [x] README.md is comprehensive and up-to-date
  - [x] Project overview and value proposition
  - [x] System architecture diagram
  - [x] Quick Start for Judges section
  - [x] Deployed contract addresses
  - [x] Getting started guide
  - [x] Key features list (including StreamDescriptor)
  - [x] Testing instructions
  - [x] Demo script
  - [x] Why Mantle section
- [x] HACKATHON_SUBMISSION.md created with judging criteria mapping
- [x] ARCHITECTURE.md exists (detailed technical design)
- [x] DEPLOYMENT.md exists (step-by-step deployment)
- [x] DEMO.md exists (5-minute demo walkthrough)
- [ ] All docs reviewed for typos and accuracy
- [ ] Links in docs are valid (especially explorer links)

---

### ✅ Testing & Quality

- [x] Smart contract tests pass (30+ tests, 100% pass rate)
- [x] Backend tests pass (Vitest for risk signing)
- [ ] End-to-end flow tested:
  - [ ] Business registration
  - [ ] AI risk score refresh
  - [ ] RevenueToken minting
  - [ ] Stream creation
  - [ ] Stream visualization with NFT cards
  - [ ] Investor deposit flow
  - [ ] Yield calculation
- [ ] No console errors in browser dev tools
- [ ] No TypeScript errors in any component
- [ ] All API endpoints return correct status codes

---

### ✅ Deployment (Testnet)

- [ ] Contracts deployed to Mantle Sepolia
- [ ] Deployment transaction hashes recorded
- [ ] Contract addresses added to README
- [ ] Contracts verified on Mantle Explorer (optional)
- [ ] Test tokens (Mock USDT) minted and distributed
- [ ] Sample transactions created to show functionality
- [ ] Backend deployed (or instructions to run locally)
- [ ] Frontend deployed (or instructions to run locally)

**Deployment Addresses** (update after deployment):
```
StreamEngine: 0x60bd590bc841D8558B279F064459a91Afd0d6015
StreamVault: 0x3B4AB8Bd7D5Bc7D92447bE88D95c0844E1296792
YieldPool: 0x9187487Bd77c200d7f1Fa798c797D1a6cC65627D
RiskOracleAdapter: 0x49387C2bbF79348e80809eb534542E70ff139fEA
RevenueTokenFactory: 0x6f0021c43d7b26A8058EC7880df807B65727A33E
Mock USDT: 0x5dB24867c863dE8262c12627381199556DF2d546
StreamDescriptor: [TO BE DEPLOYED]
```

---

### ✅ Demo Assets

- [ ] Demo video recorded (2-5 minutes)
  - [ ] Shows landing page
  - [ ] Demonstrates business registration
  - [ ] Shows AI risk scoring
  - [ ] Demonstrates RevenueToken minting
  - [ ] Shows stream NFT cards
  - [ ] Demonstrates investor deposit flow
  - [ ] Highlights key technical innovations
- [ ] Screenshots captured:
  - [ ] Landing page
  - [ ] Business dashboard with NFT cards
  - [ ] Investor dashboard
  - [ ] Risk score display
  - [ ] Transaction confirmations
- [ ] Demo assets uploaded to `docs/screenshots/` or linked in README

---

### ✅ Submission Requirements

- [ ] Submission form filled out completely
- [ ] Project name: "Mantle StreamYield" or "StreamPay Mantle"
- [ ] Tagline: "AI-powered tokenized cashflow + yield streaming protocol for real-world businesses on Mantle"
- [ ] Category: RealFi + AI Integration
- [ ] GitHub repository link provided
- [ ] Demo video link provided (YouTube/Loom)
- [ ] Deployed contract addresses provided
- [ ] Team information submitted
- [ ] All required fields completed

---

### ✅ Final Checks

- [ ] Run full system integration test:
  ```bash
  ./start-services.sh
  # Wait for all services to start
  # Open http://localhost:3000
  # Test complete business → investor flow
  ```
- [ ] Check all external links work (explorer, faucet, docs)
- [ ] Verify testnet funds available for judges to test
- [ ] Review submission one more time for completeness
- [ ] Submit before deadline! 🚀

---

## 🎯 Optional Enhancements (If Time Permits)

- [ ] Add demo video to README
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Add more screenshots to docs
- [ ] Create a pitch deck (5-10 slides)
- [ ] Add a SECURITY.md with security considerations
- [ ] Add a CONTRIBUTING.md for future contributors
- [ ] Set up GitHub Actions CI/CD for testing
- [ ] Add code coverage badges to README
- [ ] Create a Twitter/X thread announcing the project

---

## 📊 Submission Summary

**What We Built**:
- 12 smart contracts (2,500+ LOC) with 100% test pass rate
- Full-stack application (React frontend + Node.js backend + FastAPI AI service)
- 50+ React components with production-quality UI/UX
- Comprehensive documentation (8 detailed docs)
- Live deployment on Mantle Sepolia testnet

**Key Innovations**:
- On-chain NFT receipts with SVG metadata
- EIP-712 signed AI risk scoring
- Risk-gated yield pools
- Multi-token streaming with pause/resume
- Real-time cashflow visualization

**Mantle Integration**:
- Leverages ultra-low fees (~$0.01 per stream)
- Perfect fit for RealFi + AI hackathon theme
- Deployed on Mantle Sepolia testnet
- Addresses $10T+ working capital problem

---

## 🚨 Common Pitfalls to Avoid

1. ❌ **Don't commit `.env` files** - They contain secrets!
2. ❌ **Don't submit with failing tests** - Always run `forge test` before submission
3. ❌ **Don't forget to update README** - Judges read this first!
4. ❌ **Don't leave placeholder text** - Replace all "TODO" and "TBD" entries
5. ❌ **Don't submit without testing** - Do a complete end-to-end flow
6. ❌ **Don't miss the deadline** - Submit at least 1 hour early for safety

---

## ✅ Ready to Submit?

Once all items are checked, you're ready to submit! 🎉

**Final Submission Command**:
```bash
# Ensure everything is committed and pushed
git add -A
git commit -m "chore: final pre-submission polish"
git push origin main

# Verify remote is up to date
git log origin/main --oneline -n 5

# You're ready! Go submit! 🚀
```

---

**Good luck with your submission! You've built something truly impressive.** 💪
