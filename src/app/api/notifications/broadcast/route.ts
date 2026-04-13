import { NextResponse } from 'next/server';

import type { BroadcastNotificationPayload, NotificationType } from '@/lib/notifications/types';
import { getFirebaseAdminMessaging, getNotificationTokenCollection, isFirebaseAdminConfigured } from '@/lib/server/firebase-admin';

function getAdminSecret(request: Request) {
  return request.headers.get('x-admin-secret')
    || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    || '';
}

function sanitizeType(value: unknown): NotificationType {
  const validTypes: NotificationType[] = ['good', 'bad', 'warning', 'class', 'broadcast', 'system'];
  return validTypes.includes(value as NotificationType) ? value as NotificationType : 'broadcast';
}

function chunkArray<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

export async function POST(request: Request) {
  const expectedSecret = process.env.ADMIN_SECRET;
  if (!expectedSecret || getAdminSecret(request) !== expectedSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const message = typeof body?.message === 'string' ? body.message.trim() : '';

  if (!title || !message) {
    return NextResponse.json({ error: 'title and message required' }, { status: 400 });
  }

  const payload: BroadcastNotificationPayload = {
    title,
    message,
    type: sanitizeType(body?.type),
    sound: typeof body?.sound === 'string' ? body.sound : 'default',
    deepLink: typeof body?.deepLink === 'string' ? body.deepLink : null,
  };

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({
      delivered: false,
      reason: 'firebase_admin_not_configured',
    }, { status: 202 });
  }

  const collection = getNotificationTokenCollection();
  const messaging = getFirebaseAdminMessaging();
  if (!collection || !messaging) {
    return NextResponse.json({
      delivered: false,
      reason: 'messaging_unavailable',
    }, { status: 503 });
  }

  const snapshot = await collection.get();
  const tokens = snapshot.docs
    .map((document) => String(document.data().token || '').trim())
    .filter(Boolean);

  if (!tokens.length) {
    return NextResponse.json({
      delivered: true,
      sentCount: 0,
      reason: 'no_registered_tokens',
    });
  }

  const absoluteLink = payload.deepLink
    ? new URL(payload.deepLink, request.url).toString()
    : new URL('/', request.url).toString();

  let successCount = 0;
  let failureCount = 0;

  for (const batch of chunkArray(tokens, 500)) {
    const response = await messaging.sendEachForMulticast({
      tokens: batch,
      data: {
        title: payload.title,
        message: payload.message,
        type: payload.type,
        sound: payload.sound ?? 'default',
        deepLink: payload.deepLink ?? '/',
      },
      webpush: {
        headers: {
          Urgency: 'high',
        },
        fcmOptions: {
          link: absoluteLink,
        },
      },
    });

    successCount += response.successCount;
    failureCount += response.failureCount;

    await Promise.all(
      response.responses.map(async (item, index) => {
        if (item.success) return;

        const code = item.error?.code;
        if (code !== 'messaging/registration-token-not-registered' && code !== 'messaging/invalid-registration-token') {
          return;
        }

        const invalidToken = batch[index];
        if (!invalidToken) return;

        await collection.doc(invalidToken).delete().catch(() => undefined);
      }),
    );
  }

  return NextResponse.json({
    delivered: true,
    sentCount: successCount,
    failedCount: failureCount,
  });
}
