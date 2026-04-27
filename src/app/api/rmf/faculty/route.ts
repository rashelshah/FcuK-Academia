import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';
import { getRmfFaculties, RMF_MAINTENANCE_MODE } from '@/lib/server/rmf';
import { syncUserToDb } from '@/lib/server/user-sync';

export async function GET() {
  if (RMF_MAINTENANCE_MODE) {
    return NextResponse.json({ error: 'Maintenance mode' }, { status: 503 });
  }
  try {
    const data = await getRmfFaculties();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch RM faculties:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  if (RMF_MAINTENANCE_MODE) {
    return NextResponse.json({ error: 'Maintenance mode' }, { status: 503 });
  }
  try {
    // Sync user data to DB before creating faculty
    await syncUserToDb();

    const { name, designation, department } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    let srmCollege = await prisma.college.findFirst({
      where: {
        name: {
          contains: 'SRM',
          mode: 'insensitive',
        },
      },
    });

    if (!srmCollege) {
      return NextResponse.json({ error: 'SRM College not found' }, { status: 404 });
    }

    const faculty = await prisma.faculty.create({
      data: {
        name,
        designation,
        department,
        collegeId: srmCollege.id,
      },
    });

    // Revalidate the faculty list cache
    revalidateTag('rmf-faculties', 'default');

    return NextResponse.json(faculty);
  } catch (error: unknown) {
    console.error('Failed to create faculty:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
