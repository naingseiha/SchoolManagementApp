#!/bin/bash

# Download Khmer Google Fonts for local use
# This ensures fonts work on mobile devices even without internet

echo "📥 Downloading Khmer fonts from Google Fonts..."

FONTS_DIR="public/fonts/khmer"
mkdir -p "$FONTS_DIR"

# Download Battambang (Regular, Bold)
echo "Downloading Battambang..."
curl -L "https://fonts.gstatic.com/s/battambang/v24/uk-mEGe7raEw-HjkzZabDnWj4yxx7o8.woff2" -o "$FONTS_DIR/Battambang-Regular.woff2"
curl -L "https://fonts.gstatic.com/s/battambang/v24/uk-kEGe7raEw-HjkzZabNsmMxyRa7o9a.woff2" -o "$FONTS_DIR/Battambang-Bold.woff2"

# Download Moul (Regular)
echo "Downloading Moul..."
curl -L "https://fonts.gstatic.com/s/moul/v25/nuF2D__FSo_3E-RYiJCy-00.woff2" -o "$FONTS_DIR/Moul-Regular.woff2"

# Download Bokor (Regular)
echo "Downloading Bokor..."
curl -L "https://fonts.gstatic.com/s/bokor/v30/m8JcjfpeeaqTiR2WdInbcaxE.woff2" -o "$FONTS_DIR/Bokor-Regular.woff2"

# Download Koulen (Regular)
echo "Downloading Koulen..."
curl -L "https://fonts.gstatic.com/s/koulen/v25/AMOHz5iUuHLEMNXyoHk45Ns.woff2" -o "$FONTS_DIR/Koulen-Regular.woff2"

echo "✅ Font download complete!"
echo "Fonts saved to: $FONTS_DIR"
echo ""
echo "Next steps:"
echo "1. Update globals.css to use local fonts"
echo "2. Test on mobile device"
