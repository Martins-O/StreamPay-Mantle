# Deployment Guide

## Prerequisites

Before deploying StreamPay Mantle, ensure you have:

- **Node.js 18+** installed
- **Foundry** toolkit installed
- **Git** for version control
- **Mantle testnet MNT** for gas fees
- **Private key** for deployment account
- **Mantlescan API key** for contract verification

## Environment Setup

### 1. Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Clone Repository

```bash
git clone https://github.com/yourusername/streampay-mantle.git
cd streampay-mantle
```

### 3. Configure Environment

#### Contracts Environment

```bash
cd contracts
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Deployment
PRIVATE_KEY=your_private_key_without_0x_prefix
# optional: override, otherwise PRIVATE_KEY account is also the risk signer
RISK_SIGNER_ADDRESS=
MANTLESCAN_API_KEY=your_mantlescan_api_key

# RPC URLs
MANTLE_TESTNET_RPC=https://mantle-sepolia.drpc.org
MANTLE_MAINNET_RPC=https://rpc.mantle.xyz

# Optional overrides
BASE_TOKEN_ADDRESS=0xexistingStablecoin
YIELD_POOL_NAME="StreamYield Primary"
YIELD_POOL_SYMBOL="sYLD"
```

#### Frontend Environment

```bash
cd ../frontend
cp .env.example .env.local
```

Edit `.env.local` (values copied from deployment logs):

```bash
# Contract addresses (populate after deployment)
VITE_STREAM_MANAGER_ADDRESS=0x60bd590bc841D8558B279F064459a91Afd0d6015
VITE_STREAM_VAULT_ADDRESS=0x3B4AB8Bd7D5Bc7D92447bE88D95c0844E1296792
VITE_MOCK_USDT_ADDRESS=0x5dB24867c863dE8262c12627381199556DF2d546
VITE_STREAM_TOKEN_ADDRESS=0x5dB24867c863dE8262c12627381199556DF2d546
VITE_REVENUE_FACTORY_ADDRESS=0x6f0021c43d7b26A8058EC7880df807B65727A33E
VITE_RISK_ORACLE_ADDRESS=0x49387C2bbF79348e80809eb534542E70ff139fEA
VITE_PRIMARY_YIELD_POOL=0x9187487Bd77c200d7f1Fa798c797D1a6cC65627D

# RPC URL (override if you run your own node)
VITE_MANTLE_RPC_URL=https://mantle-sepolia.drpc.org

# Optional WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=

# Optional notifications
VITE_PUSH_CHANNEL_ADDRESS=
VITE_PUSH_CHANNEL_PK=
VITE_PUSH_ENV=staging
VITE_WALLETCONNECT_NOTIFY_PROJECT_ID=
VITE_WALLETCONNECT_NOTIFY_SECRET=
```

> The frontend always streams the token set in `VITE_STREAM_TOKEN_ADDRESS`. Leaving it empty will fall back to
> `VITE_MOCK_USDT_ADDRESS`.

> Push Protocol and WalletConnect Notify configuration is optional. Only populate these keys if you operate a
> notification channel—otherwise the dApp will continue to function without attempting to send alerts.

## Smart Contract Deployment

### 1. Prepare for Deployment

```bash
cd contracts

# Install dependencies
forge install

# Run tests to ensure everything works
forge test

# Check compilation
forge build
```

### 2. Deploy Contracts

#### Option A: Automated Deployment (Recommended)

```bash
# Make scripts executable
chmod +x deploy.sh
chmod +x verify.sh

# Deploy all contracts
./deploy.sh
```

The script will:
- Run tests before deployment
- Deploy `StreamEngine` (which internally creates `StreamVault`)
- Deploy a mock USDT token (unless `BASE_TOKEN_ADDRESS` is set)
- Deploy `RevenueTokenFactory`, `RiskOracleAdapter`, and a `YieldPool` + `YieldBackedToken`
- Print every deployed address so you can copy them into your env files

#### Option B: Manual Deployment

