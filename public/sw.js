const CACHE_NAME = 'forge-v3';

// Precache individually so one failed URL (e.g. offline) does not abort the whole service worker on Android.
const urlsToCache = [
  '/',
  '/icon-192.png',
  '/icon-512.png',
  '/app-icon.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        urlsToCache.map((url) =>
          cache.add(url).catch(() => {
            /* non-fatal — installability still satisfied if SW activates */
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
