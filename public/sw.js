// Minimal service worker: makes the app installable and usable offline for
// everything except the try-on itself (which needs the network no matter what).
const CACHE = 'stylemyseason-v1';
const APP_SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never intercept mutations or the try-on API — they must always hit the network.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) return;

  // Page navigations: network first, fall back to the cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/').then((res) => res || Response.error()))
    );
    return;
  }

  // Static assets (JS/CSS/images/icons): stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.ok) caches.open(CACHE).then((cache) => cache.put(request, res.clone()));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
