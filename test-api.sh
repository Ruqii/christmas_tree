#!/bin/bash

echo "🧪 Testing API Endpoints..."
echo ""

# Test 1: Simple test endpoint
echo "1. Testing /api/test (GET):"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" http://localhost:3000/api/test)
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed  '$d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ API test endpoint is working!"
    echo "   Response: $BODY" | head -c 100
    echo "..."
else
    echo "❌ API test endpoint failed (HTTP $HTTP_STATUS)"
    echo "   This might mean the API is returning source code instead of executing"
fi
echo ""

# Test 2: sendCard endpoint (should reject GET)
echo "2. Testing /api/sendCard (GET - should return 405):"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/sendCard)
if [ "$HTTP_STATUS" = "405" ]; then
    echo "✅ API correctly rejects GET requests (Method Not Allowed)"
elif [ "$HTTP_STATUS" = "404" ]; then
    echo "❌ API not found (404)"
    echo "   Make sure you're running: npm run dev:full"
else
    echo "⚠️  Unexpected status: $HTTP_STATUS"
fi
echo ""

# Test 3: sendCard endpoint (POST with test data)
echo "3. Testing /api/sendCard (POST with test data):"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/sendCard \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "test@example.com",
    "senderName": "Test User",
    "message": "This is a test message"
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ API POST request successful!"
    echo "   Response: $RESPONSE" | jq '.' 2>/dev/null || echo "   $RESPONSE"
elif echo "$RESPONSE" | grep -q '"error"'; then
    echo "⚠️  API returned an error (might be email sending issue):"
    echo "   $RESPONSE" | jq '.' 2>/dev/null || echo "   $RESPONSE"
else
    echo "❌ API POST failed or returned unexpected response:"
    echo "   $RESPONSE" | head -c 200
fi
echo ""

echo "📝 Summary:"
echo "   If all tests pass, your API is working correctly!"
echo "   If tests fail, check:"
echo "   - Is 'npm run dev:full' running?"
echo "   - Is RESEND_API_KEY set in .env.local?"
echo "   - Check the terminal running 'npm run dev:full' for errors"
