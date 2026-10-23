/**
 * DairyOS Enterprise PWA Offline Service Worker
 * Ensures zero-data-loss collection queuing in rural dead zones
 */

const APP_ROOT = new URL('./', self.registration.scope);
const CACHE_NAME = `dairyos-cache-v3-${APP_ROOT.pathname}`;
const PREVIOUS_SCOPED_CACHE = `dairyos-cache-v2-${APP_ROOT.pathname}`;
const LEGACY_ROOT_CACHE = 'dairyos-cache-v1';
const PRECACHE_ASSETS = ['index.html', 'manifest.json', 'icon.svg'].map((asset) => new URL(asset, APP_ROOT).href);

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache === PREVIOUS_SCOPED_CACHE || (APP_ROOT.pathname === '/' && cache === LEGACY_ROOT_CACHE)) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First with Cache Fallback for offline resilience
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  // Let API calls pass through or be handled by frontend indexedDB/localStorage queue
  const requestedUrl = new URL(event.request.url);
  if (requestedUrl.origin !== APP_ROOT.origin
    || !requestedUrl.pathname.startsWith(APP_ROOT.pathname)
    || requestedUrl.pathname.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match(new URL('index.html', APP_ROOT).href);
          }
        });
      })
  );
});