```bash
# Deploy contracts
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $MANTLE_TESTNET_RPC \
  --broadcast \
  --verify

# Manual verification if needed
./verify.sh
```

### 3. Verify Deployment

After successful deployment, you should see:

```
✅ Deployment successful!
StreamEngine deployed to: 0x60bd590bc841D8558B279F064459a91Afd0d6015
StreamVault deployed to: 0x3B4AB8Bd7D5Bc7D92447bE88D95c0844E1296792
Base token (Mock or existing) at: 0x5dB24867c863dE8262c12627381199556DF2d546
RevenueTokenFactory deployed to: 0x6f0021c43d7b26A8058EC7880df807B65727A33E
RiskOracleAdapter deployed to: 0x49387C2bbF79348e80809eb534542E70ff139fEA
YieldPool deployed to: 0x9187487Bd77c200d7f1Fa798c797D1a6cC65627D
YieldBackedToken deployed to: 0x09795b0F38531eeD002a2bC3bff492FA89cc92eB
```

### 4. Update Frontend Configuration

Copy the deployed addresses to your frontend environment:

Manually create/update `contracts/deployment.env` with the addresses printed by the deployment script:

```
STREAM_ENGINE_ADDRESS=0x60bd590bc841D8558B279F064459a91Afd0d6015
STREAM_VAULT_ADDRESS=0x3B4AB8Bd7D5Bc7D92447bE88D95c0844E1296792
MOCK_USDT_ADDRESS=0x5dB24867c863dE8262c12627381199556DF2d546
REVENUE_TOKEN_FACTORY_ADDRESS=0x6f0021c43d7b26A8058EC7880df807B65727A33E
RISK_ORACLE_ADAPTER_ADDRESS=0x49387C2bbF79348e80809eb534542E70ff139fEA
YIELD_POOL_ADDRESS=0x9187487Bd77c200d7f1Fa798c797D1a6cC65627D
YIELD_BACKED_TOKEN_ADDRESS=0x09795b0F38531eeD002a2bC3bff492FA89cc92eB
```

- Copy the oracle + pool addresses into `backend/.env` (`RISK_ORACLE_ADDRESS`, pool registry JSON).
- Copy all addresses into `frontend/.env.local` (the `VITE_*` keys listed above) so the Business/Investor dashboards load the deployed contracts.

## Frontend Deployment

### Mint a RevenueToken (optional but recommended)

After the core contracts are live, run the helper script to mint an initial RevenueToken that can feed your YieldPool metrics:

```bash
cd contracts
forge script script/MintRevenueToken.s.sol:MintRevenueTokenScript \
  --rpc-url $MANTLE_TESTNET_RPC \
  --broadcast \
  --private-key $PRIVATE_KEY
```

Environment variables used by the script:

```
REVENUE_TOKEN_FACTORY_ADDRESS=0x6f0021c43d7b26A8058EC7880df807B65727A33E
MOCK_USDT_ADDRESS=0x5dB24867c863dE8262c12627381199556DF2d546
PAYMENT_TOKEN_ADDRESS=0x5dB24867c863dE8262c12627381199556DF2d546 # Optional override
REVENUE_TOKEN_NAME="StreamYield Revenue 1"
REVENUE_TOKEN_SYMBOL="SYREV1"
REVENUE_TOKEN_EXPECTED=500000000000 # 500k units w/ 6 decimals
REVENUE_TOKEN_TENOR=$((90 * 24 * 60 * 60))
```

Record the minted RevenueToken address in `backend/config/pools.local.json` so `/api/pools` and the Investor dashboard can surface it.

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Build and Test Locally

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview the production build locally
npm run preview
```

### 3. Deploy to Hosting Platform

#### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify Deployment

```bash
# Build the project
npm run build

# Deploy to Netlify (upload the dist/ folder)
# Or use Netlify CLI
```

#### IPFS Deployment (Decentralized)

```bash
# Build for static export
npm run build

