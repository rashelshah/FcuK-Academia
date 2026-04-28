import { NextResponse } from 'next/server';

import { getCalendar } from '@/lib/server/scraper-client';
import { handleRouteError, requireSession } from '@/lib/server/route-utils';
import { applySessionCookie } from '@/lib/server/session';

export async function GET() {
  try {
    const { sessionId, session, response: authResponse } = await requireSession();
    if (authResponse || !sessionId || !session) {
      return authResponse ?? NextResponse.json({ error: 'session expired. Log In again.' }, { status: 401 });
    }

    const result = await getCalendar(session.cookies);
    if (result.status !== 200) {
      return NextResponse.json({ error: result.error ?? 'session expired. Log In again.' }, { status: result.status });
    }

    const jsonResponse = NextResponse.json({ calendar: result.calendar });
    // Calendar is semi-static (changes at most daily) — cache privately for 5 min.
    jsonResponse.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=600');
    return applySessionCookie(jsonResponse, { ...session, cookies: result.cookies });
  } catch (error) {
    return handleRouteError(error);
  }
}
