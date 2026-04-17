import type { NotificationType } from '@/lib/notifications/types';

export const NOTIFICATIONS_ENABLED_KEY = 'fcuk.notifications.enabled';
export const NOTIFICATIONS_PERMISSION_KEY = 'fcuk.notifications.permission';
export const NOTIFICATIONS_FCM_TOKEN_KEY = 'fcuk.notifications.fcmToken';
export const NOTIFICATIONS_FCM_SESSION_SYNC_KEY = 'fcuk.notifications.fcmToken.sessionSynced';
export const NOTIFICATIONS_MARKS_SNAPSHOT_KEY = 'fcuk.notifications.marksSnapshot';
export const NOTIFICATIONS_DEDUP_PREFIX = 'notified';
// IMPORTANT: scope must be '/' so the SW controls all pages and can receive
// push events regardless of which route the user is on. A narrower scope (e.g.
// '/firebase-cloud-messaging-push-scope') would prevent the SW from intercepting
// push messages for the root app and cause silent delivery failures on Android.
export const NOTIFICATIONS_FCM_SW_SCOPE = '/';
export const NOTIFICATIONS_FCM_SW_PATH = '/firebase-messaging-sw.js';
export const NOTIFICATIONS_DEVICE_API = '/api/notifications/device';
export const NOTIFICATIONS_DEFAULT_DURATION_MS = 5200;
export const NOTIFICATIONS_STACK_LIMIT = 4;

export const NOTIFICATION_SOUND_PATHS: Record<NotificationType | 'default', string> = {
  good: '/sounds/good.mp3',
  bad: '/sounds/bad.mp3',
  warning: '/sounds/warning.mp3',
  class: '/sounds/class.mp3',
  broadcast: '/sounds/good.mp3',
  system: '/sounds/warning.mp3',
  default: '/sounds/good.mp3',
};
