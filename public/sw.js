const CACHE_VERSION = 'fcuk-academia-v4';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const OFFLINE_CACHE = `${CACHE_VERSION}-offline`;
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.json',
  '/favicon.ico',
  '/icons/android-icon-192.png',
  '/icons/android-icon-512.png',
  '/maskable-icon-512x512.png',
  '/icons/ios%20new%20logo.jpeg',
];

// Only truly static, versioned assets should be cached
const STATIC_EXTENSIONS = ['.woff', '.woff2', '.ttf', '.otf'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('fcuk-academia-') && ![STATIC_CACHE, OFFLINE_CACHE].includes(cacheName))
          .map((cacheName) => caches.delete(cacheName)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests from our own origin
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // NEVER cache API calls
  if (url.pathname.startsWith('/api/')) return;

  // NEVER cache Next.js internal RSC/data requests (these carry dynamic page data)
  if (
    url.searchParams.has('_rsc') ||
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-State-Tree') ||
    request.headers.get('Next-Router-Prefetch') ||
    request.headers.get('Next-Url')
  ) return;

  // For page navigations: network-first, fall back to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(OFFLINE_CACHE);
        return (await cache.match(OFFLINE_URL)) || Response.error();
      }),
    );
    return;
  }

  // For fonts (truly static): cache-first
  const isFont = STATIC_EXTENSIONS.some(ext => url.pathname.endsWith(ext));
  if (isFont) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })(),
    );
    return;
  }

  // For images and other static assets: stale-while-revalidate
  const cacheableDestinations = new Set(['image', 'manifest']);
  if (!cacheableDestinations.has(request.destination)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cachedResponse = await cache.match(request);

      const networkResponsePromise = fetch(request)
        .then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkResponsePromise;
    })(),
  );
});
