#!/bin/bash

# Health Check Endpoints Test Script
# Tests all health check endpoints and displays results

set -e

API_URL=${API_URL:-"http://localhost:3000"}
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:8080"}

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          HEALTH CHECK ENDPOINTS TEST                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

test_endpoint() {
    local name=$1
    local url=$2
    local expected_field=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo "ERROR\n000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 503 ]; then
        status=$(echo "$body" | jq -r ".$expected_field // .status" 2>/dev/null || echo "unknown")
        
        if [ "$status" = "healthy" ]; then
            echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code, Status: $status)"
        elif [ "$status" = "degraded" ]; then
            echo -e "${YELLOW}⚠ DEGRADED${NC} (HTTP $http_code, Status: $status)"
        elif [ "$status" = "unhealthy" ]; then
            echo -e "${RED}✗ UNHEALTHY${NC} (HTTP $http_code, Status: $status)"
        elif [ "$status" = "alive" ] || [ "$status" = "ready" ]; then
            echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code, Status: $status)"
        else
            echo -e "${RED}✗ FAILED${NC} (HTTP $http_code, Unknown status: $status)"
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    fi
}

echo "Backend Endpoints (Direct):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Overall Health (/health)" "$API_URL/health" "status"
test_endpoint "Overall Health (/api/health)" "$API_URL/api/health" "status"
test_endpoint "Database Health" "$API_URL/api/health/db" "status"
test_endpoint "Auth Service Health" "$API_URL/api/health/auth" "status"
test_endpoint "Liveness Probe (/healthz)" "$API_URL/healthz" "status"
test_endpoint "Readiness Probe (/readyz)" "$API_URL/readyz" "status"

echo ""
echo "Frontend Endpoints (Through Nginx):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Overall Health" "$FRONTEND_URL/api/health" "status"
test_endpoint "Database Health" "$FRONTEND_URL/api/health/db" "status"
test_endpoint "Auth Service Health" "$FRONTEND_URL/api/health/auth" "status"

echo ""
echo "Detailed Information:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get detailed health info
health_data=$(curl -s "$API_URL/api/health" 2>/dev/null)

if [ -n "$health_data" ]; then
    echo "• Status: $(echo "$health_data" | jq -r '.status')"
    echo "• Uptime: $(echo "$health_data" | jq -r '.uptime')s"
    echo "• Environment: $(echo "$health_data" | jq -r '.environment')"
    echo "• Version: $(echo "$health_data" | jq -r '.version')"
    echo "• Memory Usage: $(echo "$health_data" | jq -r '.system.memory.percentage')%"
    echo ""

    echo "Services:"
    echo "$health_data" | jq -r '.services | to_entries[] | "  • \(.key): \(.value.status) (\(.value.responseTime)ms)"'

    echo ""
    echo "Database Details:"
    curl -s "$API_URL/api/health/db" 2>/dev/null | jq -r '"  • User Count: \(.details.userCount)\n  • Provider: \(.details.provider)\n  • Connection Time: \(.details.connectionTime)"'

    echo ""
    echo "Authentication Details:"
    curl -s "$API_URL/api/health/auth" 2>/dev/null | jq -r '"  • User Count: \(.details.userCount)\n  • Admin Count: \(.details.adminCount)\n  • JWT Configured: \(.details.jwtConfigured)"'
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                  TEST COMPLETE                               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Frontend Health Page: $FRONTEND_URL/health"
echo "Backend API Docs: See HEALTH-ENDPOINTS.md"
echo ""
