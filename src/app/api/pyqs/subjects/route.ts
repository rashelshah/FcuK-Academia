import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // 1 hour ISR cache

export async function GET(req: NextRequest) {
  const semester = req.nextUrl.searchParams.get('semester');
  if (!semester || isNaN(Number(semester))) {
    return NextResponse.json({ error: 'Invalid or missing semester param' }, { status: 400 });
  }

  try {
    // Use .select with a groupby-equivalent via raw query for performance
    // Supabase JS doesn't have GROUP BY natively; we fetch and deduplicate
    const { data, error } = await supabase
      .from('pyqs')
      .select('subject_name')
      .eq('semester', Number(semester))
      .order('subject_name', { ascending: true });

    if (error) throw error;

    // Deduplicate subject_name (equivalent to GROUP BY subject_name)
    const subjects = [
      ...new Map(
        (data ?? []).map((r: { subject_name: string }) => [r.subject_name, r.subject_name])
      ).values(),
    ].sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ subjects }, { status: 200 });
  } catch (err) {
    console.error('[/api/pyqs/subjects]', err);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}