# Upload the contents of dist/ using your preferred method
# (Pinata, Fleek, or a local IPFS node)
```

## Post-Deployment Verification

### 1. Contract Verification Checklist

- [ ] StreamManager verified on Mantlescan
- [ ] StreamVault verified on Mantlescan
- [ ] Mock USDT verified on Mantlescan
- [ ] All contracts have correct source code
- [ ] ABI matches deployed bytecode

### 2. Frontend Verification Checklist

- [ ] Wallet connection works
- [ ] Network switching to Mantle testnet
- [ ] Contract interactions successful
- [ ] Real-time updates functioning
- [ ] Error handling works properly

### 3. End-to-End Testing

Test the complete flow:

1. **Connect Wallet**
   ```
   - MetaMask connection
   - Network switching
   - Balance display
   ```

2. **Get Test Tokens**
   ```
   - Mint mock USDT tokens
   - Check balance updates
   - Approve StreamManager spending
   ```

3. **Create Stream**
   ```
   - Fill out form
   - Submit transaction
   - Verify stream creation
   - Check dashboard updates
   ```

4. **Monitor Stream**
   ```
   - Real-time counter updates
   - Progress bar animation
   - Streamable amount calculation
   ```

5. **Claim/Cancel Operations**
   ```
   - Claim functionality
   - Cancel functionality
   - Balance updates
   - Event emission
   ```

## Troubleshooting

### Common Deployment Issues

#### "Insufficient Gas" Error
```bash
# Increase gas limit in foundry.toml
[profile.default]
gas_limit = 10000000
```

#### "Nonce Too Low" Error
```bash
# Reset account nonce or wait for previous transactions
cast nonce $YOUR_ADDRESS --rpc-url $MANTLE_TESTNET_RPC
```

#### Contract Verification Failed
```bash
# Manually verify using the verify.sh script
./verify.sh

# Or verify individual contracts
forge verify-contract \
  --chain-id 5003 \
  --num-of-optimizations 200 \
  --constructor-args $(cast abi-encode "constructor()") \
  --etherscan-api-key $MANTLESCAN_API_KEY \
  $CONTRACT_ADDRESS \
  src/StreamManager.sol:StreamManager
```

### Frontend Issues

#### "Module Not Found" Error
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Wallet Connection Issues
```bash
# Check environment variables
echo $VITE_WALLETCONNECT_PROJECT_ID

# Verify contract addresses
echo $VITE_STREAM_MANAGER_ADDRESS
```

#### Contract Interaction Failures
```bash
# Check network configuration
# Verify contract addresses
# Check wallet has sufficient gas
```

## Network Configuration

### Mantle Sepolia Testnet Details

```json
{
  "chainId": 5003,
  "chainName": "Mantle Sepolia Testnet",
  "rpcUrls": ["https://mantle-sepolia.drpc.org"],
  "nativeCurrency": {
    "name": "Mantle",
    "symbol": "MNT",
    "decimals": 18
  },
  "blockExplorerUrls": ["https://explorer.sepolia.mantle.xyz"]
}
```

### Adding to MetaMask

Users need to add Mantle Sepolia testnet to their wallet:

1. Open MetaMask
2. Click "Add Network"
3. Enter the network details above
4. Save and switch to network

## Production Considerations

### Security Checklist

- [ ] Private keys stored securely
- [ ] Environment variables not committed
- [ ] Contract ownership transferred appropriately
- [ ] Multi-sig setup for production
- [ ] Emergency pause mechanisms tested
- [ ] Audit completed for mainnet deployment

### Monitoring Setup

- [ ] Transaction monitoring
- [ ] Gas usage tracking
- [ ] Error rate monitoring
- [ ] User activity analytics
- [ ] Contract state monitoring

### Backup Procedures

- [ ] Contract source code backed up
- [ ] Deployment scripts versioned
- [ ] Environment configurations documented
- [ ] Recovery procedures tested

This deployment guide ensures a smooth and secure deployment of StreamPay Mantle on the Mantle L2 testnet.
