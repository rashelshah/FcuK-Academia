import { NextResponse } from 'next/server';

import { getCachedDashboardData } from '@/lib/server/dashboard-cache';
import { handleRouteError, requireSession } from '@/lib/server/route-utils';

export async function GET() {
  try {
    const { sessionId, session, response } = await requireSession();
    if (response) return response;
    if (!sessionId || !session) {
      return NextResponse.json({ error: 'session expired' }, { status: 401 });
    }

    const result = await getCachedDashboardData(sessionId, session);
    if (!result.snapshot) {
      return NextResponse.json({ error: result.error || 'session expired' }, { status: 401 });
    }

    return NextResponse.json({
      userInfo: result.snapshot.userInfo,
      attendance: result.snapshot.attendance,
      markList: result.snapshot.markList,
      timetable: result.snapshot.timetable,
      calendar: result.snapshot.calendar,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
