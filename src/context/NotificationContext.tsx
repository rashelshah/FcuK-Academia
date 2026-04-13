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
import { playNotificationSound, primeNotificationAudio } from '@/lib/notifications/sounds';
import {
  getNotificationsEnabledPreference,
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
    deepLink: typeof data.deepLink === 'string' ? data.deepLink : '/',
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

  const dismissNotification = useCallback((id: string) => {
    setNotificationQueue((current) => current.filter((item) => item.id !== id));
  }, []);

  const enqueueNotification = useCallback((payload: NotificationPayload) => {
    // ─── ROUTING RULE ──────────────────────────────────────────────────────────
    // system  → in-app toast   (settings feedback, toggle state, etc.)
    // all others (good/bad/warning/class/broadcast) → OS system notification
    // ───────────────────────────────────────────────────────────────────────────
    const isSystemEvent = payload.type === 'system';

    if (!isSystemEvent) {
      // Academic / push-only event → fire OS notification, never toast.
      if (
        typeof window !== 'undefined'
        && 'Notification' in window
        && Notification.permission === 'granted'
      ) {
        try {
          // eslint-disable-next-line no-new
          new Notification(payload.title, {
            body: payload.message,
            icon: '/icons/android-icon-192.png',
            badge: '/icons/android-icon-192.png',
            tag: `fcuk-${payload.type}-${payload.id ?? Date.now()}`,
          });
        } catch {
          // Silently skip if Notification constructor is unavailable.
        }
      }

      // Still play sound + vibrate even for push-type events.
      if (!payload.silent) {
        void playNotificationSound(payload.sound ?? payload.type);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(payload.type === 'bad' ? [80, 40, 80] : 80);
        }
      }

      return; // Do NOT add to in-app toast queue.
    }

    // System event → add to toast queue as before.
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

    // ⚠️ Do NOT call requestNotificationPermission() here — that would auto-prompt
    // the browser on every page load. Permission is only requested when the user
    // explicitly enables notifications via the toggle in Settings.
    const currentPermission = resolvePermissionState();
    setPermissionState(currentPermission);
    setStoredNotificationPermission(currentPermission);

    if (currentPermission !== 'granted') {
      return null;
    }

    return initNotifications();
  }, [notificationsActive]);

  const runNotificationEngine = useCallback(() => {
    if (!notificationsActive || loading) return;

    const nextNotifications = evaluateNotificationEngine({
      attendance,
      markList,
      timetable,
      calendar,
    });

    nextNotifications.forEach((payload) => enqueueNotification(payload));
  }, [attendance, calendar, enqueueNotification, loading, markList, notificationsActive, timetable]);

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
      timetable,
      calendar,
      now: new Date(),
    });

    if (delay === null) return;

    engineTimerRef.current = window.setTimeout(() => {
      engineTimerRef.current = null;
      runNotificationEngine();
      scheduleNotificationEngine();
    }, Math.max(delay, 1000));
  }, [calendar, clearEngineTimer, notificationsActive, runNotificationEngine, timetable]);

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

    // All FCM foreground messages → OS system notification (not toast).
    // Background messages are already handled by the service worker.
    if (
      typeof window !== 'undefined'
      && 'Notification' in window
      && Notification.permission === 'granted'
    ) {
      try {
        // eslint-disable-next-line no-new
        new Notification(nextPayload.title, {
          body: nextPayload.message,
          icon: '/icons/android-icon-192.png',
          badge: '/icons/android-icon-192.png',
          tag: `fcuk-fcm-${nextPayload.id ?? Date.now()}`,
        });
      } catch {
        // Silently skip — service worker push is the reliable delivery path.
      }
    }

    // Sound + haptic still fire even for foreground push messages.
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
        title: 'silent mode on 🕊️',
        message: 'koi ping nahi, koi drama nahi. peace restored.',
        type: 'system',
        sound: 'warning',
        source: 'settings',
      });
      return;
    }

    // User explicitly enabled — this is the ONLY place we call requestPermission.
    // No auto-prompting anywhere else in the app.
    const permission = await requestNotificationPermission();
    setPermissionState(permission);
    setStoredNotificationPermission(permission);

    if (permission === 'granted') {
      await initNotifications({ forceRefresh: true });
      enqueueNotification({
        title: 'notifications on 🔔',
        message: 'ab bachke rehna 😈 attendance, marks sab ping karega.',
        type: 'system',
        sound: 'good',
        source: 'settings',
      });
      scheduleNotificationEngine();
      return;
    }

    if (permission === 'denied') {
      // User denied the browser prompt → force toggle back OFF.
      // No in-app fallback mode — this app is push-only for academic events.
      setNotificationsEnabledPreference(false);
      setNotificationsEnabledState(false);
      enqueueNotification({
        title: 'permission denied 😤',
        message: 'theek hai bhai, fir mat bolna bataya nahi.',
        type: 'system',
        sound: 'warning',
        source: 'settings',
      });
      return;
    }

    // Unsupported device.
    enqueueNotification({
      title: 'push not supported 📵',
      message: 'yeh device push support nahi karta. sorry bhai.',
      type: 'system',
      sound: 'warning',
      source: 'settings',
    });
  }, [clearEngineTimer, enqueueNotification, scheduleNotificationEngine]);

  useEffect(() => {
    primeNotificationAudio();
    setNotificationsEnabledState(getNotificationsEnabledPreference());
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
        // FCM is optional at runtime; fallback notifications continue to work.
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
