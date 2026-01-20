#!/usr/bin/env node

// Script to clear service worker cache and force reload

console.log('🧹 Clearing Service Worker Cache...\n');

const instructions = `
Please follow these steps to clear the service worker cache:

For Development (localhost):
1. Open Chrome DevTools (F12)
2. Go to "Application" tab
3. Click "Service Workers" in the left sidebar
4. Click "Unregister" on all service workers
5. Click "Clear site data" button at the top
6. Close and reopen your browser
7. Run: npm run dev

For PWA/Mobile:
1. Open the app
2. Go to browser settings (three dots)
3. Select "Site settings" or "App info"
4. Click "Clear data" or "Clear cache"
5. Uninstall the PWA if installed
6. Close browser completely
7. Reopen and reinstall PWA

For Testing:
1. Open Chrome DevTools (F12)
2. Go to "Application" tab
3. Check "Update on reload" under Service Workers
4. Refresh the page (Ctrl+R or Cmd+R)

This will force the browser to fetch the new service worker and files.
`;

console.log(instructions);
console.log('\n✅ After clearing cache, rebuild the app:');
console.log('   npm run build\n');
