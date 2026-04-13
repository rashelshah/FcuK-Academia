const FIREBASE_VERSION = '12.12.0';
const configUrl = new URL(self.location.href);
const firebaseConfig = {
  apiKey: configUrl.searchParams.get('apiKey') || '',
  authDomain: configUrl.searchParams.get('authDomain') || '',
  projectId: configUrl.searchParams.get('projectId') || '',
  messagingSenderId: configUrl.searchParams.get('messagingSenderId') || '',
  appId: configUrl.searchParams.get('appId') || '',
};

function showNotificationFromPayload(payload) {
  const data = payload?.data || {};
  const notification = payload?.notification || {};
  const title = data.title || notification.title || 'FcuK Academia';
  const body = data.message || notification.body || 'new academic chaos just dropped';

  return self.registration.showNotification(title, {
    body,
    icon: '/icons/android-icon-192.png',
    badge: '/icons/android-icon-192.png',
    data: {
      deepLink: data.deepLink || '/',
      sound: data.sound || 'default',
      type: data.type || 'broadcast',
    },
    tag: `${data.type || 'broadcast'}-${Date.now()}`,
  });
}

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  importScripts(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`);
  importScripts(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging-compat.js`);

  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    self.registration.getNotifications().then((notifications) => {
      notifications.forEach((notification) => notification.close());
    });

    return showNotificationFromPayload(payload);
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const deepLink = new URL(event.notification.data?.deepLink || '/', self.location.origin).toString();
  event.waitUntil((async () => {
    const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    for (const client of clientList) {
      if ('focus' in client) {
        client.postMessage({
          type: 'notification:click',
          deepLink,
        });
        await client.focus();

        if ('navigate' in client && deepLink) {
          await client.navigate(deepLink);
        }
        return;
      }
    }

    if (clients.openWindow) {
      await clients.openWindow(deepLink);
    }
  })());
});
