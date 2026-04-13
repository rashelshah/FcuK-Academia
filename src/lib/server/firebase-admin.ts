import 'server-only';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

const FIREBASE_ADMIN_APP_NAME = 'fcuk-academia-admin';
const NOTIFICATION_TOKEN_COLLECTION = 'fcmTokens';

function normalizePrivateKey(value?: string) {
  return value?.replace(/\\n/g, '\n');
}

export function isFirebaseAdminConfigured() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID
    && process.env.FIREBASE_CLIENT_EMAIL
    && process.env.FIREBASE_PRIVATE_KEY,
  );
}

export function getFirebaseAdminApp() {
  const existing = getApps().find((app) => app.name === FIREBASE_ADMIN_APP_NAME);
  if (existing) return existing;
  if (!isFirebaseAdminConfigured()) return null;

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  }, FIREBASE_ADMIN_APP_NAME);
}

export function getNotificationTokenCollection() {
  const app = getFirebaseAdminApp();
  if (!app) return null;

  return getFirestore(app).collection(NOTIFICATION_TOKEN_COLLECTION);
}

export function getFirebaseAdminMessaging() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getMessaging(app);
}
