/**
 * Service Worker for RuleGuard PWA
 * Provides offline support, caching, and push notification handling
 */

const CACHE_NAME = 'ruleguard-v1';
const STATIC_CACHE_NAME = 'ruleguard-static-v1';
const DYNAMIC_CACHE_NAME = 'ruleguard-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/logo-trade-game.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // Add more static assets as needed
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) =>
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME
            )
            .map((cacheName) => {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    handleRequest(request)
  );
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    return handleApiRequest(request);
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(request.url)) {
    return handleStaticAssetRequest(request);
  }

  // Handle page requests with network-first strategy
  return handlePageRequest(request);
}

async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // If successful, cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', error);

    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If no cache and offline, return offline response
    if (!navigator.onLine) {
      return createOfflineResponse(request);
    }

    throw error;
  }
}

async function handleStaticAssetRequest(request) {
  // Cache-first strategy for static assets
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Fallback to network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Failed to fetch static asset', error);
    throw error;
  }
}

async function handlePageRequest(request) {
  try {
    // Network-first for pages
    const networkResponse = await fetch(request);

    // If successful, cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', error);

    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to offline page
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/');
      if (offlinePage) {
        return offlinePage;
      }
    }

    throw error;
  }
}

function isStaticAsset(url) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => url.includes(ext));
}

function createOfflineResponse(request) {
  if (request.headers.get('Accept')?.includes('application/json')) {
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'You are currently offline. Please check your connection.',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  return new Response(
    `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Offline - RuleGuard</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background: #f3f4f6;
          color: #374151;
          text-align: center;
        }
        .offline-container {
          max-width: 400px;
          padding: 2rem;
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        .offline-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .offline-message {
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        .retry-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          cursor: pointer;
        }
        .retry-button:hover {
          background: #2563eb;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📱</div>
        <h1 class="offline-title">You're Offline</h1>
        <p class="offline-message">
          It looks like you're not connected to the internet. Please check your connection and try again.
        </p>
        <button class="retry-button" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>
    `,
    {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'text/html'
      }
    }
  );
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || 'ruleguard-notification',
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
      data: data.data || {}
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);

  event.notification.close();

  if (event.action) {
    // Handle action buttons
    console.log('Notification action clicked:', event.action);
  } else {
    // Handle main notification click
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event);

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      performBackgroundSync()
    );
  }
});

async function performBackgroundSync() {
  try {
    // Sync any pending data
    console.log('Service Worker: Performing background sync');

    // Send sync status to clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETED',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: '1.0.0'
    });
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker: Global error', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection', event.reason);
  event.preventDefault();
});
