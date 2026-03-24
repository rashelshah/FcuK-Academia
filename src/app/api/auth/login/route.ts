import { NextRequest, NextResponse } from 'next/server';

import { verifyPassword, verifyUser } from '@/lib/server/academia';
import { applySessionCookie } from '@/lib/server/session';

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

    const verifiedUser = await verifyUser(email);
    const { identifier, digest } = verifiedUser.data.lookup;
    const authResult = await verifyPassword({
      identifier,
      digest,
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

    const response = NextResponse.json({ success: true });
    return applySessionCookie(response, {
      email,
      cookies: authResult.data.cookies,
      createdAt: Date.now(),
    });
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
