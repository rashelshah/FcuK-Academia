import 'server-only';

import { NextResponse } from 'next/server';

import { getUserSession } from '@/lib/server/session';

export async function requireSession() {
  const session = await getUserSession();
  if (!session?.cookies || !Object.keys(session.cookies).length) {
    return {
      session: null,
      response: NextResponse.json({ error: 'session expired' }, { status: 401 }),
    };
  }

  return {
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
