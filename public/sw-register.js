// Custom service worker registration with aggressive update strategy for iOS
// This fixes the issue where installed PWAs on some iOS devices show service worker errors

(function() {
  'use strict';

  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const iOS_VERSION = (() => {
    const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    return match ? parseInt(match[1], 10) : 0;
  })();

  console.log('[SW Register] iOS:', isIOS, 'Version:', iOS_VERSION);

  if ('serviceWorker' in navigator) {
    // ✅ FIX: Skip service worker in development to prevent hot reload errors
    const isDevelopment = window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1';

    // Check if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
                      || window.navigator.standalone
                      || document.referrer.includes('android-app://');

    console.log('[SW Register] Running as installed PWA:', isStandalone);
    console.log('[SW Register] Development mode:', isDevelopment);

    // ✅ FIX: In development non-PWA mode, skip aggressive updates to prevent errors
    if (isDevelopment && !isStandalone) {
      console.log('[SW Register] Skipping aggressive SW updates in development mode');
    }

    // Force update service worker on every page load for iOS PWAs
    // This is aggressive but necessary to fix stuck service workers
    const updateInterval = isIOS && isStandalone ? 0 : 60000; // 0 = immediate for iOS PWA

    window.addEventListener('load', async () => {
      try {
        // Register or update service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none', // Always check for updates
        });

        console.log('[SW Register] Service worker registered:', registration.scope);

        // AGGRESSIVE UPDATE STRATEGY FOR iOS
        if (isIOS && !isDevelopment) {
          // Force update check immediately (skip in dev to prevent errors)
          registration.update().catch(err => {
            console.warn('[SW Register] Update check failed:', err.message);
          });

          // Set up aggressive update checking for iOS
          setInterval(() => {
            console.log('[SW Register] Checking for iOS service worker updates...');
            registration.update().catch(err => {
              console.warn('[SW Register] Update check failed:', err.message);
            });
          }, updateInterval || 60000);

          // Handle update found
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('[SW Register] New service worker found, updating...');

            newWorker.addEventListener('statechange', () => {
              console.log('[SW Register] Service worker state:', newWorker.state);

              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is ready, force reload to activate
                console.log('[SW Register] New service worker installed, reloading...');

                // Show a user-friendly update notification
                showUpdateNotification(() => {
                  window.location.reload();
                });
              }
            });
          });

          // Handle controller change (new SW activated)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[SW Register] Service worker controller changed');
            if (isStandalone) {
              // In standalone mode, reload to use new service worker
              console.log('[SW Register] Reloading to use new service worker...');
              window.location.reload();
            }
          });

          // Clear old caches if iOS version < 14 (known issues)
          if (iOS_VERSION < 14) {
            console.log('[SW Register] iOS < 14 detected, clearing old caches...');
            clearOldCaches();
          }
        } else {
          // Standard update check for non-iOS (less aggressive)
          registration.update();
          setInterval(() => registration.update(), 3600000); // Check every hour
        }

        // Handle offline/online events
        window.addEventListener('online', () => {
          console.log('[SW Register] Back online, checking for updates...');
          registration.update();
        });

      } catch (error) {
        // ✅ FIX: Suppress InvalidStateError in development during hot reloads
        if (isDevelopment && error.name === 'InvalidStateError') {
          console.log('[SW Register] InvalidStateError during development - this is expected during hot reloads');
          return;
        }

        console.error('[SW Register] Service worker registration failed:', error);

        // If registration fails on iOS (not in development), try to recover
        if (isIOS && isStandalone && !isDevelopment) {
          console.log('[SW Register] Attempting to recover from failed registration...');
          await recoverFromFailedRegistration();
        }
      }
    });
  }

  // Clear old caches from previous versions
  async function clearOldCaches() {
    try {
      const cacheNames = await caches.keys();
      console.log('[SW Register] Current caches:', cacheNames);

      // ✅ UPDATED: Delete caches that don't match v4
      const oldCaches = cacheNames.filter(
        name => !name.includes('school-ms-v4') && name.startsWith('school-ms')
      );

      if (oldCaches.length > 0) {
        console.log('[SW Register] Deleting old caches:', oldCaches);
        await Promise.all(oldCaches.map(name => caches.delete(name)));
        console.log('[SW Register] Old caches deleted successfully');
      }
    } catch (error) {
      console.error('[SW Register] Error clearing old caches:', error);
    }
  }

  // Recover from failed service worker registration
  async function recoverFromFailedRegistration() {
    try {
      // Unregister all service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));

      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));

      console.log('[SW Register] Recovery complete, reloading...');

      // Reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('[SW Register] Recovery failed:', error);
    }
  }

  // Show update notification to user
  function showUpdateNotification(onUpdate) {
    // Check if we already showed notification recently
    const lastShown = localStorage.getItem('sw-update-notification');
    const now = Date.now();

    if (lastShown && (now - parseInt(lastShown)) < 300000) {
      // Don't show notification if shown in last 5 minutes
      onUpdate();
      return;
    }

    localStorage.setItem('sw-update-notification', now.toString());

    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #4F46E5;
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      max-width: 90%;
      text-align: center;
      animation: slideDown 0.3s ease-out;
    `;

    notification.innerHTML = `
      <div style="margin-bottom: 8px;">📱 កំណែថ្មីអាចប្រើបានហើយ</div>
      <div style="font-size: 12px; opacity: 0.9;">New version available</div>
      <button onclick="this.parentElement.remove(); (${onUpdate.toString()})();"
              style="
                margin-top: 12px;
                background: white;
                color: #4F46E5;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
              ">
        ធ្វើបច្ចុប្បន្នភាព (Update Now)
      </button>
    `;

    document.body.appendChild(notification);

    // Auto-update after 10 seconds if user doesn't click
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
        onUpdate();
      }
    }, 10000);
  }

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
  `;
  document.head.appendChild(style);

})();
