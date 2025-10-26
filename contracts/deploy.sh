#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 StreamPay Mantle Deployment Script${NC}"
echo "============================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found. Please copy .env.example to .env and fill in your values.${NC}"
    exit 1
fi

# Source environment variables
source .env

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ PRIVATE_KEY not set in .env file${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Pre-deployment checks...${NC}"

# Run tests
echo "Running tests..."
forge test
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tests failed. Please fix before deploying.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All tests passed${NC}"

# Deploy to Mantle testnet
echo -e "${YELLOW}🌐 Deploying to Mantle testnet...${NC}"
forge script script/Deploy.s.sol:DeployScript --rpc-url $MANTLE_TESTNET_RPC --broadcast --verify

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"

    # Check if deployment.env was created
    if [ -f deployment.env ]; then
        echo -e "${GREEN}📄 Deployment addresses saved to deployment.env${NC}"
        cat deployment.env

        # Append to .env file
        echo "" >> .env
        echo "# Deployed Contract Addresses" >> .env
        cat deployment.env >> .env
        echo -e "${GREEN}✅ Contract addresses added to .env file${NC}"
    fi

    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Update your frontend with the deployed contract addresses"
    echo "2. Verify contracts on Mantlescan (if verification failed)"
    echo "3. Fund your test accounts with mock USDT using the deployed token"
else
    echo -e "${RED}❌ Deployment failed. Check the output above for errors.${NC}"
    exit 1
fi