import { NextResponse } from 'next/server';

import { getTimetable } from '@/lib/server/academia';
import { handleRouteError, requireSession } from '@/lib/server/route-utils';

export async function GET() {
  try {
    const { session, response } = await requireSession();
    if (response) return response;

    const result = await getTimetable(session.cookies);
    if (result.status !== 200) {
      return NextResponse.json({ error: 'session expired' }, { status: 401 });
    }

    return NextResponse.json({ timetable: result.timetable });
  } catch (error) {
    return handleRouteError(error);
  }
}
