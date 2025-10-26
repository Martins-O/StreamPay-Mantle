#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔍 StreamPay Contract Verification Script${NC}"
echo "================================================"

# Source environment variables
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

# Check required variables
if [ -z "$STREAM_MANAGER_ADDRESS" ] || [ -z "$MOCK_USDT_ADDRESS" ]; then
    echo -e "${RED}❌ Contract addresses not found in .env file${NC}"
    echo "Please ensure STREAM_MANAGER_ADDRESS and MOCK_USDT_ADDRESS are set"
    exit 1
fi

echo -e "${YELLOW}📋 Verifying contracts on Mantlescan...${NC}"

# Verify StreamManager
echo "Verifying StreamManager at $STREAM_MANAGER_ADDRESS..."
forge verify-contract \
    --chain-id 5003 \
    --num-of-optimizations 200 \
    --watch \
    --constructor-args $(cast abi-encode "constructor()") \
    --etherscan-api-key $MANTLESCAN_API_KEY \
    --compiler-version v0.8.30+commit.5b4cc3d1 \
    $STREAM_MANAGER_ADDRESS \
    src/StreamManager.sol:StreamManager

# Verify Mock USDT
echo "Verifying Mock USDT at $MOCK_USDT_ADDRESS..."
forge verify-contract \
    --chain-id 5003 \
    --num-of-optimizations 200 \
    --watch \
    --constructor-args $(cast abi-encode "constructor(string,string,uint256)" "Mock USDT" "mUSDT" "1000000000000000") \
    --etherscan-api-key $MANTLESCAN_API_KEY \
    --compiler-version v0.8.30+commit.5b4cc3d1 \
    $MOCK_USDT_ADDRESS \
    src/MockERC20.sol:MockERC20

echo -e "${GREEN}✅ Verification process completed${NC}"