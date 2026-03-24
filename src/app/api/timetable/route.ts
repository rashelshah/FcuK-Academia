import { NextResponse } from 'next/server';

import { getCachedDashboardData } from '@/lib/server/dashboard-cache';
import { handleRouteError, requireSession } from '@/lib/server/route-utils';

export async function GET() {
  try {
    const { sessionId, session, response } = await requireSession();
    if (response || !sessionId || !session) {
      return response ?? NextResponse.json({ error: 'session expired' }, { status: 401 });
    }

    const result = await getCachedDashboardData(sessionId, session);
    if (!result.snapshot) {
      return NextResponse.json({ error: 'session expired' }, { status: 401 });
    }

    return NextResponse.json({ timetable: result.snapshot.timetable });
  } catch (error) {
    return handleRouteError(error);
  }
}
