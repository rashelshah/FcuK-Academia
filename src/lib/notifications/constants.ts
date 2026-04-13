import type { NotificationType } from '@/lib/notifications/types';

export const NOTIFICATIONS_ENABLED_KEY = 'fcuk.notifications.enabled';
export const NOTIFICATIONS_PERMISSION_KEY = 'fcuk.notifications.permission';
export const NOTIFICATIONS_FCM_TOKEN_KEY = 'fcuk.notifications.fcmToken';
export const NOTIFICATIONS_FCM_SESSION_SYNC_KEY = 'fcuk.notifications.fcmToken.sessionSynced';
export const NOTIFICATIONS_MARKS_SNAPSHOT_KEY = 'fcuk.notifications.marksSnapshot';
export const NOTIFICATIONS_DEDUP_PREFIX = 'notified';
export const NOTIFICATIONS_FCM_SW_SCOPE = '/firebase-cloud-messaging-push-scope';
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
