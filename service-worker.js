// Service Worker — Mon Budget PWA
// Stratégie : cache-first pour app shell, network-first pour CDN avec fallback cache.

const CACHE_VERSION = 'mon-budget-v1';
const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png'
];

// Domaines CDN qu'on accepte de cacher dynamiquement
const CDN_PATTERNS = [
  /^https:\/\/esm\.sh\//,
  /^https:\/\/cdn\.tailwindcss\.com\//,
  /^https:\/\/fonts\.googleapis\.com\//,
  /^https:\/\/fonts\.gstatic\.com\//
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isCDN = CDN_PATTERNS.some(p => p.test(req.url));
  const isSameOrigin = url.origin === self.location.origin;

  if (isSameOrigin || isCDN) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((response) => {
          // Cacher la nouvelle réponse si valide
          if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(req, clone));
          }
          return response;
        }).catch(() => cached); // si offline et pas de cache → undefined
        return cached || fetchPromise;
      })
    );
  }
});

// Permettre au site de demander une mise à jour immédiate
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
