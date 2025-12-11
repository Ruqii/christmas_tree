#!/bin/bash

echo "🔍 Verifying API Setup..."
echo ""

echo "1. Checking API directory structure:"
ls -la api/ 2>/dev/null || echo "❌ API directory not found!"
echo ""

echo "2. Checking if Vercel CLI is installed:"
if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI is installed"
    vercel --version
else
    echo "❌ Vercel CLI not found globally"
    echo "   Checking local install..."
    if [ -f "node_modules/.bin/vercel" ]; then
        echo "✅ Vercel CLI found in node_modules"
        ./node_modules/.bin/vercel --version
    else
        echo "❌ Vercel CLI not installed"
    fi
fi
echo ""

echo "3. Checking vercel.json:"
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json exists"
    cat vercel.json
else
    echo "❌ vercel.json not found"
fi
echo ""

echo "4. Checking .env.local:"
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
    if grep -q "RESEND_API_KEY" .env.local; then
        echo "✅ RESEND_API_KEY is set"
    else
        echo "⚠️  RESEND_API_KEY not found in .env.local"
    fi
else
    echo "❌ .env.local not found"
fi
echo ""

echo "5. API files:"
for file in api/*.ts; do
    if [ -f "$file" ]; then
        echo "✅ Found: $file"
    fi
done
echo ""

echo "6. Checking for running processes on port 3000:"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is already in use:"
    lsof -Pi :3000 -sTCP:LISTEN
else
    echo "✅ Port 3000 is available"
fi
echo ""

echo "7. Testing API endpoint (if server is running):"
echo "   Trying http://localhost:3000/api/test ..."
curl -s http://localhost:3000/api/test 2>/dev/null && echo "" || echo "❌ Cannot reach API (server might not be running)"
echo ""

echo "📋 To start the server with API support, run:"
echo "   npm run dev:full"
echo ""
echo "   Or manually:"
echo "   npx vercel dev"
