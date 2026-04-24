import { NextResponse } from 'next/server';

import { getCachedDashboardData } from '@/lib/server/dashboard-cache';
import { handleRouteError, requireSession } from '@/lib/server/route-utils';
import { applySessionCookie } from '@/lib/server/session';

export async function GET(request: Request) {
  try {
    const { sessionId, session, response: authResponse } = await requireSession();
    if (authResponse) return authResponse;
    if (!sessionId || !session) {
      return NextResponse.json({ error: 'session expired' }, { status: 401 });
    }

    const forceRefresh = new URL(request.url).searchParams.get('refresh') === '1';
    const result = await getCachedDashboardData(sessionId, session, { forceRefresh });
    if (!result.snapshot) {
      return NextResponse.json({ error: result.error || 'session expired' }, { status: 401 });
    }

    const jsonResponse = NextResponse.json({
      userInfo: result.snapshot.userInfo,
      attendance: result.snapshot.attendance,
      markList: result.snapshot.markList,
      timetable: result.snapshot.timetable,
      calendar: result.snapshot.calendar,
      isStale: !result.refreshed && result.error === 'session expired',
    });
    // User-specific data — private cache only (no CDN/shared cache).
    // 10s max-age prevents the browser re-fetching within the same tab focus.
    // The client-side in-memory cache (5 min) is the primary dedup layer.
    jsonResponse.headers.set('Cache-Control', 'private, max-age=5, stale-while-revalidate=15');
    return result.session ? applySessionCookie(jsonResponse, result.session) : jsonResponse;
  } catch (error) {
    return handleRouteError(error);
  }
}
