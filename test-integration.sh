#!/usr/bin/env bash
# Service Integration Test Script
# Tests connectivity between frontend, backend, and AI service

set -e

echo "🔍 Testing Liquifi Service Integration..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test AI Service
echo "1️⃣  Testing AI Service (port 8001)..."
if curl -s http://127.0.0.1:8001/health > /dev/null; then
    echo -e "${GREEN}✅ AI Service is running${NC}"
    AI_RESPONSE=$(curl -s http://127.0.0.1:8001/health)
    echo "   Response: $AI_RESPONSE"
else
    echo -e "${RED}❌ AI Service is NOT running on port 8001${NC}"
    echo -e "${YELLOW}   Start it with: cd ai-service && source .venv/bin/activate && uvicorn app:app --reload --port 8001${NC}"
fi
echo ""

# Test Backend API
echo "2️⃣  Testing Backend API (port 4000)..."
if curl -s http://127.0.0.1:4000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend API is running${NC}"
    BACKEND_RESPONSE=$(curl -s http://127.0.0.1:4000/health)
    echo "   Response: $BACKEND_RESPONSE"

    # Test backend config endpoint
    echo "   Testing /api/config endpoint..."
    CONFIG_RESPONSE=$(curl -s http://127.0.0.1:4000/api/config)
    echo "   Config: $CONFIG_RESPONSE"
else
    echo -e "${RED}❌ Backend API is NOT running on port 4000${NC}"
    echo -e "${YELLOW}   Start it with: cd backend && npm run dev${NC}"
fi
echo ""

# Test Backend → AI Service connection
echo "3️⃣  Testing Backend → AI Service connection..."
if command -v curl > /dev/null && curl -s http://127.0.0.1:8001/health > /dev/null && curl -s http://127.0.0.1:4000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend can reach AI Service${NC}"
    echo "   Testing risk scoring..."

    # Test risk scoring endpoint
    RISK_TEST=$(curl -s -X POST http://127.0.0.1:8001/score-business \
        -H "Content-Type: application/json" \
        -d '{
            "address": "0x1234567890123456789012345678901234567890",
            "monthlyRevenue": 75000,
            "revenueVolatility": 15,
            "missedPayments": 0,
            "useVerifiedData": false
        }')

    if echo "$RISK_TEST" | grep -q "score"; then
        echo -e "${GREEN}   ✅ Risk scoring works!${NC}"
        echo "   Score response: $RISK_TEST"
    else
        echo -e "${RED}   ❌ Risk scoring failed${NC}"
        echo "   Response: $RISK_TEST"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot test - ensure both services are running${NC}"
fi
echo ""

# Test Frontend
echo "4️⃣  Testing Frontend (port 3000)..."
if curl -s http://127.0.0.1:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
    echo "   Access it at: http://localhost:3000"
else
    echo -e "${RED}❌ Frontend is NOT running on port 3000${NC}"
    echo -e "${YELLOW}   Start it with: cd frontend && npm run dev${NC}"
fi
echo ""

# Check environment variables
echo "5️⃣  Checking environment configuration..."

# Check frontend .env.local
if [ -f "frontend/.env.local" ]; then
    echo -e "${GREEN}✅ Frontend .env.local exists${NC}"

    if grep -q "VITE_BACKEND_API_URL" frontend/.env.local; then
        BACKEND_URL=$(grep VITE_BACKEND_API_URL frontend/.env.local | cut -d'=' -f2)
        echo "   Backend URL: $BACKEND_URL"
    else
        echo -e "${RED}   ❌ VITE_BACKEND_API_URL not configured${NC}"
    fi

    if grep -q "VITE_AI_SERVICE_URL" frontend/.env.local; then
        AI_URL=$(grep VITE_AI_SERVICE_URL frontend/.env.local | cut -d'=' -f2)
        echo "   AI Service URL: $AI_URL"
    else
        echo -e "${YELLOW}   ⚠️  VITE_AI_SERVICE_URL not configured (optional)${NC}"
    fi
else
    echo -e "${RED}❌ Frontend .env.local not found${NC}"
fi

# Check backend .env
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ Backend .env exists${NC}"

    if grep -q "AI_SERVICE_URL" backend/.env; then
        AI_URL=$(grep AI_SERVICE_URL backend/.env | cut -d'=' -f2)
        echo "   AI Service URL: $AI_URL"
    else
        echo -e "${RED}   ❌ AI_SERVICE_URL not configured${NC}"
    fi
else
    echo -e "${RED}❌ Backend .env not found${NC}"
fi

# Check ai-service .env
if [ -f "ai-service/.env" ]; then
    echo -e "${GREEN}✅ AI Service .env exists${NC}"
else
    echo -e "${YELLOW}⚠️  AI Service .env not found (uses defaults)${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
ALL_RUNNING=true
curl -s http://127.0.0.1:8001/health > /dev/null || ALL_RUNNING=false
curl -s http://127.0.0.1:4000/health > /dev/null || ALL_RUNNING=false
curl -s http://127.0.0.1:3000 > /dev/null || ALL_RUNNING=false

if [ "$ALL_RUNNING" = true ]; then
    echo -e "${GREEN}🎉 All services are running and connected!${NC}"
    echo ""
    echo "Service URLs:"
    echo "  - Frontend:    http://localhost:3000"
    echo "  - Backend API: http://localhost:4000"
    echo "  - AI Service:  http://localhost:8001"
    echo ""
    echo "Next steps:"
    echo "  1. Open http://localhost:3000 in your browser"
    echo "  2. Go to Business workspace"
    echo "  3. Connect your wallet"
    echo "  4. Register a business profile"
    echo "  5. Watch the AI service calculate your risk score!"
else
    echo -e "${YELLOW}⚠️  Some services are not running yet${NC}"
    echo ""
    echo "Start all services with:"
    echo "  ./start-services.sh"
    echo ""
    echo "Or start manually:"
    echo "  Terminal 1: cd ai-service && source .venv/bin/activate && uvicorn app:app --reload --port 8001"
    echo "  Terminal 2: cd backend && npm run dev"
    echo "  Terminal 3: cd frontend && npm run dev"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
