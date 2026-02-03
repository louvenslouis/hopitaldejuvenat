const CACHE_NAME = 'hopital-juvenat-cache-v2';
const BASE_URL = self.location.pathname.replace(/service-worker\.js$/, '');
const urlsToCache = [
  BASE_URL,
  `${BASE_URL}index.html`,
  `${BASE_URL}manifest.json`,
  `${BASE_URL}icons/icon-192x192.png`,
  `${BASE_URL}icons/icon-512x512.png`,
  `${BASE_URL}icons/logo.png`,
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // App shell for navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(`${BASE_URL}index.html`))
    );
    return;
  }

  // Cache-first for same-origin static assets
  if (request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
            return response;
          })
          .catch(() => caches.match(`${BASE_URL}index.html`));
      })
    );
  }
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
