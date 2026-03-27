import { NextRequest, NextResponse } from 'next/server';

import { getCachedDashboardData } from '@/lib/server/dashboard-cache';
import { verifyPassword } from '@/lib/server/academia';
import { createSessionCookieValue, getSessionCookieOptions, getSessionIdFromCookieValue } from '@/lib/server/session';
import { SESSION_COOKIE } from '@/lib/auth-constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!email.endsWith('@srmist.edu.in')) {
      return NextResponse.json({ error: 'Only @srmist.edu.in emails are allowed' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const authResult = await verifyPassword({
      identifier: email,
      password,
    });

    if (authResult.data?.captcha?.required) {
      return NextResponse.json(
        { error: authResult.data.message || 'server error' },
        { status: 400 },
      );
    }

    if (!authResult.isAuthenticated || !authResult.data?.cookies) {
      return NextResponse.json(
        { error: authResult.data?.message || authResult.error || 'invalid credentials' },
        { status: 401 },
      );
    }

    const session = {
      email,
      cookies: authResult.data.cookies,
      createdAt: Date.now(),
    };
    const cookieValue = createSessionCookieValue(session);
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, cookieValue, getSessionCookieOptions());

    // Warm the dashboard snapshot asynchronously so the first post-login load can reuse it.
    void getCachedDashboardData(getSessionIdFromCookieValue(cookieValue), session).catch(() => undefined);

    return response;
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
