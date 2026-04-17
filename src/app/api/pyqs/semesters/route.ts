import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // 1 hour ISR cache

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('pyqs')
      .select('semester')
      .order('semester', { ascending: true });

    if (error) throw error;

    // Deduplicate in JS (GROUP BY alternative without RPC)
    const semesters = [...new Set((data ?? []).map((r: { semester: number }) => r.semester))].sort(
      (a, b) => a - b
    );

    return NextResponse.json({ semesters }, { status: 200 });
  } catch (err) {
    console.error('[/api/pyqs/semesters]', err);
    return NextResponse.json({ error: 'Failed to fetch semesters' }, { status: 500 });
  }
}
