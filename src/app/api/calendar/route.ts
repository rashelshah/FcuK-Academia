import { NextResponse } from 'next/server';

import { getCalendar } from '@/lib/server/academia';
import { handleRouteError, requireSession } from '@/lib/server/route-utils';

export async function GET() {
  try {
    const { session, response } = await requireSession();
    if (response) return response;

    const result = await getCalendar(session.cookies);
    if (result.status !== 200) {
      return NextResponse.json({ error: 'session expired' }, { status: 401 });
    }

    return NextResponse.json({ calendar: result.calendar });
  } catch (error) {
    return handleRouteError(error);
  }
}
