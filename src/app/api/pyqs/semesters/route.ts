import { NextResponse } from 'next/server';
import { getSemesters } from '@/lib/drive';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const semesters = await getSemesters();
    return NextResponse.json({ semesters }, { status: 200 });
  } catch (err) {
    console.error('[/api/pyqs/semesters]', err);
    return NextResponse.json({ error: 'Failed to fetch semesters' }, { status: 500 });
  }
}
