const CACHE_VERSION = 'fcuk-academia-v5';
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

self.addEventListener('install', (event) => {
  // Take control immediately — don't wait for old SW to die
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      // Precache offline page
      const cache = await caches.open(OFFLINE_CACHE);
      await cache.addAll(PRECACHE_URLS);

      // NUKE all old caches from previous versions immediately on install
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== OFFLINE_CACHE)
          .map((name) => caches.delete(name)),
      );
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up any remaining old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => ![STATIC_CACHE, OFFLINE_CACHE].includes(name))
          .map((name) => caches.delete(name)),
      );
      // Take control of all clients immediately
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only intercept GET requests from our origin
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // NEVER cache: API calls, Next.js data/RSC requests
  if (url.pathname.startsWith('/api/')) return;
  if (url.searchParams.has('_rsc')) return;

  // Check for ANY Next.js internal header — these carry page data, never cache them
  const nextHeaders = ['RSC', 'Next-Router-State-Tree', 'Next-Router-Prefetch', 'Next-Url'];
  for (const header of nextHeaders) {
    if (request.headers.get(header)) return;
  }

  // Page navigations: always go to network, fall back to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(OFFLINE_CACHE);
        return (await cache.match(OFFLINE_URL)) || Response.error();
      }),
    );
    return;
  }

  // Only cache truly static assets: fonts and images
  const isFont = /\.(woff2?|ttf|otf)$/i.test(url.pathname);
  const isImage = request.destination === 'image';

  if (!isFont && !isImage) return;

  // Stale-while-revalidate for static assets
  event.respondWith(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cachedResponse = await cache.match(request);

      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })(),
  );
});
