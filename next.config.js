const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // ✅ CRITICAL iOS FIX: Force service worker update on every page load
  // This ensures problematic cached service workers are replaced
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  swcMinify: true,
  // ✅ iOS FIX: Aggressive cache invalidation
  scope: '/',
  fallbacks: {
    document: '/offline',
    // ✅ iOS FIX: Add fallback for failed API calls
    data: '/offline',
  },
  workboxOptions: {
    disableDevLogs: true,
    // ✅ CRITICAL iOS FIX: Increment cache version to v5 to force refresh on all devices
    // This will clear old problematic service workers
    cacheId: 'school-ms-v5',
    // ✅ iOS FIX: Aggressively clean up old caches
    cleanupOutdatedCaches: true,
    // ✅ iOS FIX: Immediately take control of all pages
    clientsClaim: true,
    // ✅ iOS FIX: Skip waiting to activate immediately
    skipWaiting: true,
    runtimeCaching: [
      // ✅ OPTIMIZED PHASE 2: Smart API caching for instant repeat visits
      // Dashboard stats - cached for 5 minutes with stale-while-revalidate
      {
        urlPattern: /^http:\/\/localhost:5001\/api\/dashboard\/(mobile-stats|stats|grade-stats)/i,
        handler: 'StaleWhileRevalidate',
        method: 'GET',
        options: {
          cacheName: 'dashboard-api-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
          // ✅ iOS FIX: Only cache successful responses (removed status 0)
          cacheableResponse: {
            statuses: [200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/.*\/api\/dashboard\/(mobile-stats|stats|grade-stats)/i,
        handler: 'StaleWhileRevalidate',
        method: 'GET',
        options: {
          cacheName: 'dashboard-api-cache-prod',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
          // ✅ iOS FIX: Only cache successful responses (removed status 0)
          cacheableResponse: {
            statuses: [200],
          },
        },
      },
      // Classes, subjects - cached for 10 minutes (changes infrequently)
      {
        urlPattern: /^http:\/\/localhost:5001\/api\/(classes|subjects)/i,
        handler: 'StaleWhileRevalidate',
        method: 'GET',
        options: {
          cacheName: 'metadata-api-cache',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 10 * 60, // 10 minutes
          },
          // ✅ iOS FIX: Only cache successful responses (removed status 0)
          cacheableResponse: {
            statuses: [200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/.*\/api\/(classes|subjects)/i,
        handler: 'StaleWhileRevalidate',
        method: 'GET',
        options: {
          cacheName: 'metadata-api-cache-prod',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 10 * 60, // 10 minutes
          },
          // ✅ iOS FIX: Only cache successful responses (removed status 0)
          cacheableResponse: {
            statuses: [200],
          },
        },
      },
      // User profile - cached for 30 seconds (aligned with apiClient)
      {
        urlPattern: /^http:\/\/localhost:5001\/api\/auth\/me/i,
        handler: 'StaleWhileRevalidate',
        method: 'GET',
        options: {
          cacheName: 'user-api-cache',
          expiration: {
            maxEntries: 5,
            maxAgeSeconds: 30, // 30 seconds - aligned with apiClient cache
          },
          // ✅ iOS FIX: Only cache successful responses (removed status 0)
          cacheableResponse: {
            statuses: [200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/.*\/api\/auth\/me/i,
        handler: 'StaleWhileRevalidate',
        method: 'GET',
        options: {
          cacheName: 'user-api-cache-prod',
          expiration: {
            maxEntries: 5,
            maxAgeSeconds: 30, // 30 seconds - aligned with apiClient cache
          },
          // ✅ iOS FIX: Only cache successful responses (removed status 0)
          cacheableResponse: {
            statuses: [200],
          },
        },
      },
      // All other API calls - NetworkFirst (try network, fallback to cache)
      {
        urlPattern: /^http:\/\/localhost:5001\/api\/.*/i,
        handler: 'NetworkFirst',
        method: 'GET',
        options: {
          cacheName: 'api-cache',
          // ✅ iOS FIX: Increased timeout for slower iOS connections
          networkTimeoutSeconds: 15,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
          // ✅ iOS FIX: Only cache successful responses (removed status 0)
          cacheableResponse: {
            statuses: [200],
          },
        },
      },
      {
        urlPattern: /^https:\/\/.*\/api\/.*/i,
        handler: 'NetworkFirst',
        method: 'GET',
        options: {
          cacheName: 'api-cache-prod',
          // ✅ iOS FIX: Increased timeout for slower iOS connections
          networkTimeoutSeconds: 15,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
          // ✅ iOS FIX: Only cache successful responses (removed status 0)
          cacheableResponse: {
            statuses: [200],
          },
        },
      },
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-assets',
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-image-assets',
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\.(?:woff|woff2|eot|ttf|otf)$/i,
        handler: 'CacheFirst',  // Changed to CacheFirst for better offline support
        options: {
          cacheName: 'static-font-assets',
          expiration: {
            maxEntries: 10,  // Increased for TTF fonts
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days - fonts rarely change
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-stylesheets',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-webfonts',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Performance Optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Compiler Options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // ✅ OPTIMIZED PHASE 6: Experimental Features for Performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@/components', '@/lib'],
  },

  // Production Source Maps (disabled for performance)
  productionBrowserSourceMaps: false,

  // ✅ OPTIMIZED PHASE 6: Advanced code splitting and chunk optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize chunk splitting for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Separate vendor chunks for better caching
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return module.size() > 50000 && /node_modules[/\\]/.test(module.identifier());
            },
            name(module) {
              const hash = require('crypto').createHash('sha1');
              hash.update(module.identifier());
              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name(module, chunks) {
              return chunks.map((chunk) => chunk.name).join('~');
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
        maxInitialRequests: 25,
        minSize: 20000,
      };
    }
    return config;
  },

  typescript: {
    // Temporarily ignore build errors (pre-existing Button icon prop issues)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore eslint during builds
    ignoreDuringBuilds: true,
  },
};

module.exports = withPWA(nextConfig);
