import { NextRequest, NextResponse } from 'next/server';
import { getSubjects } from '@/lib/server/scraper-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const semester = req.nextUrl.searchParams.get('semester');
  if (!semester) {
    return NextResponse.json({ error: 'Missing semester param' }, { status: 400 });
  }

  try {
    const subjects = await getSubjects(semester);
    return NextResponse.json({ subjects }, { status: 200 });
  } catch (err) {
    console.error('[/api/pyqs/subjects]', err);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}
