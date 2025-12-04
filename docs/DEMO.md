# StreamPay Mantle Demo Guide

This guide walks you through a complete demonstration of StreamPay Mantle's real-time payment streaming capabilities.

## 🎭 Demo Scenario

**Scenario**: Alice wants to stream 1,000 Mock USDT (the token deployed at `0x5dB24867c863dE8262c12627381199556DF2d546`) to Bob over 24 hours for freelance work. Bob can claim his accumulated payment anytime, and Alice can cancel if needed.

## 🚀 Setup for Demo

### Prerequisites
- MetaMask wallet with Mantle testnet configured
- Some MNT tokens for gas (get from Mantle faucet)
- Two wallet addresses (Alice as sender, Bob as recipient)

### 1. Get Testnet Tokens

```bash
# Visit Mantle testnet faucet
# https://faucet.testnet.mantle.xyz
# Request MNT tokens for both Alice and Bob's addresses
```

### 2. Access Demo Application

```bash
# Local deployment
cd streampay-mantle/frontend
npm run dev
# Open http://localhost:3000

# Or use live demo
# https://streampay-mantle.vercel.app
```

## 📱 Step-by-Step Demo

### Step 1: Connect Alice's Wallet

1. **Connect Wallet**
   - Click "Connect MetaMask"
   - Approve connection
   - Switch to Mantle testnet if prompted

2. **Get Mock USDT Tokens**
   - Use the Mint button exposed in the Legacy Console (under Token Tools) or call `mint(alice, amount)` directly on Mock USDT at `0x5dB24867c863dE8262c12627381199556DF2d546`.

3. **Approve Token Spending**
   ```bash
   # Alice needs to approve StreamManager to spend her tokens
   # This is handled automatically in the UI
   ```

### Step 2: Create Payment Stream

1. **Fill Stream Form**
   ```
   Recipient: Bob's wallet address (0x...)
   Amount: 1000 mUSDT
   Duration: 24 hours
   ```

2. **Submit Transaction**
   - Review transaction details
   - Confirm in MetaMask
   - Wait for confirmation

3. **Stream Created!**
   ```
   ✅ Stream #1 created
   📊 Rate: 0.011574 mUSDT/second
   ⏱️ Duration: 86,400 seconds
   ```

### Step 3: Real-Time Streaming Visualization

**Watch the Magic Happen:**

```bash
⏰ 00:00:00 → 0.000000 mUSDT streamed
⏰ 00:01:00 → 0.694444 mUSDT streamed
⏰ 00:05:00 → 3.472222 mUSDT streamed
⏰ 01:00:00 → 41.666667 mUSDT streamed
⏰ 12:00:00 → 500.000000 mUSDT streamed (50% complete)
⏰ 24:00:00 → 1000.000000 mUSDT streamed (100% complete)
```

**UI Features Demonstrated:**
- ⚡ Real-time animated counter updates every second
- 📈 Progress bar with flowing animation
- 📊 Live stream visualization chart
- 💰 Claimable amount indicator

### Step 4: Bob Claims Payment (Mid-Stream)

1. **Switch to Bob's Wallet**
   - Disconnect Alice's wallet
   - Connect Bob's wallet
   - Navigate to "Received Streams" tab

2. **View Stream Details**
   ```
   Stream #1 from Alice
   ✅ Status: Active
   💰 Claimable: 125.00 mUSDT (after 3 hours)
   📈 Progress: 12.5%
   ```

3. **Claim Accumulated Tokens**
   - Click "Claim" button
   - Confirm transaction
   - Watch balance update

### Step 5: Real-Time Updates Demo

**Demonstrate live updates:**

```javascript
// Every second, the UI updates:
setInterval(() => {
  const elapsed = now() - startTime;
  const streamed = (ratePerSecond * elapsed);
  updateDisplay(streamed);
}, 1000);
```

**Visual Effects:**
- 🌊 Flowing progress bar animation
- 🔢 Smooth number transitions
- 📊 Live chart updates
- ⚡ Instantaneous balance changes

### Step 6: Pause & Resume Mid-Stream

1. **Sender Pauses**
   - Alice clicks "Pause Stream" from the dashboard
   - Outstanding claimable funds are automatically delivered to Bob
   - Status badges flip to "Paused" across the dashboards (Push/WalletConnect notifications are planned but not enabled in this build)

2. **Sender Resumes**
   - Alice clicks "Resume Stream" to continue accrual
   - The dashboard shows the paused duration deducted from the total timeline

### Step 7: Alice Cancels Stream (Demo)

1. **Switch Back to Alice**
   - Connect Alice's wallet
   - View "Sent Streams" tab

