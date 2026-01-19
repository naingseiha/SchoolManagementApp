// Custom Service Worker for iOS Compatibility
// This file ensures the service worker NEVER returns Response.error() which causes issues on iOS Safari PWA

// ✅ CRITICAL iOS FIX: Define fallback function that returns valid responses
// This overrides the default next-pwa fallback which returns Response.error()
self.fallback = async (request) => {
  const destination = request.destination;
  const url = new URL(request.url);

  console.log('[SW Fallback] Request failed:', url.pathname, 'Destination:', destination);

  try {
    // Try to get from cache first
    const cachedResponse = await caches.match(request, {
      ignoreSearch: true,
      ignoreVary: true,
    });

    if (cachedResponse) {
      console.log('[SW Fallback] Found in cache:', url.pathname);
      return cachedResponse;
    }
  } catch (error) {
    console.log('[SW Fallback] Cache match error:', error.message);
  }

  // Handle different request types with proper responses

  // 1. Navigation requests (HTML pages) - Return offline page
  if (destination === 'document' || request.mode === 'navigate') {
    try {
      const offlinePage = await caches.match('/offline', { ignoreSearch: true });
      if (offlinePage) {
        console.log('[SW Fallback] Returning offline page');
        return offlinePage;
      }
    } catch (error) {
      console.log('[SW Fallback] Offline page not cached:', error.message);
    }

    // Return inline offline HTML if cached offline page not available
    console.log('[SW Fallback] Returning inline offline HTML');
    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#6366f1">
        <title>Offline - School MS</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 20px;
          }
          .container {
            max-width: 500px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }
          .icon {
            font-size: 64px;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          h1 {
            font-size: 2em;
            margin-bottom: 16px;
            font-weight: 600;
          }
          p {
            font-size: 1.1em;
            opacity: 0.95;
            margin-bottom: 24px;
            line-height: 1.6;
          }
          button {
            background: white;
            color: #6366f1;
            border: none;
            padding: 14px 32px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 12px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          button:active {
            transform: translateY(2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📡</div>
          <h1>You're Offline</h1>
          <p>មិនមានការភ្ជាប់អ៊ីនធឺណិត<br>Please check your internet connection</p>
          <button onclick="window.location.reload()">ព្យាយាមម្តងទៀត (Retry)</button>
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

  // 2. API requests - Return JSON error
  if (url.pathname.startsWith('/api/')) {
    console.log('[SW Fallback] Returning API error JSON');
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Network request failed. Please check your internet connection.',
        message: 'មិនមានការភ្ជាប់អ៊ីនធឺណិត',
        offline: true,
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'application/json; charset=UTF-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }),
      }
    );
  }

  // 3. Image requests - Return placeholder
  if (destination === 'image' || /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(url.pathname)) {
    console.log('[SW Fallback] Returning image placeholder');
    // Return a small 1x1 transparent PNG
    const transparentPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    return new Response(
      Uint8Array.from(atob(transparentPng), c => c.charCodeAt(0)),
      {
        status: 200,
        statusText: 'OK',
        headers: new Headers({
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }),
      }
    );
  }

  // 4. Font requests - Return empty response (fonts will fallback to system fonts)
  if (destination === 'font' || /\.(woff|woff2|ttf|otf|eot)$/i.test(url.pathname)) {
    console.log('[SW Fallback] Font not available, returning empty response');
    return new Response(null, {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }

  // 5. Style/Script requests - Return empty response
  if (destination === 'style' || destination === 'script' || /\.(css|js)$/i.test(url.pathname)) {
    console.log('[SW Fallback] Returning empty style/script');
    return new Response('', {
      status: 200,
      statusText: 'OK',
      headers: new Headers({
        'Content-Type': destination === 'style' || url.pathname.endsWith('.css')
          ? 'text/css'
          : 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }),
    });
  }

  // 6. Next.js data requests - Return offline indicator
  if (url.pathname.match(/\/_next\/data\/.+\/.+\.json$/i)) {
    console.log('[SW Fallback] Returning Next.js data fallback');
    try {
      const offlinePage = await caches.match('/offline', { ignoreSearch: true });
      if (offlinePage) {
        return offlinePage;
      }
    } catch (error) {
      console.log('[SW Fallback] Offline page not cached');
    }
  }

  // 7. Default fallback - Return empty 503 response (NEVER Response.error())
  console.log('[SW Fallback] Returning default 503 response');
  return new Response(null, {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }),
  });
};

// Detect iOS for special handling
const isIOS = () => {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

console.log('[Custom SW] iOS-compatible service worker loaded. iOS device:', isIOS());
console.log('[Custom SW] Fallback function defined - will never return Response.error()');
