import { NextResponse } from 'next/server';

import { getCourse } from '@/lib/server/scraper-client';
import { handleRouteError, requireSession } from '@/lib/server/route-utils';
import { applySessionCookie } from '@/lib/server/session';

export async function GET() {
  try {
    const { session, response: authResponse } = await requireSession();
    if (authResponse) return authResponse;

    const result = await getCourse(session.cookies);
    if (result.status !== 200) {
      return NextResponse.json({ error: 'session expired. Log In again.' }, { status: 401 });
    }

    const jsonResponse = NextResponse.json({ courseList: result.courseList, batch: result.batch });
    return applySessionCookie(jsonResponse, {
      ...session,
      cookies: result.cookies,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
