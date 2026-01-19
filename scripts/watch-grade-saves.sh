#!/bin/bash

# Real-time Grade Save Monitor
# Run this in a separate terminal while testing

CLASS_ID="cmiq7zwfy000hq0jaf7ml4u89"  # ថ្នាក់ទី8ឃ
MONTH="មករា"
YEAR=2024

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👀 REAL-TIME GRADE SAVE MONITOR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Monitoring: ថ្នាក់ទី8ឃ - $MONTH $YEAR"
echo "Press Ctrl+C to stop"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get token
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@school.edu.kh", "password": "admin123"}' | jq -r ".data.token")

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Authentication failed"
  exit 1
fi

# Get subject ID
SUBJECT_ID=$(curl -s "http://localhost:5001/api/grades/grid/${CLASS_ID}?month=${MONTH}&year=${YEAR}" \
  -H "Authorization: Bearer ${TOKEN}" | jq -r '.data.subjects[0].id')

PREV_COUNT=0

while true; do
  # Get current count
  CURRENT=$(curl -s "http://localhost:5001/api/grades/grid/${CLASS_ID}?month=${MONTH}&year=${YEAR}" \
    -H "Authorization: Bearer ${TOKEN}" | \
    jq "[.data.students[].grades[\"$SUBJECT_ID\"] | select(.score != null)] | length")

  TIMESTAMP=$(date "+%H:%M:%S")

  # Check if count changed
  if [ "$CURRENT" != "$PREV_COUNT" ]; then
    DIFF=$((CURRENT - PREV_COUNT))
    if [ $DIFF -gt 0 ]; then
      echo "[$TIMESTAMP] 💾 +$DIFF new grades saved → Total: $CURRENT"
    else
      echo "[$TIMESTAMP] 📊 Grade count: $CURRENT"
    fi
    PREV_COUNT=$CURRENT
  else
    # Show heartbeat every 5 seconds
    if [ $(($(date +%s) % 5)) -eq 0 ]; then
      echo -ne "[$TIMESTAMP] ⏳ Watching... (Current: $CURRENT grades)\r"
    fi
  fi

  sleep 0.5
done
