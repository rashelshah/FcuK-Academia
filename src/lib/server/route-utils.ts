import 'server-only';

import { NextResponse } from 'next/server';

import { getUserSession } from '@/lib/server/session';

export async function requireSession() {
  const { getCurrentSessionId } = await import('@/lib/server/session');
  const session = await getUserSession();
  const sessionId = await getCurrentSessionId();
  if (!session?.cookies || !Object.keys(session.cookies).length) {
    return {
      sessionId: null,
      session: null,
      response: NextResponse.json({ error: 'session expired. log in again.' }, { status: 401 }),
    };
  }

  return {
    sessionId,
    session,
    response: null,
  };
}

export function handleRouteError(error: unknown) {
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message || 'server error' }, { status: 500 });
  }

  return NextResponse.json({ error: 'server error' }, { status: 500 });
}
