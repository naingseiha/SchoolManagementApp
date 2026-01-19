#!/bin/bash

# Grade Entry Testing Script
# This script verifies that all grade entries are saved to the database

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 GRADE ENTRY SAVE VERIFICATION TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get authentication token
echo "🔐 Authenticating..."
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@school.edu.kh", "password": "admin123"}' | jq -r ".data.token")

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Authentication failed"
  exit 1
fi
echo "✅ Authenticated successfully"
echo ""

# Get test class info
CLASS_ID="cmiq7zwfy000hq0jaf7ml4u89"  # ថ្នាក់ទី8ឃ with 62 students
MONTH="មករា"
YEAR=2024

echo "📊 Test Configuration:"
echo "   Class: ថ្នាក់ទី8ឃ (62 students)"
echo "   Month: $MONTH"
echo "   Year: $YEAR"
echo ""

# Get all subjects for this class
echo "📚 Fetching subjects..."
SUBJECTS=$(curl -s "http://localhost:5001/api/grades/grid/${CLASS_ID}?month=${MONTH}&year=${YEAR}" \
  -H "Authorization: Bearer ${TOKEN}" | jq -r '.data.subjects[0].id')

if [ -z "$SUBJECTS" ]; then
  echo "❌ No subjects found"
  exit 1
fi

SUBJECT_ID=$SUBJECTS
echo "✅ Using subject ID: $SUBJECT_ID"
echo ""

# Function to count saved grades
check_saved_grades() {
  local count=$(curl -s "http://localhost:5001/api/grades/grid/${CLASS_ID}?month=${MONTH}&year=${YEAR}" \
    -H "Authorization: Bearer ${TOKEN}" | \
    jq "[.data.students[].grades[\"$SUBJECT_ID\"] | select(.score != null)] | length")
  echo "$count"
}

# Initial count
echo "🔍 Checking current saved grades..."
INITIAL_COUNT=$(check_saved_grades)
echo "   Initial grades in database: $INITIAL_COUNT"
echo ""

# Instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 TESTING INSTRUCTIONS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open your browser to: http://localhost:3000"
echo "2. Login with: admin@school.edu.kh / admin123"
echo "3. Navigate to: Grade Entry page"
echo "4. Select: ថ្នាក់ទី8ឃ (Grade 8ឃ)"
echo "5. Select: Month មករា, Year 2024-2025"
echo "6. Click 'Load Data'"
echo ""
echo "🏃 RAPID ENTRY TEST:"
echo "   - Enter scores for 20-40 students as FAST as possible"
echo "   - Type random scores (0-100) without pausing"
echo "   - Watch for spinning loaders and checkmarks"
echo "   - Open browser console (F12) to see logs"
echo ""
echo "Expected console logs:"
echo "   💾 Auto-saving X changes (SILENT)"
echo "   ⏳ Save in progress, queuing X changes (if typing fast)"
echo "   ✅ Auto-save completed SILENTLY"
echo "   🔄 Processing queued changes: X"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "When you're done entering grades, press ENTER to verify..."
read -p ""

# Verification
echo ""
echo "🔍 Verifying database saves..."
echo ""

# Wait a moment for any pending saves
echo "⏳ Waiting 3 seconds for pending saves..."
sleep 3

# Check final count
FINAL_COUNT=$(check_saved_grades)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESULTS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   Initial grades: $INITIAL_COUNT"
echo "   Final grades:   $FINAL_COUNT"
echo "   New entries:    $((FINAL_COUNT - INITIAL_COUNT))"
echo ""

if [ $FINAL_COUNT -gt $INITIAL_COUNT ]; then
  echo "✅ SUCCESS: Grades were saved to database!"
  echo ""

  # Get detailed breakdown
  echo "📋 Detailed Breakdown:"
  curl -s "http://localhost:5001/api/grades/grid/${CLASS_ID}?month=${MONTH}&year=${YEAR}" \
    -H "Authorization: Bearer ${TOKEN}" | \
    jq -r ".data.students[] | select(.grades[\"$SUBJECT_ID\"].score != null) | \"   ✓ \(.studentName): \(.grades[\"$SUBJECT_ID\"].score) points\""
else
  echo "⚠️  No new grades detected"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Offer to refresh and check again
echo "Press ENTER to check database again (or Ctrl+C to exit)..."
read -p ""

RECHECK_COUNT=$(check_saved_grades)
echo ""
echo "🔄 Recheck count: $RECHECK_COUNT"
if [ $RECHECK_COUNT -eq $FINAL_COUNT ]; then
  echo "✅ Count matches! All grades persisted correctly."
else
  echo "⚠️  Count changed from $FINAL_COUNT to $RECHECK_COUNT"
fi
echo ""
