#!/bin/bash

# Test the monthly summaries API
# You'll need to replace TOKEN with a real student token

echo "Testing Monthly Summaries API..."
echo ""
echo "Instructions:"
echo "1. Login as a student in the app"
echo "2. Open browser DevTools > Network tab"
echo "3. Find a request with Authorization header"
echo "4. Copy the token and run: TOKEN='your-token' ./test-monthly-api.sh"
echo ""

if [ -z "$TOKEN" ]; then
  echo "❌ No TOKEN provided"
  echo "Usage: TOKEN='your-token' ./test-monthly-api.sh"
  exit 1
fi

curl -s -X GET "http://localhost:5000/api/student-portal/monthly-summaries?year=2025" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
