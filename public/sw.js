// MiVino Service Worker
// Enables PWA install and basic offline caching

var CACHE_NAME = 'mivino-v1';
var OFFLINE_URL = '/offline.html';

// Files to cache on install
var PRECACHE_URLS = [
  '/',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
];

// Install: cache core assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: network-first strategy for API calls, cache-first for static assets
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API routes and auth routes — always go to network
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up')) {
    return;
  }

  // For everything else: try network first, fall back to cache
  event.respondWith(
    fetch(event.request).then(function(response) {
      // Cache successful responses for next time
      if (response.status === 200) {
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(function() {
      // Network failed — try cache
      return caches.match(event.request).then(function(cachedResponse) {
        return cachedResponse || new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
