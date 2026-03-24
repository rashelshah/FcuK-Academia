import { NextResponse } from 'next/server';

import { getCourse } from '@/lib/server/academia';
import { handleRouteError, requireSession } from '@/lib/server/route-utils';

export async function GET() {
  try {
    const { session, response } = await requireSession();
    if (response) return response;

    const result = await getCourse(session.cookies);
    if (result.status !== 200) {
      return NextResponse.json({ error: 'session expired' }, { status: 401 });
    }

    return NextResponse.json({ courseList: result.courseList, batch: result.batch });
  } catch (error) {
    return handleRouteError(error);
  }
}
