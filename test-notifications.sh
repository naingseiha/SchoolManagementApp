#!/bin/bash

# Real-time Notifications System - Quick Test Script
# This script helps verify that the notification system is working

echo "🔔 Real-time Notifications System - Test Script"
echo "=============================================="
echo ""

# Check if backend is running
echo "1️⃣  Checking backend status..."
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running on port 5001"
else
    echo "   ❌ Backend is NOT running. Start it with: cd api && npm run dev"
    exit 1
fi

# Check if frontend is running
echo ""
echo "2️⃣  Checking frontend status..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend is running on port 3000"
else
    echo "   ❌ Frontend is NOT running. Start it with: npm run dev"
    exit 1
fi

# Check Socket.IO dependencies
echo ""
echo "3️⃣  Checking Socket.IO installation..."
if [ -d "api/node_modules/socket.io" ]; then
    echo "   ✅ socket.io installed in backend"
else
    echo "   ⚠️  socket.io not found. Install with: cd api && npm install"
fi

if [ -d "node_modules/socket.io-client" ]; then
    echo "   ✅ socket.io-client installed in frontend"
else
    echo "   ⚠️  socket.io-client not found. Install with: npm install"
fi

# Check notification sound file
echo ""
echo "4️⃣  Checking notification assets..."
if [ -f "public/sounds/notification.mp3" ]; then
    echo "   ✅ Notification sound file exists"
else
    echo "   ⚠️  Notification sound file missing (optional)"
    echo "      Add a sound file to: public/sounds/notification.mp3"
fi

# Instructions
echo ""
echo "=============================================="
echo "✅ System Check Complete!"
echo ""
echo "📝 To test real-time notifications:"
echo ""
echo "1. Open two browser windows:"
echo "   - Window 1: http://localhost:3000 (User A)"
echo "   - Window 2: http://localhost:3000 (User B - Incognito)"
echo ""
echo "2. Login as different users in each window"
echo ""
echo "3. User A creates a post"
echo ""
echo "4. User B likes or comments on the post"
echo ""
echo "5. User A should see instant notification:"
echo "   - Bell icon shakes"
echo "   - Toast appears in top-right"
echo "   - Unread count increases"
echo "   - Sound plays (if available)"
echo ""
echo "6. Check browser console for Socket.IO logs:"
echo "   - '✅ Socket connected: {id}'"
echo "   - '📬 New notification received via Socket.IO'"
echo ""
echo "=============================================="
echo ""
echo "📖 Full documentation:"
echo "   docs/profile-feed/NOTIFICATIONS_REAL_TIME_COMPLETE.md"
echo ""
