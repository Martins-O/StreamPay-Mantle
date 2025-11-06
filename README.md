# 🌊 StreamPay Mantle

**Real-time payment streaming protocol on Mantle L2 testnet**

StreamPay allows users to continuously stream one or many ERC-20 tokens to recipients over time. Each stream mints a transferable NFT receipt, enabling recipients to batch claim across payrolls or hand off ownership instantly. Senders can top up, extend, pause, or cancel streams at will.

![StreamPay Demo](https://via.placeholder.com/800x400/1e40af/ffffff?text=StreamPay+Mantle+Demo)

## 🎯 Overview

StreamPay Mantle enables:
- **Real-time token streaming** with second-by-second precision
- **Transferable NFT receipts** - each stream issues an ERC-721 proving the right to future funds
- **Flexible claiming** - recipients batch claim accrued amounts across many streams
- **Sender control** - top up, extend, or cancel and reclaim remaining tokens
- **Low-cost operations** on Mantle L2 for minimal gas fees
- **Live visualization** with animated flow counters

## 🏗️ Architecture

```mermaid
graph TB
    A[Frontend] --> B[StreamManager Contract]
    B --> C[StreamVault Contract]
    B --> D[AccountingLib Library]
    C --> E[ERC-20 Token]

    subgraph "Mantle L2 Testnet"
        B
        C
        D
        E
    end

    F[Sender] --> A
    G[Recipient] --> A
```

### Core Components

1. **StreamManager.sol** - Main contract handling stream lifecycle
2. **StreamVault.sol** - Secure token escrow and withdrawal
3. **AccountingLib.sol** - Pure math for streaming calculations
4. **Frontend** - Vite + React + Wagmi for wallet integration and real-time UI

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Git
- MetaMask or compatible wallet
- Mantle testnet MNT tokens

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/streampay-mantle.git
cd streampay-mantle
```

### 2. Deploy Contracts

```bash
cd contracts
cp .env.example .env
# Edit .env with your private key and Mantlescan API key

# Run tests
forge test

# Deploy to Mantle testnet
./deploy.sh

# Copy the printed contract addresses into contracts/deployment.env and frontend/.env.local
# (STREAM_MANAGER_ADDRESS, STREAM_VAULT_ADDRESS, MOCK_USDT_ADDRESS, STREAM_TOKEN_ADDRESS)
```

### 3. Setup Frontend

```bash
cd ../frontend
cp .env.example .env.local
# Populate contract addresses from deployment
#   VITE_STREAM_MANAGER_ADDRESS=
#   VITE_STREAM_VAULT_ADDRESS=
#   VITE_MOCK_USDT_ADDRESS=
#   VITE_STREAM_TOKEN_ADDRESS=
#   VITE_MANTLE_RPC_URL=https://mantle-sepolia.drpc.org
# Optional: set VITE_WALLETCONNECT_PROJECT_ID for WalletConnect support

npm install
npm run dev
```

### 4. Access Application

Open [http://localhost:3000](http://localhost:3000) and:
1. Connect your wallet (MetaMask, browser extension, or WalletConnect)
2. Switch to Mantle testnet
3. Mint the configured stream token (mock USDT) using the deployed contract
4. Create your first stream!

## 📋 Features

### ✅ Implemented

- [x] **Core Streaming Logic**
  - Create streams with custom duration and amount
  - Real-time calculation of streamable amounts
  - Cancel streams with automatic refunds

- [x] **Smart Contracts**
  - Comprehensive test suite (30 tests, 100% pass rate)
  - Gas-optimized Solidity 0.8.30
  - OpenZeppelin security standards
  - Event emission for indexing

- [x] **Frontend Interface**
  - Wallet connection (MetaMask, WalletConnect QR, browser extensions)
  - Real-time animated counters
  - Stream visualization charts
  - Responsive design with Tailwind CSS

- [x] **Advanced Streaming Controls**
  - Transferable ERC-721 receipts per stream
  - Multi-token allocations within a single stream
  - Batch claim function for payroll-style withdrawals
  - Sender-driven top-ups and duration extensions

- [x] **Developer Experience**
  - Automated deployment scripts
  - Contract verification on Mantlescan
  - TypeScript throughout
  - Comprehensive documentation

### 🔮 Future Improvements

- [ ] **Stream Templates** - Save and reuse multi-recipient configurations
- [ ] **Advanced Analytics** - Token-by-token forecast charts and yield breakdowns
- [ ] **Notification Enhancements** - SMS/email bridges in addition to on-chain alerts
- [ ] **Role-Based Access** - Delegate stream management to trusted operators

## 🔧 Technical Details

### Gas Optimization

- **Stream Creation**: ~358,000 gas
- **Claim**: ~399,000 gas
- **Cancel**: ~388,000 gas

### Security Features

- Reentrancy protection with OpenZeppelin guards
- Pausable contract for emergency stops
- Safe math for all calculations (Solidity 0.8+)
- Comprehensive input validation

### Precision

- Rate calculations use second-precision
- No floating point - all integer arithmetic
- Rounding handled correctly for edge cases

## 📚 API Reference

### Core Functions

#### `createStream(recipient, token, totalAmount, duration)`
Creates a single-token payment stream and mints an NFT receipt.

#### `createStreamsBatch(params[])`
Creates many streams in one transaction. Each `params[i]` includes:
- `recipient` (address)
- `tokens` (address[]): array of ERC-20 addresses
- `totalAmounts` (uint256[]): matching array of totals per token
- `duration` (uint256): seconds of streaming

#### `claim(streamId)`
Claims accumulated tokens from a stream. Callable by the NFT holder.

#### `claimStreamsBatch(streamIds[])`
Aggregates multiple stream claims into a single transaction.

#### `cancelStream(streamId)`
Cancels a stream and refunds remaining allocations to the sender.

#### `topUpStream(streamId, token, amount)`
Adds more liquidity (or a new token) to an active stream.

#### `extendStreamDuration(streamId, additionalDuration)`
Extends the accrual window without redeploying the stream.

### View Functions

#### `getStream(streamId)`
Returns the stream metadata plus the list of token allocations.

#### `getStreamableAmounts(streamId)`
Returns two arrays: token addresses and the currently claimable amount for each.

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
cd contracts
forge test -vv
```

**Test Results:**
```
Ran 4 test suites: 30 tests passed, 0 failed
- StreamManager: 14 tests
- StreamVault: 3 tests
- AccountingLib: 11 tests
- Integration: 2 tests
```

## 🌐 Deployment

### Mantle Sepolia Testnet

- **Network ID**: 5003
- **RPC**: https://mantle-sepolia.drpc.org
- **Explorer**: https://explorer.testnet.mantle.xyz

### Contract Addresses

After deployment, addresses are saved to `deployment.env`:

```bash
STREAM_MANAGER_ADDRESS=0x...
STREAM_VAULT_ADDRESS=0x...
MOCK_USDT_ADDRESS=0x...
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install -g @foundry-rs/foundry

# Contract development
cd contracts
forge install
forge test

# Frontend development
cd frontend
npm install
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mantle Network** for the L2 infrastructure
- **OpenZeppelin** for secure contract libraries
- **Wagmi** for excellent Web3 React hooks
- **Foundry** for fast Solidity development

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/streampay-mantle/issues)
- **Documentation**: [Full technical docs](./docs/)
- **Discord**: [Join our community](https://discord.gg/streampay)

---

**Built with ❤️ for the Mantle ecosystem**
