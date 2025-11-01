# StreamPay Mantle Architecture

## System Overview

StreamPay Mantle is a real-time payment streaming protocol built on Mantle L2 testnet. The system enables continuous token transfers between parties with second-by-second precision.

## Core Components

### 1. Smart Contracts

#### StreamManager.sol
The main orchestration contract that handles:
- Stream creation and lifecycle management
- User authentication and authorization
- Event emission for frontend indexing
- Integration with vault and accounting systems

**Key Features:**
- Reentrancy protection using OpenZeppelin guards
- Pausable functionality for emergency stops
- Owner-only administrative functions
- Gas-optimized operations
- Sender-controlled stream pausing/resuming with precise accrual accounting
- Batch payroll stream creation for multi-recipient workflows

#### StreamVault.sol
Secure token escrow system:
- Holds tokens during streaming period
- Owner-only withdrawal mechanism
- Safe ERC-20 token handling
- Balance tracking and validation
- Configurable yield strategies with reserve ratios and automated allocation

#### AccountingLib.sol
Pure mathematical library for:
- Streaming rate calculations
- Accrued amount computation
- Time-based progression tracking
- Precision handling for edge cases

### 2. Frontend Application

#### Technology Stack
- **Vite + React 18**: SPA toolchain for fast builds and HMR
- **TypeScript**: Type-safe development
- **Wagmi v2**: Web3 React hooks and wallet integration
- **Viem**: Ethereum interaction library
- **TailwindCSS**: Utility-first styling
- **Recharts**: Data visualization
- **Push Protocol & WalletConnect Notify**: Optional on-chain/off-chain notifications

#### Architecture Pattern
- **Client-side rendering** for real-time updates
- **React hooks** for state management
- **Custom hooks** for blockchain interactions
- **Component composition** for reusability

## Data Flow

### Stream Creation
```
1. User initiates stream creation
2. Frontend validates inputs
3. Contract checks token allowance
4. Tokens transferred to vault
5. Stream record created
6. Event emitted
7. Frontend updates UI
```

### Real-time Updates
```
1. Timer triggers every second
2. Calculate current streamable amount
3. Update animated counters
4. Refresh blockchain data
5. Update progress indicators
```

### Claim Process
```
1. Recipient initiates claim
2. Contract calculates accrued amount
3. Vault transfers tokens to recipient
4. Stream state updated
5. Event emitted
6. Frontend reflects changes
```
### Pause & Resume Lifecycle
- Sender pauses the stream; any outstanding balance is settled immediately.
- Accrual is frozen using the pause timestamp and resumes with accurate catch-up math.
- Notifications keep both parties aware of the current status.

### Batch Payroll Creation
- Spreadsheet-style UI gathers multiple recipients and amounts in a single submission.
- Shared duration/token keeps allowance approval predictable while the contract iterates safely.
- Each stream still emits its own events for analytics and auditability.

### Yield Allocation
- Vault owner can route idle balances into external strategies while maintaining a configurable reserve.
- Deposits automatically sweep excess funds; withdrawals pull from strategies on demand.
- Harvest hooks let operators realise yield without interrupting active streams.


## Security Considerations

### Smart Contract Security
- **Reentrancy Protection**: All state-changing functions use OpenZeppelin's `nonReentrant` modifier
- **Access Control**: Proper role-based permissions with `onlyOwner` and sender validation
- **Input Validation**: Comprehensive checks for addresses, amounts, and durations
- **Safe Math**: Solidity 0.8+ overflow protection
- **Emergency Stops**: Pausable functionality for crisis management

### Frontend Security
- **Type Safety**: TypeScript prevents runtime errors
- **Input Sanitization**: Client-side validation before blockchain calls
- **Error Handling**: Graceful degradation for network issues
- **Wallet Security**: Read-only operations when possible

## Performance Optimizations

### Gas Efficiency
- **Batch Operations**: Efficient storage access patterns
- **Optimized Loops**: Minimal iteration in contracts
- **Event Indexing**: Efficient log structure for querying
- **Storage Layout**: Packed structs for reduced gas costs

### Frontend Performance
- **React Optimization**: Memoization and efficient re-renders
- **Real-time Updates**: Optimized polling intervals
- **Lazy Loading**: Components loaded on demand
- **Caching**: Strategic use of React Query caching

## Error Handling

### Contract Errors
- Custom error messages for debugging
- Revert reasons for transaction failures
- Event emission for successful operations
- State validation before mutations

### Frontend Errors
- User-friendly error messages
- Transaction status tracking
- Network connectivity handling
- Wallet connection error recovery

## Testing Strategy

### Smart Contract Testing
- **Unit Tests**: Individual function testing
- **Integration Tests**: Cross-contract interactions
- **Edge Cases**: Boundary condition testing
- **Gas Testing**: Optimization verification

### Frontend Testing
- Manual QA runs through the Vite dev server
- Automated component/integration tests planned for future revisions

## Deployment Architecture

### Infrastructure
- **Mantle L2 Testnet**: Primary deployment target
- **IPFS**: Decentralized frontend hosting option
- **Vercel/Netlify**: Centralized hosting alternative

### CI/CD Pipeline
```
1. Code commit triggers pipeline
2. Run test suites
3. Build and compile contracts
4. Deploy to testnet
5. Verify contracts on explorer
6. Build and deploy frontend
7. Update documentation
```

## Monitoring and Analytics

### On-chain Analytics
- Stream creation rate
- Total volume streamed
- Average stream duration
- Claim frequency patterns

### Frontend Analytics
- User engagement metrics
- Transaction success rates
- Error frequency tracking
- Performance monitoring

## Scalability Considerations

### Current Limitations
- Single-chain deployment (Mantle only)
- Manual stream management
- Basic claiming mechanism

### Future Scaling Solutions
- Multi-chain deployment
- Automated stream templates
- Batch claiming functionality
- Advanced notification systems

## Integration Patterns

### Wallet Integration
- Multiple wallet support (injected wallets + WalletConnect)
- Network validation prompts
- Transaction signing flow
- Balance monitoring

### Contract Integration
- ABI-based type generation
- Event listening and parsing
- Error handling and recovery
- Gas estimation

This architecture provides a solid foundation for a production-ready streaming payment protocol while maintaining security, performance, and user experience standards.
