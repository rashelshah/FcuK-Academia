const FIREBASE_VERSION = '12.12.0';
const CACHE_VERSION = 'fcuk-academia-v6';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const OFFLINE_CACHE = `${CACHE_VERSION}-offline`;
const OFFLINE_URL = '/offline.html';
const APP_ICON = '/icons/new-android-icon-192.png';
const APP_BADGE = '/icons/new-android-icon-192.png';
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.json',
  '/favicon.ico',
  '/icons/new-android-icon-192.png',
  '/icons/new-android-icon-512.png',
  '/new-maskable-icon-512.png',
];

const configUrl = new URL(self.location.href);
const firebaseConfig = {
  apiKey: configUrl.searchParams.get('apiKey') || '',
  authDomain: configUrl.searchParams.get('authDomain') || '',
  projectId: configUrl.searchParams.get('projectId') || '',
  messagingSenderId: configUrl.searchParams.get('messagingSenderId') || '',
  appId: configUrl.searchParams.get('appId') || '',
};
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey
  && firebaseConfig.projectId
  && firebaseConfig.messagingSenderId
  && firebaseConfig.appId,
);

function normalizeUrlCandidate(value) {
  if (!value || typeof value !== 'string') return '/';

  try {
    const url = new URL(value, self.location.origin);
    if (url.origin !== self.location.origin) {
      return '/';
    }
    return url.toString();
  } catch {
    return '/';
  }
}

function readPayloadData(payload) {
  const data = payload && typeof payload === 'object' ? payload.data || {} : {};
  const notification = payload && typeof payload === 'object' ? payload.notification || {} : {};
  const url = normalizeUrlCandidate(
    data.url
      || data.deepLink
      || notification.click_action
      || payload?.fcmOptions?.link
      || '/',
  );

  return {
    title: data.title || notification.title || 'FcuK Academia',
    body: data.body || data.message || notification.body || 'New academic chaos just dropped.',
    icon: data.icon || notification.icon || APP_ICON,
    badge: data.badge || notification.badge || APP_BADGE,
    image: data.image || notification.image,
    tag: data.tag || `fcuk-${data.type || 'broadcast'}-${data.id || Date.now()}`,
    type: data.type || 'broadcast',
    sound: data.sound || 'default',
    url,
  };
}

function buildNotificationOptions(payload) {
  const parsed = readPayloadData(payload);

  return {
    title: parsed.title,
    options: {
      body: parsed.body,
      icon: parsed.icon,
      badge: parsed.badge,
      image: parsed.image,
      tag: parsed.tag,
      requireInteraction: false,
      renotify: true,
      data: {
        url: parsed.url,
        deepLink: parsed.url,
        sound: parsed.sound,
        type: parsed.type,
      },
      vibrate: parsed.type === 'bad' ? [120, 60, 120] : [80],
    },
  };
}

function showNotificationFromPayload(payload) {
  const { title, options } = buildNotificationOptions(payload);
  return self.registration.showNotification(title, options);
}

async function focusOrOpenClient(targetUrl) {
  const resolvedUrl = normalizeUrlCandidate(targetUrl);
  const clientList = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });

  const exactClient = clientList.find((client) => client.url === resolvedUrl);
  if (exactClient) {
    if ('focus' in exactClient) {
      await exactClient.focus();
    }
    if ('navigate' in exactClient) {
      await exactClient.navigate(resolvedUrl);
    }
    return;
  }

  const sameOriginClient = clientList.find((client) => new URL(client.url).origin === self.location.origin);
  if (sameOriginClient) {
    if ('focus' in sameOriginClient) {
      await sameOriginClient.focus();
    }
    if ('navigate' in sameOriginClient) {
      await sameOriginClient.navigate(resolvedUrl);
    }
    return;
  }

  if (self.clients.openWindow) {
    await self.clients.openWindow(resolvedUrl);
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(OFFLINE_CACHE);
    await cache.addAll(PRECACHE_URLS);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => ![STATIC_CACHE, OFFLINE_CACHE].includes(name))
        .map((name) => caches.delete(name)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.searchParams.has('_rsc')) return;

  const nextHeaders = ['RSC', 'Next-Router-State-Tree', 'Next-Router-Prefetch', 'Next-Url'];
  for (const header of nextHeaders) {
    if (request.headers.get(header)) return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(OFFLINE_CACHE);
        return (await cache.match(OFFLINE_URL)) || Response.error();
      }),
    );
    return;
  }

  const isFont = /\.(woff2?|ttf|otf)$/i.test(url.pathname);
  const isImage = request.destination === 'image';

  if (!isFont && !isImage) return;

  event.respondWith((async () => {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);

    const networkFetch = fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => cachedResponse);

    return cachedResponse || networkFetch;
  })());
});

if (isFirebaseConfigured) {
  importScripts(
    `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,
    `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging-compat.js`,
  );

  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const hasBrowserManagedNotification = Boolean(
      payload?.notification?.title || payload?.notification?.body,
    );

    if (hasBrowserManagedNotification) {
      return Promise.resolve();
    }

    return showNotificationFromPayload(payload);
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const fcmMessage = notificationData.FCM_MSG || {};
  const targetUrl = normalizeUrlCandidate(
    notificationData.url
      || notificationData.deepLink
      || fcmMessage?.fcmOptions?.link
      || fcmMessage?.data?.url
      || fcmMessage?.data?.deepLink
      || '/',
  );

  event.waitUntil(focusOrOpenClient(targetUrl));
});

self.addEventListener('push', (event) => {
  if (isFirebaseConfigured) {
    return;
  }

  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      notification: {
        title: 'FcuK Academia',
        body: event.data.text() || '',
      },
    };
  }

  event.waitUntil(showNotificationFromPayload(payload));
});
