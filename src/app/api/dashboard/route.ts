import { NextResponse } from 'next/server';

import { getCachedDashboardData } from '@/lib/server/dashboard-cache';
import { handleRouteError, requireSession } from '@/lib/server/route-utils';
import { applySessionCookie } from '@/lib/server/session';

export async function GET() {
  try {
    const { sessionId, session, response: authResponse } = await requireSession();
    if (authResponse) return authResponse;
    if (!sessionId || !session) {
      return NextResponse.json({ error: 'session expired' }, { status: 401 });
    }

    const result = await getCachedDashboardData(sessionId, session);
    if (!result.snapshot) {
      return NextResponse.json({ error: result.error || 'session expired' }, { status: 401 });
    }

    const jsonResponse = NextResponse.json({
      userInfo: result.snapshot.userInfo,
      attendance: result.snapshot.attendance,
      markList: result.snapshot.markList,
      timetable: result.snapshot.timetable,
      calendar: result.snapshot.calendar,
    });
    return result.session ? applySessionCookie(jsonResponse, result.session) : jsonResponse;
  } catch (error) {
    return handleRouteError(error);
  }
}
