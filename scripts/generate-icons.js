const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512];
const input = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Generating PWA icons...\n');

// Generate standard icons
const standardPromises = sizes.map(size => {
  return sharp(input)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
    .then(() => console.log(`✓ Generated icon-${size}x${size}.png`));
});

// Generate maskable icons (with 20% padding for safe zone)
const maskableSizes = [192, 512];
const maskablePromises = maskableSizes.map(size => {
  const paddedSize = Math.floor(size * 0.8); // 80% of original size
  const padding = Math.floor((size - paddedSize) / 2);

  return sharp(input)
    .resize(paddedSize, paddedSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 99, g: 102, b: 241, alpha: 1 } // #6366f1 theme color
    })
    .png()
    .toFile(path.join(outputDir, `icon-${size}x${size}-maskable.png`))
    .then(() => console.log(`✓ Generated icon-${size}x${size}-maskable.png (maskable)`));
});

// Generate favicon
const faviconPromise = sharp(input)
  .resize(32, 32, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  })
  .png()
  .toFile(path.join(__dirname, '../public/favicon.png'))
  .then(() => console.log('✓ Generated favicon.png'));

// Execute all promises
Promise.all([...standardPromises, ...maskablePromises, faviconPromise])
  .then(() => {
    console.log('\n✅ All icons generated successfully!');
    console.log(`📁 Icons saved to: ${outputDir}`);
  })
  .catch(err => {
    console.error('\n❌ Error generating icons:', err);
    process.exit(1);
  });
