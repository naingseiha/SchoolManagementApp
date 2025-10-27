#!/bin/bash
API="http://localhost:5001"

echo "🧪 Testing School Management API..."

# Register
echo -e "\n1️⃣ Register Admin:"
REGISTER=$(curl -s -X POST $API/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"Admin123!","firstName":"Admin","lastName":"User","role":"ADMIN"}')
echo $REGISTER | jq

# Login
echo -e "\n2️⃣ Login:"
LOGIN=$(curl -s -X POST $API/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"Admin123!"}')
echo $LOGIN | jq

TOKEN=$(echo $LOGIN | jq -r '.token')
echo "Token: $TOKEN"

# Get Me
echo -e "\n3️⃣ Get Current User:"
curl -s $API/api/auth/me -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n✅ Tests Complete!"
