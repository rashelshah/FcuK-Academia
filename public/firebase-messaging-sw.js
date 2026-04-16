/**
 * Firebase Cloud Messaging Service Worker
 *
 * SCOPE: '/' — must control all pages so push events are received regardless
 * of which route the user is on. Do NOT narrow the scope.
 *
 * Firebase config is passed as URL query params when the SW is registered
 * (see getToken.ts → createMessagingServiceWorkerUrl).
 * Fallback: reads from self.FIREBASE_CONFIG injected by the app if available.
 */

const FIREBASE_VERSION = '12.12.0';

// ─── Config ─────────────────────────────────────────────────────────────────
// Primary: query params passed at registration time (survives across SW updates).
// These are set on self.location.href when the SW is first registered.
const configUrl = new URL(self.location.href);

const firebaseConfig = {
  apiKey: configUrl.searchParams.get('apiKey') || '',
  authDomain: configUrl.searchParams.get('authDomain') || '',
  projectId: configUrl.searchParams.get('projectId') || '',
  messagingSenderId: configUrl.searchParams.get('messagingSenderId') || '',
  appId: configUrl.searchParams.get('appId') || '',
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// ─── Notification helper ─────────────────────────────────────────────────────
function buildNotificationOptions(payload) {
  const data = payload?.data || {};
  const notification = payload?.notification || {};

  const title = data.title || notification.title || 'FcuK Academia';
  const body = data.message || notification.body || 'new academic chaos just dropped';
  const type = data.type || 'broadcast';
  const deepLink = data.deepLink || '/';

  return {
    title,
    options: {
      body,
      icon: '/icons/android-icon-192.png',
      badge: '/icons/android-icon-192.png',
      // Use a stable tag scoped to this app to avoid clearing unrelated OS notifications.
      tag: `fcuk-${type}-${data.id || Date.now()}`,
      // renotify: true ensures the notification fires even if same tag is active.
      renotify: true,
      data: {
        deepLink,
        sound: data.sound || 'default',
        type,
      },
      // Android: vibration pattern is respected by Chrome on Android.
      vibrate: type === 'bad' ? [120, 60, 120] : [80],
      // requireInteraction keeps the notification visible until tapped (Android only).
      requireInteraction: false,
    },
  };
}

function showNotificationFromPayload(payload) {
  const { title, options } = buildNotificationOptions(payload);
  return self.registration.showNotification(title, options);
}

// ─── SW lifecycle ────────────────────────────────────────────────────────────
// Take control immediately so push events are handled without a page reload.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ─── Firebase init ────────────────────────────────────────────────────────────
if (isConfigured) {
  importScripts(
    `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,
  );
  importScripts(
    `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging-compat.js`,
  );

  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  /**
   * Background message handler.
   *
   * Called when the app is:
   * - Closed
   * - Backgrounded (not in focus)
   *
   * FCM automatically suppresses the default notification and calls this handler
   * when the SW intercepts a push event. We call showNotification() ourselves
   * to give full control over the notification appearance.
   *
   * NOTE: Do NOT close all notifications here — that clears unrelated OS
   * notifications. Use a stable, app-scoped tag instead (handled in buildNotificationOptions).
   */
  messaging.onBackgroundMessage((payload) => {
    console.log('[FCM SW] Background message received:', payload);
    return showNotificationFromPayload(payload);
  });
}

// ─── Notification click handler ───────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const deepLink = new URL(
    event.notification.data?.deepLink || '/',
    self.location.origin,
  ).toString();

  event.waitUntil(
    (async () => {
      // Try to focus an existing window first.
      const clientList = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of clientList) {
        // Found an open window → focus it and navigate.
        if ('focus' in client) {
          await client.focus();
          client.postMessage({
            type: 'notification:click',
            deepLink,
          });
          if ('navigate' in client && deepLink) {
            await client.navigate(deepLink);
          }
          return;
        }
      }

      // No open window → open a new one.
      if (clients.openWindow) {
        await clients.openWindow(deepLink);
      }
    })(),
  );
});

// ─── Push event fallback ───────────────────────────────────────────────────────
// Handles raw push events in case Firebase compat SDK doesn't intercept them
// (e.g., when Firebase is misconfigured or payload format differs).
self.addEventListener('push', (event) => {
  // Firebase compat SDK should handle this via onBackgroundMessage.
  // This is a safety net for malformed or non-FCM pushes.
  if (!isConfigured) {
    let payload = {};
    try {
      payload = event.data?.json() || {};
    } catch {
      payload = { notification: { title: 'FcuK Academia', body: event.data?.text() || '' } };
    }

    event.waitUntil(showNotificationFromPayload(payload));
  }
});
