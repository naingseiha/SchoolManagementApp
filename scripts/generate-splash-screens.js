const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// iOS splash screen sizes
const splashScreens = [
  // iPhone
  { name: 'apple-splash-640-1136', width: 640, height: 1136 }, // iPhone SE, 5s
  { name: 'apple-splash-750-1334', width: 750, height: 1334 }, // iPhone 8, 7, 6s
  { name: 'apple-splash-828-1792', width: 828, height: 1792 }, // iPhone 11, XR
  { name: 'apple-splash-1080-2340', width: 1080, height: 2340 }, // iPhone 12 mini, 13 mini
  { name: 'apple-splash-1125-2436', width: 1125, height: 2436 }, // iPhone X, XS, 11 Pro
  { name: 'apple-splash-1170-2532', width: 1170, height: 2532 }, // iPhone 12, 13, 14
  { name: 'apple-splash-1179-2556', width: 1179, height: 2556 }, // iPhone 14 Pro
  { name: 'apple-splash-1242-2208', width: 1242, height: 2208 }, // iPhone 8 Plus, 7 Plus
  { name: 'apple-splash-1242-2688', width: 1242, height: 2688 }, // iPhone XS Max, 11 Pro Max
  { name: 'apple-splash-1284-2778', width: 1284, height: 2778 }, // iPhone 12 Pro Max, 13 Pro Max
  { name: 'apple-splash-1290-2796', width: 1290, height: 2796 }, // iPhone 14 Pro Max

  // iPad
  { name: 'apple-splash-1536-2048', width: 1536, height: 2048 }, // iPad Mini, Air
  { name: 'apple-splash-1620-2160', width: 1620, height: 2160 }, // iPad 10.2"
  { name: 'apple-splash-1668-2224', width: 1668, height: 2224 }, // iPad Pro 10.5"
  { name: 'apple-splash-1668-2388', width: 1668, height: 2388 }, // iPad Pro 11"
  { name: 'apple-splash-2048-2732', width: 2048, height: 2732 }, // iPad Pro 12.9"

  // Landscape versions
  { name: 'apple-splash-2048-1536', width: 2048, height: 1536 }, // iPad landscape
  { name: 'apple-splash-2160-1620', width: 2160, height: 1620 }, // iPad 10.2" landscape
  { name: 'apple-splash-2224-1668', width: 2224, height: 1668 }, // iPad Pro 10.5" landscape
  { name: 'apple-splash-2388-1668', width: 2388, height: 1668 }, // iPad Pro 11" landscape
  { name: 'apple-splash-2732-2048', width: 2732, height: 2048 }, // iPad Pro 12.9" landscape
];

async function generateSplashScreens() {
  const publicDir = path.join(__dirname, '..', 'public');
  const splashDir = path.join(publicDir, 'splash');
  const iconPath = path.join(publicDir, 'icons', 'icon-512x512.png');

  // Create splash directory if it doesn't exist
  if (!fs.existsSync(splashDir)) {
    fs.mkdirSync(splashDir, { recursive: true });
    console.log('✓ Created /public/splash directory');
  }

  // Check if source icon exists
  if (!fs.existsSync(iconPath)) {
    console.error('❌ Source icon not found at:', iconPath);
    process.exit(1);
  }

  console.log('🎨 Generating iOS splash screens...\n');

  // Theme color for background
  const backgroundColor = '#6366f1'; // Indigo-500 from your theme

  for (const screen of splashScreens) {
    const outputPath = path.join(splashDir, `${screen.name}.png`);

    try {
      // Calculate icon size (30% of screen height)
      const iconSize = Math.floor(screen.height * 0.3);

      // Create background
      const background = await sharp({
        create: {
          width: screen.width,
          height: screen.height,
          channels: 4,
          background: backgroundColor
        }
      }).png().toBuffer();

      // Resize icon
      const resizedIcon = await sharp(iconPath)
        .resize(iconSize, iconSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer();

      // Composite icon on background (centered)
      await sharp(background)
        .composite([{
          input: resizedIcon,
          gravity: 'center'
        }])
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${screen.name}.png (${screen.width}×${screen.height})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${screen.name}.png:`, error.message);
    }
  }

  console.log('\n✨ All splash screens generated successfully!');
  console.log(`📁 Location: ${splashDir}`);
}

// Run the script
generateSplashScreens().catch(error => {
  console.error('❌ Error generating splash screens:', error);
  process.exit(1);
});
