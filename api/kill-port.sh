#!/bin/bash

# Kill process on port 5001
PORT=5001

echo "🔍 Checking for processes on port $PORT..."

PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
  echo "✅ No process found on port $PORT"
  exit 0
fi

echo "⚠️  Found process $PID using port $PORT"
echo "🔪 Killing process..."

kill -9 $PID

if [ $? -eq 0 ]; then
  echo "✅ Successfully killed process on port $PORT"
else
  echo "❌ Failed to kill process"
  exit 1
fi
