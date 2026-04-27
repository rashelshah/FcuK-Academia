import { NextRequest, NextResponse } from 'next/server';
import { getFiles } from '@/lib/server/scraper-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const semester = req.nextUrl.searchParams.get('semester');
  const subject = req.nextUrl.searchParams.get('subject');

  if (!semester) {
    return NextResponse.json({ error: 'Missing semester param' }, { status: 400 });
  }
  if (!subject) {
    return NextResponse.json({ error: 'Missing subject param' }, { status: 400 });
  }

  try {
    const files = await getFiles(semester, subject);
    
    // Map to the structure the frontend expects
    const pyqs = files.map(file => ({
      id: file.url, // Using URL as a unique ID
      semester: Number(semester),
      subject_name: subject,
      type: file.type,
      year: file.year,
      file_name: file.name,
      file_url: file.url
    }));

    return NextResponse.json({ pyqs }, {
      status: 200,
      headers: {
        // PYQ data is not user-specific — safe to cache at Vercel Edge.
        // 1-hour freshness; serve stale for up to 24 hours while revalidating.
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('[/api/pyqs/list]', err);
    return NextResponse.json({ error: 'Failed to fetch PYQs' }, { status: 500 });
  }
}
