import {
  NOTIFICATIONS_DEDUP_PREFIX,
  NOTIFICATIONS_ENABLED_KEY,
  NOTIFICATIONS_FCM_SESSION_SYNC_KEY,
  NOTIFICATIONS_FCM_TOKEN_KEY,
  NOTIFICATIONS_MARKS_SNAPSHOT_KEY,
  NOTIFICATIONS_PERMISSION_KEY,
} from '@/lib/notifications/constants';

function canUseStorage() {
  return typeof window !== 'undefined';
}

export function readBooleanStorage(key: string, fallback = false) {
  if (!canUseStorage()) return fallback;

  const value = window.localStorage.getItem(key);
  if (value === null) return fallback;
  return value === 'true';
}

export function writeBooleanStorage(key: string, value: boolean) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, value ? 'true' : 'false');
}

export function getNotificationsEnabledPreference() {
  return readBooleanStorage(NOTIFICATIONS_ENABLED_KEY, false);
}

export function setNotificationsEnabledPreference(value: boolean) {
  writeBooleanStorage(NOTIFICATIONS_ENABLED_KEY, value);
}

export function getStoredNotificationPermission() {
  if (!canUseStorage()) return 'unknown';
  return window.localStorage.getItem(NOTIFICATIONS_PERMISSION_KEY) ?? 'unknown';
}

export function setStoredNotificationPermission(value: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(NOTIFICATIONS_PERMISSION_KEY, value);
}

export function getStoredFcmToken() {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(NOTIFICATIONS_FCM_TOKEN_KEY);
}

export function setStoredFcmToken(token: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(NOTIFICATIONS_FCM_TOKEN_KEY, token);
}

export function clearStoredFcmToken() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(NOTIFICATIONS_FCM_TOKEN_KEY);
}

export function getSessionSyncedFcmToken() {
  if (!canUseStorage()) return null;
  return window.sessionStorage.getItem(NOTIFICATIONS_FCM_SESSION_SYNC_KEY);
}

export function setSessionSyncedFcmToken(token: string) {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(NOTIFICATIONS_FCM_SESSION_SYNC_KEY, token);
}

export function clearSessionSyncedFcmToken() {
  if (!canUseStorage()) return;
  window.sessionStorage.removeItem(NOTIFICATIONS_FCM_SESSION_SYNC_KEY);
}

export function getStoredMarksSnapshot() {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(NOTIFICATIONS_MARKS_SNAPSHOT_KEY);
}

export function setStoredMarksSnapshot(snapshot: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(NOTIFICATIONS_MARKS_SNAPSHOT_KEY, snapshot);
}

export function getNotificationDateKey(referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, '0');
  const day = String(referenceDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getNotificationDedupKey(type: string, identifier: string, referenceDate = new Date()) {
  return `${NOTIFICATIONS_DEDUP_PREFIX}_${type}_${identifier}_${getNotificationDateKey(referenceDate)}`;
}

export function hasSeenNotification(type: string, identifier: string, referenceDate = new Date()) {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(getNotificationDedupKey(type, identifier, referenceDate)) === 'true';
}

export function markNotificationSeen(type: string, identifier: string, referenceDate = new Date()) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(getNotificationDedupKey(type, identifier, referenceDate), 'true');
}
