#!/bin/bash

# Migration script for Social Feed Design Update
# This script updates the database schema with new post types

echo "🔄 Starting Social Feed Design Migration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Change to API directory
cd api || exit 1

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Creating database migration..."
npx prisma migrate dev --name update_post_types_education_focused

echo ""
echo "⚙️  Generating Prisma client..."
npx prisma generate

echo ""
echo "✅ Migration complete!"
echo ""
echo "📝 Next steps:"
echo "1. Test the feed page in your browser"
echo "2. Try creating posts with different types"
echo "3. Verify image uploads work correctly"
echo "4. Test on mobile devices (PWA mode)"
echo ""
echo "📱 To test:"
echo "   npm run dev"
echo "   Open: http://localhost:3000/feed"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
