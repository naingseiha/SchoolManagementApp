#!/usr/bin/env node

/**
 * iOS Service Worker Patcher
 *
 * This script patches the generated service worker to fix iOS PWA compatibility issues.
 *
 * Problem: The default next-pwa fallback returns Response.error() which causes
 * "Response served by service worker is an error" on some iOS devices in PWA mode.
 *
 * Solution: Inject a custom fallback function that NEVER returns Response.error()
 * and always returns valid Response objects.
 */

const fs = require('fs');
const path = require('path');

const SW_PATH = path.join(__dirname, '../public/sw.js');
const CUSTOM_FALLBACK_PATH = path.join(__dirname, '../worker/index.js');

console.log('🔧 Patching service worker for iOS compatibility...');

try {
  // Read the generated service worker
  let swContent = fs.readFileSync(SW_PATH, 'utf8');

  // Read the custom fallback
  const customFallback = fs.readFileSync(CUSTOM_FALLBACK_PATH, 'utf8');

  // Check if already patched
  if (swContent.includes('// iOS-COMPATIBLE-FALLBACK-PATCHED')) {
    console.log('✅ Service worker already patched. Skipping...');
    process.exit(0);
  }

  // Find the position right after importScripts
  const importScriptsMatch = swContent.match(/importScripts\([^)]+\);/);

  if (!importScriptsMatch) {
    console.error('❌ Could not find importScripts in service worker');
    process.exit(1);
  }

  const insertPosition = importScriptsMatch.index + importScriptsMatch[0].length;

  // Create the patch content
  const patchContent = `

// ============================================================================
// iOS-COMPATIBLE-FALLBACK-PATCHED
// Custom fallback injected by scripts/patch-sw.js
// This ensures iOS Safari PWA never receives Response.error()
// ============================================================================

${customFallback}

// ============================================================================
// End of iOS-compatible fallback patch
// ============================================================================

`;

  // Insert the patch
  swContent =
    swContent.slice(0, insertPosition) +
    patchContent +
    swContent.slice(insertPosition);

  // Write the patched service worker
  fs.writeFileSync(SW_PATH, swContent, 'utf8');

  console.log('✅ Service worker successfully patched!');
  console.log('📱 iOS devices will now receive proper error responses instead of Response.error()');

} catch (error) {
  console.error('❌ Error patching service worker:', error.message);
  process.exit(1);
}
