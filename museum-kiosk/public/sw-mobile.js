// Museum Mobile PWA Service Worker
// Premium caching strategy for museum mobile app

const CACHE_NAME = 'museum-mobile-v1.0';
const MOBILE_CACHE = 'museum-mobile-assets-v1.0';
const IMAGES_CACHE = 'museum-images-v1.0';
const API_CACHE = 'museum-api-v1.0';

// Critical mobile resources to cache immediately
const MOBILE_ASSETS = [
  '/mobile',
  '/mobile/',
  '/mobile/exhibits',
  '/mobile/favorites', 
  '/mobile/map',
  '/mobile/scan',
  '/manifest.json',
  '/icons/icon-192.svg',
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first for dynamic content
  networkFirst: ['/mobile/exhibit/', '/mobile/event/', '/api/'],
  // Cache first for static assets
  cacheFirst: ['/assets/', '/icons/', '/_astro/'],
  // Stale while revalidate for images
  staleWhileRevalidate: ['/images/', '.jpg', '.png', '.webp', '.svg']
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('🏛️ Museum Mobile SW: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(MOBILE_CACHE).then(cache => {
        console.log('📱 Caching mobile assets');
        return cache.addAll(MOBILE_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('🏛️ Museum Mobile SW: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Take control of all pages immediately
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('museum-') && !isCurrentCache(name))
            .map(name => {
              console.log('🗑️ Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
    ])
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome extensions
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Route to appropriate cache strategy
  event.respondWith(handleFetch(request, url));
});

// Main fetch handler
async function handleFetch(request, url) {
  const pathname = url.pathname;
  
  try {
    // Network first for dynamic content
    if (matchesPattern(pathname, CACHE_STRATEGIES.networkFirst)) {
      return await networkFirst(request, API_CACHE);
    }
    
    // Cache first for static assets
    if (matchesPattern(pathname, CACHE_STRATEGIES.cacheFirst)) {
      return await cacheFirst(request, MOBILE_CACHE);
    }
    
    // Stale while revalidate for images
    if (matchesPattern(pathname, CACHE_STRATEGIES.staleWhileRevalidate)) {
      return await staleWhileRevalidate(request, IMAGES_CACHE);
    }
    
    // Default: Network with cache fallback
    return await networkWithFallback(request, MOBILE_CACHE);
    
  } catch (error) {
    console.error('🚨 SW Fetch Error:', error);
    return await fallbackResponse(request);
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || fallbackResponse(request);
  }
}

// Cache first strategy  
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    return fallbackResponse(request);
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Return cached version immediately if available
  const fetchPromise = fetch(request).then(response => {
    cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

// Network with cache fallback
async function networkWithFallback(request, cacheName) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || fallbackResponse(request);
  }
}

// Fallback responses for offline scenarios
async function fallbackResponse(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Offline page for navigation requests
  if (request.destination === 'document') {
    const cached = await caches.match('/mobile');
    if (cached) return cached;
    
    // Create minimal offline response
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Museum Offline</title>
          <style>
            body { 
              font-family: system-ui; 
              text-align: center; 
              padding: 2rem; 
              background: linear-gradient(135deg, #1a1a2e, #16213e);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
            }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
            .title { font-size: 2rem; margin-bottom: 1rem; }
            .message { opacity: 0.8; line-height: 1.5; max-width: 400px; }
          </style>
        </head>
        <body>
          <div class="icon">🏛️</div>
          <div class="title">Museum Offline</div>
          <div class="message">
            Sie sind offline. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.
          </div>
        </body>
      </html>
    `, { 
      headers: { 'Content-Type': 'text/html' },
      status: 200 
    });
  }
  
  // Placeholder for missing images
  if (request.destination === 'image') {
    return new Response(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#f0f0f0"/>
        <text x="200" y="150" text-anchor="middle" font-family="system-ui" font-size="16" fill="#666">
          📷 Bild nicht verfügbar
        </text>
      </svg>
    `, {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
  
  return new Response('Ressource nicht verfügbar', { 
    status: 404,
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Helper functions
function matchesPattern(pathname, patterns) {
  return patterns.some(pattern => {
    if (pattern.startsWith('.')) {
      return pathname.includes(pattern);
    }
    return pathname.includes(pattern);
  });
}

function isCurrentCache(cacheName) {
  return [CACHE_NAME, MOBILE_CACHE, IMAGES_CACHE, API_CACHE].includes(cacheName);
}

// Background sync for favorites (when network is restored)
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

// Sync favorites with server when online
async function syncFavorites() {
  try {
    // This would sync local favorites with server
    console.log('💖 Syncing favorites...');
  } catch (error) {
    console.error('Failed to sync favorites:', error);
  }
}

// Push notification handling (for future museum updates)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification('Museum Update', {
        body: data.message || 'Neue Inhalte im Museum verfügbar!',
        icon: '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
        tag: 'museum-update',
        requireInteraction: false,
        actions: [
          {
            action: 'view',
            title: 'Ansehen',
            icon: '/icons/icon-192.svg'
          }
        ]
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow('/mobile')
    );
  }
});

console.log('🏛️ Museum Mobile Service Worker loaded successfully');