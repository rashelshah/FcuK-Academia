'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { MessagePayload } from 'firebase/messaging';

import { useDashboardDataContext } from '@/context/DashboardDataContext';
import { evaluateNotificationEngine, getNextNotificationEngineDelay } from '@/lib/notificationEngine';
import {
  NOTIFICATIONS_DEFAULT_DURATION_MS,
  NOTIFICATIONS_STACK_LIMIT,
} from '@/lib/notifications/constants';
import {
  clearNotificationToken,
  initNotifications,
  requestNotificationPermission,
} from '@/lib/notifications/getToken';
import { getWebPushSupportStatus } from '@/lib/notifications/platform';
import { playNotificationSound, primeNotificationAudio } from '@/lib/notifications/sounds';
import {
  getNotificationsEnabledPreference,
  hasNotificationsEnabledPreference,
  setNotificationsEnabledPreference,
  setStoredNotificationPermission,
} from '@/lib/notifications/storage';
import type {
  NotificationPayload,
  NotificationPermissionState,
  NotificationToastItem,
  NotificationType,
} from '@/lib/notifications/types';

const NotificationStack = dynamic(() => import('@/components/notifications/NotificationStack'), {
  ssr: false,
});

interface NotificationContextValue {
  notificationsEnabled: boolean;
  permissionState: NotificationPermissionState;
  notificationQueue: NotificationToastItem[];
  triggerNotification: (type: NotificationType, payload: Omit<NotificationPayload, 'type'>) => void;
  dismissNotification: (id: string) => void;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

function resolvePermissionState(): NotificationPermissionState {
  if (typeof window === 'undefined') return 'unknown';
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

function createToastItem(payload: NotificationPayload): NotificationToastItem {
  return {
    ...payload,
    id: payload.id ?? `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    durationMs: payload.durationMs ?? NOTIFICATIONS_DEFAULT_DURATION_MS,
  };
}

function fromFcmPayload(payload: MessagePayload): NotificationPayload | null {
  const data = payload.data ?? {};
  const title = String(data.title ?? '').trim();
  const message = String(data.message ?? '').trim();

  if (!title || !message) return null;

  const nextType = ['good', 'bad', 'warning', 'class', 'broadcast', 'system'].includes(String(data.type))
    ? data.type as NotificationType
    : 'broadcast';

  return {
    id: payload.messageId ?? undefined,
    title,
    message,
    type: nextType,
    sound: (typeof data.sound === 'string' ? data.sound : nextType) as NotificationPayload['sound'],
    deepLink: typeof data.deepLink === 'string'
      ? data.deepLink
      : typeof data.url === 'string'
        ? data.url
        : '/',
    source: 'fcm',
  };
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    attendance,
    calendar,
    loading,
    markList,
    timetable,
  } = useDashboardDataContext();
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>('unknown');
  const [notificationQueue, setNotificationQueue] = useState<NotificationToastItem[]>([]);
  const engineTimerRef = useRef<number | null>(null);
  const seenForegroundMessageIdsRef = useRef<string[]>([]);

  const notificationsActive = notificationsEnabled && pathname !== '/login';

  // ── Stable refs for dashboard data ────────────────────────────────────────
  // runNotificationEngine previously listed all 4 data arrays as deps, meaning
  // it recreated on every data load → cascade of useEffect re-runs → repeated
  // refreshPushToken() calls. Using refs breaks that chain.
  const attendanceRef = useRef(attendance);
  const calendarRef = useRef(calendar);
  const markListRef = useRef(markList);
  const timetableRef = useRef(timetable);
  const loadingRef = useRef(loading);

  attendanceRef.current = attendance;
  calendarRef.current = calendar;
  markListRef.current = markList;
  timetableRef.current = timetable;
  loadingRef.current = loading;

  const dismissNotification = useCallback((id: string) => {
    setNotificationQueue((current) => current.filter((item) => item.id !== id));
  }, []);

  const enqueueNotification = useCallback((payload: NotificationPayload) => {
    const isSystemEvent = payload.type === 'system';

    if (!isSystemEvent) {
      if (
        typeof window !== 'undefined'
        && 'Notification' in window
        && Notification.permission === 'granted'
        && 'serviceWorker' in navigator
      ) {
        void (async () => {
          try {
            const reg = await navigator.serviceWorker.ready;
            await reg.showNotification(payload.title, {
              body: payload.message,
              icon: '/icons/android-icon-192.png',
              badge: '/icons/android-icon-192.png',
              tag: `fcuk-${payload.type}-${payload.id ?? Date.now()}`,
              data: {
                url: payload.deepLink ?? '/',
                deepLink: payload.deepLink ?? '/',
              },
              ...({ renotify: true, vibrate: payload.type === 'bad' ? [120, 60, 120] : [80] } as NotificationOptions),
            });
          } catch {
            // Foreground notification delivery should never block app behavior.
          }
        })();
      }

      if (!payload.silent) {
        void playNotificationSound(payload.sound ?? payload.type);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(payload.type === 'bad' ? [80, 40, 80] : 80);
        }
      }

      return;
    }

    const item = createToastItem(payload);
    setNotificationQueue((current) => [item, ...current].slice(0, NOTIFICATIONS_STACK_LIMIT));

    if (!payload.silent) {
      void playNotificationSound(payload.sound ?? payload.type);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(80);
      }
    }
  }, []);

  const triggerNotification = useCallback<NotificationContextValue['triggerNotification']>((type, payload) => {
    enqueueNotification({
      ...payload,
      type,
    });
  }, [enqueueNotification]);

  const refreshPushToken = useCallback(async () => {
    if (!notificationsActive) return null;

    const currentPermission = resolvePermissionState();
    setPermissionState(currentPermission);
    setStoredNotificationPermission(currentPermission);

    if (currentPermission !== 'granted') {
      await clearNotificationToken();
      return null;
    }

    return initNotifications();
  }, [notificationsActive]);

  // ── Stable notification engine ────────────────────────────────────────────
  // Data is accessed via refs so this callback is only recreated when
  // notificationsActive or enqueueNotification changes — NOT on every data load.
  const runNotificationEngine = useCallback(() => {
    if (!notificationsActive || loadingRef.current) return;

    const nextNotifications = evaluateNotificationEngine({
      attendance: attendanceRef.current,
      markList: markListRef.current,
      timetable: timetableRef.current,
      calendar: calendarRef.current,
    });

    nextNotifications.forEach((payload) => enqueueNotification(payload));
  }, [enqueueNotification, notificationsActive]); // ← No data-state deps!

  const clearEngineTimer = useCallback(() => {
    if (engineTimerRef.current !== null) {
      window.clearTimeout(engineTimerRef.current);
      engineTimerRef.current = null;
    }
  }, []);

  const scheduleNotificationEngine = useCallback(() => {
    clearEngineTimer();

    if (!notificationsActive) return;

    const delay = getNextNotificationEngineDelay({
      timetable: timetableRef.current,
      calendar: calendarRef.current,
      now: new Date(),
    });

    if (delay === null) return;

    engineTimerRef.current = window.setTimeout(() => {
      engineTimerRef.current = null;
      runNotificationEngine();
      scheduleNotificationEngine();
    }, Math.max(delay, 1000));
  }, [clearEngineTimer, notificationsActive, runNotificationEngine]);

  const handleForegroundMessage = useCallback((payload: MessagePayload) => {
    const messageId = payload.messageId ?? null;
    if (messageId) {
      if (seenForegroundMessageIdsRef.current.includes(messageId)) {
        return;
      }

      seenForegroundMessageIdsRef.current = [
        messageId,
        ...seenForegroundMessageIdsRef.current,
      ].slice(0, 40);
    }

    const nextPayload = fromFcmPayload(payload);
    if (!nextPayload) return;

    if (
      typeof window !== 'undefined'
      && 'Notification' in window
      && Notification.permission === 'granted'
      && 'serviceWorker' in navigator
    ) {
      void (async () => {
        try {
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification(nextPayload.title, {
            body: nextPayload.message,
            icon: '/icons/android-icon-192.png',
            badge: '/icons/android-icon-192.png',
            tag: `fcuk-fcm-${nextPayload.id ?? Date.now()}`,
            data: {
              url: nextPayload.deepLink ?? '/',
              deepLink: nextPayload.deepLink ?? '/',
            },
            ...({ renotify: true, vibrate: nextPayload.type === 'bad' ? [120, 60, 120] : [80] } as NotificationOptions),
          });
        } catch {
          // Background delivery remains the primary path.
        }
      })();
    }

    if (!nextPayload.silent) {
      void playNotificationSound(nextPayload.sound ?? nextPayload.type);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(nextPayload.type === 'bad' ? [80, 40, 80] : 80);
      }
    }
  }, []);

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    setNotificationsEnabledPreference(enabled);
    setNotificationsEnabledState(enabled);

    if (!enabled) {
      clearEngineTimer();
      await clearNotificationToken();
      enqueueNotification({
        title: 'notifications off',
        message: 'Push alerts are disabled for now.',
        type: 'system',
        sound: 'warning',
        source: 'settings',
      });
      return;
    }

    const pushSupportStatus = getWebPushSupportStatus();
    if (pushSupportStatus === 'ios-install-required') {
      setNotificationsEnabledPreference(false);
      setNotificationsEnabledState(false);
      enqueueNotification({
        title: 'install required',
        message: 'Install this app to your Home Screen on iPhone or iPad before enabling push.',
        type: 'system',
        sound: 'warning',
        source: 'settings',
      });
      return;
    }

    if (pushSupportStatus === 'unsupported' || typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationsEnabledPreference(false);
      setNotificationsEnabledState(false);
      enqueueNotification({
        title: 'push not supported',
        message: 'This browser or device does not support web push notifications.',
        type: 'system',
        sound: 'warning',
        source: 'settings',
      });
      return;
    }

    const permission = await requestNotificationPermission();
    setPermissionState(permission);
    setStoredNotificationPermission(permission);

    if (permission === 'granted') {
      await initNotifications({ forceRefresh: true });
      enqueueNotification({
        title: 'notifications on',
        message: 'Push alerts are live for classes, attendance, marks, and broadcasts.',
        type: 'system',
        sound: 'good',
        source: 'settings',
      });
      scheduleNotificationEngine();
      return;
    }

    setNotificationsEnabledPreference(false);
    setNotificationsEnabledState(false);

    if (permission === 'denied') {
      enqueueNotification({
        title: 'permission blocked',
        message: 'Browser permission is blocked. Re-enable notifications from browser settings.',
        type: 'system',
        sound: 'warning',
        source: 'settings',
      });
      return;
    }

    enqueueNotification({
      title: 'permission dismissed',
      message: 'Notifications stayed off because permission was not granted.',
      type: 'system',
      sound: 'warning',
      source: 'settings',
    });
  }, [clearEngineTimer, enqueueNotification, scheduleNotificationEngine]);

  useEffect(() => {
    primeNotificationAudio();
    setNotificationsEnabledState(
      hasNotificationsEnabledPreference() ? getNotificationsEnabledPreference() : false,
    );
    setPermissionState(resolvePermissionState());
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!notificationsActive) return;

      if (document.visibilityState === 'hidden') {
        clearEngineTimer();
        return;
      }

      runNotificationEngine();
      scheduleNotificationEngine();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [clearEngineTimer, notificationsActive, runNotificationEngine, scheduleNotificationEngine]);

  useEffect(() => {
    if (!notificationsActive) {
      clearEngineTimer();
      return;
    }

    void refreshPushToken();
    runNotificationEngine();
    scheduleNotificationEngine();

    return () => {
      clearEngineTimer();
    };
  }, [clearEngineTimer, notificationsActive, refreshPushToken, runNotificationEngine, scheduleNotificationEngine]);

  useEffect(() => {
    if (!notificationsActive) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const setupForegroundMessaging = async () => {
      try {
        const { getFirebaseMessagingClient } = await import('@/lib/firebase');
        const messaging = await getFirebaseMessagingClient();
        if (!messaging || cancelled) return;

        const { onMessage } = await import('firebase/messaging');
        unsubscribe = onMessage(messaging, handleForegroundMessage);
      } catch {
        // FCM is optional at runtime; local notifications still work.
      }
    };

    void setupForegroundMessaging();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [handleForegroundMessage, notificationsActive]);

  const value = useMemo<NotificationContextValue>(() => ({
    notificationsEnabled,
    permissionState,
    notificationQueue,
    triggerNotification,
    dismissNotification,
    setNotificationsEnabled,
  }), [
    dismissNotification,
    notificationQueue,
    notificationsEnabled,
    permissionState,
    setNotificationsEnabled,
    triggerNotification,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationStack items={notificationQueue} dismissNotification={dismissNotification} />
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }

  return context;
}
