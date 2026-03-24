import { NextResponse } from 'next/server';

import { SESSION_COOKIE } from '@/lib/auth-constants';
import { logoutUser } from '@/lib/server/academia';
import {
  clearUserSession,
  getCurrentSessionId,
  getExpiredSessionCookieOptions,
  getUserSession,
} from '@/lib/server/session';

export async function POST() {
  const session = await getUserSession();
  if (session?.cookies) {
    await logoutUser();
  }

  const sessionId = await getCurrentSessionId();
  await clearUserSession(sessionId);

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, '', getExpiredSessionCookieOptions());
  return response;
}
