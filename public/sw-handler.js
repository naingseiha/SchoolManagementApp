// Custom service worker error handler for iOS compatibility
// This file provides better error handling for iOS Safari service worker issues

// Detect iOS
function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Enhanced fallback handler for iOS
self.enhancedFallback = async (event) => {
  const request = event.request;
  const url = new URL(request.url);

  try {
    // Try to fetch from network first
    const networkResponse = await fetch(request.clone(), {
      // Add timeout for iOS
      signal: AbortSignal.timeout(15000),
    });

    // Only cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Network fetch failed, trying cache:', error.message);
  }

  // Try cache if network fails
  try {
    const cachedResponse = await caches.match(request, {
      ignoreSearch: true,
      ignoreVary: true,
    });

    if (cachedResponse) {
      return cachedResponse;
    }
  } catch (error) {
    console.log('[SW] Cache match failed:', error.message);
  }

  // For navigation requests (HTML pages), redirect to offline page
  if (request.mode === 'navigate' || request.destination === 'document') {
    try {
      const offlineResponse = await caches.match('/offline', {
        ignoreSearch: true,
      });

      if (offlineResponse) {
        return offlineResponse;
      }
    } catch (error) {
      console.log('[SW] Offline page cache match failed:', error.message);
    }

    // Last resort: Return a basic HTML response instead of Response.error()
    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 20px;
          }
          .container {
            max-width: 500px;
          }
          h1 {
            font-size: 2em;
            margin-bottom: 1em;
          }
          button {
            background: white;
            color: #667eea;
            border: none;
            padding: 12px 24px;
            font-size: 16px;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🌐 You're Offline</h1>
          <p>Please check your internet connection and try again.</p>
          <button onclick="window.location.reload()">Retry</button>
        </div>
      </body>
      </html>`,
      {
        status: 200,
        statusText: 'OK',
        headers: new Headers({
          'Content-Type': 'text/html; charset=UTF-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }),
      }
    );
  }

  // For API requests, return a JSON error instead of Response.error()
  if (url.pathname.startsWith('/api/')) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Network request failed. Please check your internet connection.',
        offline: true,
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }),
      }
    );
  }

  // For other requests, return empty response instead of error
  return new Response(null, {
    status: 503,
    statusText: 'Service Unavailable',
  });
};

// iOS-specific cache cleanup on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clear old caches for iOS devices
      if (isIOS()) {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(
          (name) => name.startsWith('school-ms-') && !name.includes('-v5')
        );

        await Promise.all(
          oldCaches.map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );

        console.log('[SW] iOS cache cleanup completed');
      }

      // Claim clients immediately
      await self.clients.claim();
    })()
  );
});

console.log('[SW] Enhanced iOS error handler loaded');
