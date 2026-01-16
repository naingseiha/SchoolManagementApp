#!/bin/bash

# Test Teacher Password Change Flow
# This script verifies that teachers can change their password and login with the new password

API_URL="http://localhost:5001/api"
EMAIL="admin@school.edu.kh"
OLD_PASSWORD="admin123"
NEW_PASSWORD="newPassword123"

echo "🧪 Testing Teacher Password Change Flow..."
echo "=========================================="
echo ""

# Step 1: Login with original password
echo "📝 Step 1: Login with original password..."
LOGIN_RESPONSE=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${EMAIL}\", \"password\": \"${OLD_PASSWORD}\"}")

SUCCESS=$(echo $LOGIN_RESPONSE | jq -r ".success")
if [ "$SUCCESS" != "true" ]; then
  echo "❌ FAILED: Could not login with original password"
  echo "$LOGIN_RESPONSE" | jq "."
  exit 1
fi

TOKEN=$(echo $LOGIN_RESPONSE | jq -r ".data.token")
echo "✅ PASSED: Login successful with original password"
echo ""

# Step 2: Try to change password with WRONG old password
echo "📝 Step 2: Try to change password with WRONG old password (should fail)..."
WRONG_CHANGE=$(curl -s -X POST ${API_URL}/teacher-portal/change-password \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"oldPassword\": \"wrongPassword\", \"newPassword\": \"${NEW_PASSWORD}\"}")

SUCCESS=$(echo $WRONG_CHANGE | jq -r ".success")
if [ "$SUCCESS" == "true" ]; then
  echo "❌ FAILED: Password change should have failed with wrong old password"
  echo "$WRONG_CHANGE" | jq "."
  exit 1
fi

echo "✅ PASSED: Password change correctly rejected with wrong old password"
echo "   Message: $(echo $WRONG_CHANGE | jq -r '.message')"
echo ""

# Step 3: Change password with CORRECT old password
echo "📝 Step 3: Change password with correct old password..."
CHANGE_RESPONSE=$(curl -s -X POST ${API_URL}/teacher-portal/change-password \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"oldPassword\": \"${OLD_PASSWORD}\", \"newPassword\": \"${NEW_PASSWORD}\"}")

SUCCESS=$(echo $CHANGE_RESPONSE | jq -r ".success")
if [ "$SUCCESS" != "true" ]; then
  echo "❌ FAILED: Could not change password"
  echo "$CHANGE_RESPONSE" | jq "."
  exit 1
fi

echo "✅ PASSED: Password changed successfully"
echo "   Message: $(echo $CHANGE_RESPONSE | jq -r '.message')"
echo ""

# Step 4: Try to login with OLD password (should fail)
echo "📝 Step 4: Try to login with OLD password (should fail)..."
OLD_LOGIN=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${EMAIL}\", \"password\": \"${OLD_PASSWORD}\"}")

SUCCESS=$(echo $OLD_LOGIN | jq -r ".success")
if [ "$SUCCESS" == "true" ]; then
  echo "❌ FAILED: Should not be able to login with old password"
  echo "$OLD_LOGIN" | jq "."
  exit 1
fi

echo "✅ PASSED: Login correctly rejected with old password"
echo "   Message: $(echo $OLD_LOGIN | jq -r '.message')"
echo ""

# Step 5: Login with NEW password (should succeed)
echo "📝 Step 5: Login with NEW password..."
NEW_LOGIN=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${EMAIL}\", \"password\": \"${NEW_PASSWORD}\"}")

SUCCESS=$(echo $NEW_LOGIN | jq -r ".success")
if [ "$SUCCESS" != "true" ]; then
  echo "❌ FAILED: Could not login with new password"
  echo "$NEW_LOGIN" | jq "."
  exit 1
fi

NEW_TOKEN=$(echo $NEW_LOGIN | jq -r ".data.token")
echo "✅ PASSED: Login successful with new password"
echo ""

# Step 6: Verify profile access with new token
echo "📝 Step 6: Verify profile access with new token..."
PROFILE=$(curl -s ${API_URL}/teacher-portal/profile \
  -H "Authorization: Bearer ${NEW_TOKEN}")

SUCCESS=$(echo $PROFILE | jq -r ".success")
if [ "$SUCCESS" != "true" ]; then
  echo "❌ FAILED: Could not access profile with new token"
  echo "$PROFILE" | jq "."
  exit 1
fi

echo "✅ PASSED: Profile access successful with new token"
echo "   Email: $(echo $PROFILE | jq -r '.data.email')"
echo "   Role: $(echo $PROFILE | jq -r '.data.role')"
echo ""

# Step 7: Change password BACK to original (cleanup)
echo "📝 Step 7: Change password back to original (cleanup)..."
RESTORE=$(curl -s -X POST ${API_URL}/teacher-portal/change-password \
  -H "Authorization: Bearer ${NEW_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"oldPassword\": \"${NEW_PASSWORD}\", \"newPassword\": \"${OLD_PASSWORD}\"}")

SUCCESS=$(echo $RESTORE | jq -r ".success")
if [ "$SUCCESS" != "true" ]; then
  echo "⚠️  WARNING: Could not restore original password"
  echo "$RESTORE" | jq "."
  exit 1
fi

echo "✅ PASSED: Password restored to original"
echo ""

# Step 8: Final verification - login with original password
echo "📝 Step 8: Final verification - login with original password..."
FINAL_LOGIN=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${EMAIL}\", \"password\": \"${OLD_PASSWORD}\"}")

SUCCESS=$(echo $FINAL_LOGIN | jq -r ".success")
if [ "$SUCCESS" != "true" ]; then
  echo "❌ FAILED: Could not login with original password after restore"
  echo "$FINAL_LOGIN" | jq "."
  exit 1
fi

echo "✅ PASSED: Login successful with original password after restore"
echo ""

echo "=========================================="
echo "🎉 ALL TESTS PASSED!"
echo "=========================================="
echo ""
echo "Summary:"
echo "✅ Login with original password works"
echo "✅ Wrong old password is rejected"
echo "✅ Password change with correct old password works"
echo "✅ Old password is rejected after change"
echo "✅ New password works for login"
echo "✅ Profile access works with new token"
echo "✅ Password can be changed back"
echo "✅ Original password works after restore"
echo ""
echo "🔐 Conclusion: Teacher password change flow works PERFECTLY!"
echo "   Teachers can change from phone number password to a new password"
echo "   and login successfully with the new password."
