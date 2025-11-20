#!/bin/bash

echo "🧪 Testing Health Check Endpoint"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backend is running
echo "1. Checking if backend is running..."
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend is not running!${NC}"
    echo ""
    echo "Please start the backend first:"
    echo "  npm run dev"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Backend is running${NC}"
echo ""

# Test comprehensive health check
echo "2. Testing comprehensive health check..."
echo "   GET /api/health"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/health)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ HTTP Status: $HTTP_CODE${NC}"
else
    echo -e "${RED}❌ HTTP Status: $HTTP_CODE${NC}"
fi
echo ""

# Parse and display results using jq if available
if command -v jq &> /dev/null; then
    echo "📊 Health Check Results:"
    echo ""
    
    STATUS=$(echo "$BODY" | jq -r '.status')
    if [ "$STATUS" = "healthy" ]; then
        echo -e "   Overall Status: ${GREEN}✅ $STATUS${NC}"
    elif [ "$STATUS" = "degraded" ]; then
        echo -e "   Overall Status: ${YELLOW}⚠️  $STATUS${NC}"
    else
        echo -e "   Overall Status: ${RED}❌ $STATUS${NC}"
    fi
    
    echo "   Environment: $(echo "$BODY" | jq -r '.environment')"
    echo "   Uptime: $(echo "$BODY" | jq -r '.uptime')s"
    echo "   Version: $(echo "$BODY" | jq -r '.version')"
    echo ""
    
    echo "🔧 Service Status:"
    
    # Database
    DB_STATUS=$(echo "$BODY" | jq -r '.services.database.status')
    DB_MSG=$(echo "$BODY" | jq -r '.services.database.message')
    if [ "$DB_STATUS" = "healthy" ]; then
        echo -e "   Database: ${GREEN}✅ $DB_STATUS${NC} - $DB_MSG"
    else
        echo -e "   Database: ${RED}❌ $DB_STATUS${NC} - $DB_MSG"
    fi
    
    # Authentication
    AUTH_STATUS=$(echo "$BODY" | jq -r '.services.authentication.status')
    AUTH_MSG=$(echo "$BODY" | jq -r '.services.authentication.message')
    if [ "$AUTH_STATUS" = "healthy" ]; then
        echo -e "   Authentication: ${GREEN}✅ $AUTH_STATUS${NC} - $AUTH_MSG"
    else
        echo -e "   Authentication: ${RED}❌ $AUTH_STATUS${NC} - $AUTH_MSG"
    fi
    
    # API
    API_STATUS=$(echo "$BODY" | jq -r '.services.api.status')
    API_MSG=$(echo "$BODY" | jq -r '.services.api.message')
    if [ "$API_STATUS" = "healthy" ]; then
        echo -e "   API Routes: ${GREEN}✅ $API_STATUS${NC} - $API_MSG"
    else
        echo -e "   API Routes: ${RED}❌ $API_STATUS${NC} - $API_MSG"
    fi
    
    # Cache (optional)
    CACHE_STATUS=$(echo "$BODY" | jq -r '.services.cache.status // "not configured"')
    if [ "$CACHE_STATUS" != "not configured" ]; then
        CACHE_MSG=$(echo "$BODY" | jq -r '.services.cache.message')
        if [ "$CACHE_STATUS" = "healthy" ]; then
            echo -e "   Cache: ${GREEN}✅ $CACHE_STATUS${NC} - $CACHE_MSG"
        elif [ "$CACHE_STATUS" = "degraded" ]; then
            echo -e "   Cache: ${YELLOW}⚠️  $CACHE_STATUS${NC} - $CACHE_MSG"
        else
            echo -e "   Cache: ${RED}❌ $CACHE_STATUS${NC} - $CACHE_MSG"
        fi
    fi
    
    echo ""
    echo "📊 System Metrics:"
    MEM_PCT=$(echo "$BODY" | jq -r '.system.memory.percentage')
    MEM_USED=$(echo "$BODY" | jq -r '.system.memory.used')
    MEM_TOTAL=$(echo "$BODY" | jq -r '.system.memory.total')
    CPU_USAGE=$(echo "$BODY" | jq -r '.system.cpu.usage')
    
    MEM_USED_MB=$(echo "scale=2; $MEM_USED / 1024 / 1024" | bc)
    MEM_TOTAL_MB=$(echo "scale=2; $MEM_TOTAL / 1024 / 1024" | bc)
    
    echo "   Memory: ${MEM_PCT}% (${MEM_USED_MB} MB / ${MEM_TOTAL_MB} MB)"
    echo "   CPU: ${CPU_USAGE}s user time"
    
else
    echo "Raw JSON Response:"
    echo "$BODY"
    echo ""
    echo "💡 Tip: Install 'jq' for pretty output: sudo apt-get install jq"
fi

echo ""
echo "3. Testing liveness probe..."
echo "   GET /healthz"
LIVENESS=$(curl -s http://localhost:3000/healthz)
if echo "$LIVENESS" | grep -q "alive"; then
    echo -e "${GREEN}✅ Liveness probe: OK${NC}"
else
    echo -e "${RED}❌ Liveness probe: FAILED${NC}"
fi
echo ""

echo "4. Testing readiness probe..."
echo "   GET /readyz"
READINESS=$(curl -s -w "\n%{http_code}" http://localhost:3000/readyz)
READY_CODE=$(echo "$READINESS" | tail -n1)
if [ "$READY_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Readiness probe: OK${NC}"
else
    echo -e "${RED}❌ Readiness probe: FAILED (HTTP $READY_CODE)${NC}"
fi
echo ""

echo "================================"
echo "✅ Health check tests complete!"
echo ""
echo "📖 Access the dashboard:"
echo "   http://localhost:5173/health-check.html"
echo ""