2. **Cancel Stream**
   ```
   Stream #1 to Bob
   💰 Total: 1000 mUSDT
   ✅ Streamed: 375 mUSDT (after 9 hours)
   💸 Remaining: 625 mUSDT
   ```

3. **Confirm Cancellation**
   - Click "Cancel Stream"
   - Confirm transaction
   - Automatic refund of remaining tokens

## 🎥 Demo Script (1-minute presentation)

### Intro (10 seconds)
> "StreamPay Mantle enables real-time token streaming on Mantle L2. Watch as Alice streams 1000 tokens to Bob over 24 hours."

### Setup (15 seconds)
> "Alice connects her wallet and creates a stream. The tokens don't transfer all at once - they flow continuously, second by second."

### Live Streaming (20 seconds)
> "See the magic! The counter updates in real-time. After 3 hours, Bob has access to 125 tokens. He can claim anytime without affecting the stream."

### Claim Demo (10 seconds)
> "Bob claims his earned tokens. The stream continues, and Alice's remaining balance updates automatically."

### Conclusion (5 seconds)
> "Perfect for payroll, subscriptions, or any continuous payment needs. Built on Mantle L2 for minimal fees."

## 🛠️ Technical Demo Features

### Backend Demonstration

```bash
# Show contract interaction
forge script --rpc-url $MANTLE_TESTNET_RPC \
  --sig "createStream(address,address,uint256,uint256)" \
  $STREAM_MANAGER \
  $BOB_ADDRESS \
  $TOKEN_ADDRESS \
  1000000000 \
  86400

# Monitor events
cast logs --address $STREAM_MANAGER \
  --from-block latest \
  --rpc-url $MANTLE_TESTNET_RPC
```

### Frontend Demonstration

```javascript
// Real-time calculation
const calculateStreamedAmount = () => {
  const elapsed = Math.floor(Date.now() / 1000) - startTime;
  const streamed = ratePerSecond * elapsed;
  return Math.min(streamed, totalAmount);
};

// Update every second
useEffect(() => {
  const timer = setInterval(() => {
    setStreamedAmount(calculateStreamedAmount());
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

## 📊 Demo Metrics

### Performance Benchmarks

```bash
⚡ Stream Creation: ~358,000 gas (~$0.01 on Mantle)
⚡ Claim Transaction: ~399,000 gas (~$0.01 on Mantle)
⚡ Cancel Transaction: ~388,000 gas (~$0.01 on Mantle)
⚡ Frontend Updates: <1ms latency
⚡ Real-time Accuracy: ±1 second precision
```

### User Experience Metrics

```bash
✅ Wallet Connection: <3 seconds
✅ Stream Creation: <30 seconds end-to-end
✅ Real-time Updates: Every 1 second
✅ Claim Processing: <15 seconds
✅ Mobile Responsive: Full functionality
```

## 🎯 Demo Variations

### Micro-Payment Demo
```bash
Amount: 1 mUSDT
Duration: 60 seconds
Rate: 0.016667 mUSDT/second
Use Case: Per-second API billing
```

### Subscription Demo
```bash
Amount: 30 mUSDT
Duration: 30 days
Rate: 0.000012 mUSDT/second
Use Case: Monthly service subscription
```

### Salary Demo
```bash
Amount: 5000 mUSDT
Duration: 1 month (2,592,000 seconds)
Rate: 0.001929 mUSDT/second
Use Case: Employee salary streaming
```

## 🐛 Demo Troubleshooting

### Common Issues

**Wallet Connection Failed**
```bash
Solution: Ensure MetaMask is installed and unlocked
Check: Network is set to Mantle testnet
```

**Transaction Failed**
```bash
Solution: Check gas balance (MNT tokens)
Check: Token approval for spending
```

**Real-time Updates Not Working**
```bash
Solution: Refresh page and reconnect wallet
Check: Network connectivity stable
```

**Claims Not Processing**
```bash
Solution: Verify stream is active
Check: Sufficient claimable amount (>0)
```

## 📈 Success Metrics

After the demo, users should understand:

- ✅ **Real-time streaming concept** - Tokens flow continuously
- ✅ **Recipient flexibility** - Claim anytime, any amount
- ✅ **Sender control** - Cancel and reclaim remaining tokens
- ✅ **Cost efficiency** - Minimal gas fees on Mantle L2
- ✅ **User experience** - Intuitive, responsive interface
- ✅ **Technical reliability** - Precise calculations, secure transfers

This demo showcases StreamPay Mantle as a production-ready solution for next-generation payment streaming.
