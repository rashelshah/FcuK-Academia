import { NextResponse } from 'next/server';
import { getFacultyDetails } from '@/lib/server/rmf';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Faculty ID required' }, { status: 400 });
    }

    const data = await getFacultyDetails(id);

    if (!data) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch faculty detailing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

