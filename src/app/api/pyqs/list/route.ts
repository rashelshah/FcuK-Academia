import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // 1 hour ISR cache

export async function GET(req: NextRequest) {
  const semester = req.nextUrl.searchParams.get('semester');
  const subject = req.nextUrl.searchParams.get('subject');

  if (!semester || isNaN(Number(semester))) {
    return NextResponse.json({ error: 'Invalid or missing semester param' }, { status: 400 });
  }
  if (!subject) {
    return NextResponse.json({ error: 'Missing subject param' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('pyqs')
      .select('id, semester, subject_name, exam_type, year, source_label, file_url')
      .eq('semester', Number(semester))
      .eq('subject_name', subject.trim())
      .order('year', { ascending: false, nullsFirst: false })
      .order('source_label', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ pyqs: data ?? [] }, { status: 200 });
  } catch (err) {
    console.error('[/api/pyqs/list]', err);
    return NextResponse.json({ error: 'Failed to fetch PYQs' }, { status: 500 });
  }
}
