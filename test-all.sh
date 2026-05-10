#!/bin/bash

echo "╔════════════════════════════════════════════╗"
echo "║   E-Commerce Microservices Test Suite      ║"
echo "╚════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

test_endpoint() {
  local desc="$1"
  local method="$2"
  local url="$3"
  local data="$4"
  
  echo -n "Testing: $desc... "
  
  if [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$url" -H "Content-Type: application/json" -d "$data" --max-time 5)
  else
    response=$(curl -s -w "\n%{http_code}" "$url" --max-time 5)
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 400 ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    echo "   Response: $(echo $body | head -c 100)..."
  else
    echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
    echo "   Error: $(echo $body | head -c 100)"
  fi
  echo ""
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  HEALTH CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "API Gateway Health" "GET" "http://localhost:8080/health"
test_endpoint "Auth Service Health" "GET" "http://localhost:3001/health"
test_endpoint "Product Service Health" "GET" "http://localhost:3002/health"
test_endpoint "Order Service Health" "GET" "http://localhost:3003/health"
test_endpoint "Payment Service Health" "GET" "http://localhost:3004/health"
test_endpoint "Notification Service Health" "GET" "http://localhost:3005/health"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AUTHENTICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Register User" "POST" "http://localhost:8080/api/auth/register" \
  '{"email":"demo2@example.com","password":"demo123","firstName":"Demo","lastName":"User"}'
test_endpoint "Login" "POST" "http://localhost:8080/api/auth/login" \
  '{"email":"demo2@example.com","password":"demo123"}'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PRODUCTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Get Products" "GET" "http://localhost:8080/api/products"
test_endpoint "Create Product" "POST" "http://localhost:8080/api/products" \
  '{"name":"Gaming Laptop","description":"High-performance laptop","price":1299.99,"category":"Electronics","stock":50}'
test_endpoint "Create Another Product" "POST" "http://localhost:8080/api/products" \
  '{"name":"Wireless Mouse","description":"Ergonomic mouse","price":49.99,"category":"Accessories","stock":200}'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ORDERS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Create Order" "POST" "http://localhost:8080/api/orders" \
  '{"user_id":1,"items":[{"product_id":1,"quantity":1,"price":1299.99},{"product_id":2,"quantity":2,"price":49.99}]}'
test_endpoint "Get Orders" "GET" "http://localhost:8080/api/orders"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PAYMENTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Process Payment" "POST" "http://localhost:8080/api/payments" \
  '{"order_id":1,"amount":1399.97,"user_id":1}'
test_endpoint "Get Payments" "GET" "http://localhost:8080/api/payments"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  NOTIFICATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Send Notification" "POST" "http://localhost:8080/api/notifications" \
  '{"type":"order_confirmation","to":"demo@example.com","subject":"Order Confirmed!","data":{"orderId":1,"total":1399.97}}'

echo "╔════════════════════════════════════════════╗"
echo "║          TEST SUITE COMPLETE               ║"
echo "╚════════════════════════════════════════════╝"
