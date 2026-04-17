'use client';

import { getFirebaseMessagingClient, getFirebasePublicConfig, isFirebaseClientConfigured } from '@/lib/firebase';
import {
  NOTIFICATIONS_DEVICE_API,
  NOTIFICATIONS_FCM_SW_PATH,
  NOTIFICATIONS_FCM_SW_SCOPE,
} from '@/lib/notifications/constants';
import {
  clearSessionSyncedFcmToken,
  clearStoredFcmToken,
  getSessionSyncedFcmToken,
  getStoredFcmToken,
  setSessionSyncedFcmToken,
  setStoredFcmToken,
  setStoredNotificationPermission,
} from '@/lib/notifications/storage';

let messagingServiceWorkerRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;
let notificationInitializationPromise: Promise<string | null> | null = null;

function supportsPushNotifications() {
  return typeof window !== 'undefined'
    && 'Notification' in window
    && 'serviceWorker' in navigator
    && 'PushManager' in window;
}

function createMessagingServiceWorkerUrl() {
  const url = new URL(NOTIFICATIONS_FCM_SW_PATH, window.location.origin);
  const config = getFirebasePublicConfig();

  Object.entries(config).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

export async function getFirebaseMessagingServiceWorkerRegistration() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  if (!messagingServiceWorkerRegistrationPromise) {
    messagingServiceWorkerRegistrationPromise = (async () => {
      try {
        const swUrl = createMessagingServiceWorkerUrl();
        console.log('[FCM] Registering SW at:', swUrl);

        const reg = await navigator.serviceWorker.register(swUrl, {
          scope: NOTIFICATIONS_FCM_SW_SCOPE,
          updateViaCache: 'none',
        });

        // Force update in case a stale SW (without query params) is cached.
        // This is critical on Android where old SW versions can persist.
        try {
          await reg.update();
        } catch {
          // update() may fail in some environments — not fatal.
        }

        // Wait for the SW to become active before returning.
        // pushManager.subscribe() (called internally by getToken) throws if
        // there's no active SW, which causes silent token failures on Android.
        if (!reg.active) {
          await navigator.serviceWorker.ready;
        }

        console.log('[FCM] SW registered and active. State:', reg.active?.state);
        return reg;
      } catch (err) {
        console.error('[FCM] SW registration failed:', err);
        return null;
      }
    })();
  }

  return messagingServiceWorkerRegistrationPromise;
}

export async function syncNotificationToken(token: string, previousToken?: string | null) {
  const normalizedToken = token.trim();
  if (!normalizedToken) {
    return false;
  }

  const storedToken = getStoredFcmToken();
  const sessionSyncedToken = getSessionSyncedFcmToken();
  const normalizedPreviousToken = previousToken?.trim() || null;

  if (
    storedToken === normalizedToken
    && sessionSyncedToken === normalizedToken
    && (!normalizedPreviousToken || normalizedPreviousToken === normalizedToken)
  ) {
    return false;
  }

  try {
    const response = await fetch(NOTIFICATIONS_DEVICE_API, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: normalizedToken,
        previousToken: normalizedPreviousToken,
        permission: typeof Notification !== 'undefined' ? Notification.permission : 'unknown',
        platform: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        device: 'web',
      }),
    });

    if (!response.ok) {
      return false;
    }

    setStoredFcmToken(normalizedToken);
    setSessionSyncedFcmToken(normalizedToken);
    return true;
  } catch {
    // Silent fallback: local token storage still allows in-app notifications to work.
    return false;
  }
}

export async function removeNotificationToken(token?: string | null) {
  const resolvedToken = token ?? getStoredFcmToken();
  if (!resolvedToken) return;

  try {
    await fetch(NOTIFICATIONS_DEVICE_API, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: resolvedToken }),
    });
  } catch {
    // Ignore cleanup failures so disabling notifications is never blocked.
  }
}

export async function requestNotificationPermission() {
  if (!supportsPushNotifications()) {
    return 'unsupported' as const;
  }

  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    setStoredNotificationPermission(Notification.permission);
    return Notification.permission;
  }

  const permission = await Notification.requestPermission();
  setStoredNotificationPermission(permission);
  return permission;
}

export async function getNotificationToken(options?: { forceRefresh?: boolean }) {
  if (!supportsPushNotifications() || !isFirebaseClientConfigured()) return null;

  const existingToken = getStoredFcmToken();
  const sessionSyncedToken = getSessionSyncedFcmToken();
  if (!options?.forceRefresh && existingToken && sessionSyncedToken === existingToken) {
    return existingToken;
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return null;
  }

  const messaging = await getFirebaseMessagingClient();
  if (!messaging) {
    return null;
  }

  const { getToken } = await import('firebase/messaging');

  // Prefer the FCM-scoped registration; fall back to the globally-ready SW.
  // Both guarantee an *active* service worker before getToken() is called,
  // which is required by pushManager.subscribe() internally.
  let registration: ServiceWorkerRegistration | undefined;
  try {
    const swReg = await getFirebaseMessagingServiceWorkerRegistration();
    registration = swReg ?? await navigator.serviceWorker.ready;
  } catch {
    // If SW isn't available at all, getToken will attempt without a registration.
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.error('[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set — cannot generate push token.');
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.warn('[FCM] getToken() returned empty — push subscription may have failed.');
      return existingToken;
    }

    console.log('[FCM] Token obtained:', token.slice(0, 20) + '…');

    if (token !== existingToken || options?.forceRefresh || sessionSyncedToken !== token) {
      const synced = await syncNotificationToken(token, existingToken);
      if (!synced) {
        setStoredFcmToken(token);
      }
    }

    return token;
  } catch (err) {
    console.error('[FCM] getToken() threw an error:', err);
    return existingToken;
  }
}

export async function initNotifications(options?: { forceRefresh?: boolean }) {
  if (options?.forceRefresh) {
    return getNotificationToken({ forceRefresh: true });
  }

  if (!notificationInitializationPromise) {
    notificationInitializationPromise = getNotificationToken().finally(() => {
      notificationInitializationPromise = null;
    });
  }

  return notificationInitializationPromise;
}

export async function clearNotificationToken() {
  const storedToken = getStoredFcmToken();

  try {
    const messaging = await getFirebaseMessagingClient();
    const registration = await getFirebaseMessagingServiceWorkerRegistration();

    if (messaging) {
      const { deleteToken } = await import('firebase/messaging');
      await deleteToken(messaging);
    }

    if (registration) {
      await registration.unregister();
    }
  } catch {
    // Ignore errors and continue with local cleanup.
  } finally {
    await removeNotificationToken(storedToken);
    clearStoredFcmToken();
    clearSessionSyncedFcmToken();
    messagingServiceWorkerRegistrationPromise = null;
    notificationInitializationPromise = null;
  }
}
