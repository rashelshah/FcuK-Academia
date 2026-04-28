import { NextResponse } from 'next/server';

import { getCachedDashboardData } from '@/lib/server/dashboard-cache';
import { handleRouteError, requireSession } from '@/lib/server/route-utils';
import { applySessionCookie } from '@/lib/server/session';

export async function GET() {
  try {
    const { sessionId, session, response: authResponse } = await requireSession();
    if (authResponse || !sessionId || !session) {
      return authResponse ?? NextResponse.json({ error: 'session expired. log in again.' }, { status: 401 });
    }

    const result = await getCachedDashboardData(sessionId, session);
    if (!result.snapshot) {
      return NextResponse.json({ error: 'session expired. log in again.' }, { status: 401 });
    }

    const jsonResponse = NextResponse.json({ timetable: result.snapshot.timetable });
    return result.session ? applySessionCookie(jsonResponse, result.session) : jsonResponse;
  } catch (error) {
    return handleRouteError(error);
  }
}
