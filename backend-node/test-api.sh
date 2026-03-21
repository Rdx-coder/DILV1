#!/bin/bash

# Dangi Innovation Lab - Backend API Test Script
# This script tests all API endpoints

BASE_URL="http://localhost:8001/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================================="
echo "  Testing Dangi Innovation Lab Backend API"
echo "=================================================="
echo ""

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    local test_name=$5
    
    echo -n "Testing: $test_name... "
    
    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "$headers" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        fi
    else
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "$headers")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [[ "$http_code" == "200" || "$http_code" == "201" ]]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "  Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# 1. Test Health Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Health Check Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "GET" "/health" "" "" "GET /api/health"
echo ""

# 2. Test Root API Info
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. Root API Info"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "GET" "" "" "" "GET /api"
echo ""

# 3. Test Admin Login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Admin Authentication"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

login_data='{"email":"admin@dangiinnovationlab.com","password":"Admin@123"}'
echo -n "Testing: POST /api/auth/login... "

login_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "$login_data")

http_code=$(echo "$login_response" | tail -n1)
body=$(echo "$login_response" | sed '$d')

if [[ "$http_code" == "200" ]]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    TOKEN=$(echo "$body" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
    echo "  Token obtained: ${TOKEN:0:20}..."
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    echo "  Response: $body"
    FAILED=$((FAILED + 1))
    TOKEN=""
fi
echo ""

# 4. Test Public Form Submissions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Public Form Submissions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

contact_data='{"name":"Test User","email":"test@example.com","subject":"Test Subject","message":"This is a test message","interest":"programs"}'
test_endpoint "POST" "/contact" "$contact_data" "" "POST /api/contact"

application_data='{"name":"Jane Doe","email":"jane@example.com","phone":"+1234567890","program":"Startups","message":"I want to apply"}'
test_endpoint "POST" "/application" "$application_data" "" "POST /api/application"

newsletter_data='{"email":"newsletter@example.com","name":"Newsletter Subscriber"}'
test_endpoint "POST" "/newsletter" "$newsletter_data" "" "POST /api/newsletter"
echo ""

# 5. Test Admin Protected Endpoints
if [ -n "$TOKEN" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "5. Admin Protected Endpoints"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    auth_header="Authorization: Bearer $TOKEN"
    
    test_endpoint "GET" "/auth/me" "" "$auth_header" "GET /api/auth/me"
    test_endpoint "GET" "/admin/stats" "" "$auth_header" "GET /api/admin/stats"
    test_endpoint "GET" "/admin/submissions" "" "$auth_header" "GET /api/admin/submissions"
    test_endpoint "GET" "/admin/submissions?status=new" "" "$auth_header" "GET /api/admin/submissions (filtered)"
    test_endpoint "GET" "/admin/submissions?search=test" "" "$auth_header" "GET /api/admin/submissions (search)"
    
    echo ""
    echo "Testing status update and reply (requires submission ID)..."
    
    # Get first submission ID
    submissions_response=$(curl -s "$BASE_URL/admin/submissions?limit=1" -H "$auth_header")
    submission_id=$(echo "$submissions_response" | grep -o '"_id":"[^"]*' | head -1 | sed 's/"_id":"//')
    
    if [ -n "$submission_id" ]; then
        echo "  Found submission ID: $submission_id"
        
        status_data='{"status":"in_progress"}'
        test_endpoint "PUT" "/admin/submissions/$submission_id/status" "$status_data" "$auth_header" "PUT /api/admin/submissions/:id/status"
        
        echo ""
        echo -e "${YELLOW}Note: Reply endpoint test skipped (requires email configuration)${NC}"
        echo "  To test reply: POST /api/admin/submissions/$submission_id/reply"
    else
        echo -e "  ${YELLOW}No submissions found to test status update${NC}"
    fi
else
    echo -e "${RED}Skipping admin endpoints - login failed${NC}"
fi

echo ""
echo "=================================================="
echo "  Test Summary"
echo "=================================================="
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
