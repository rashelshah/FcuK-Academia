import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getRmfFaculties } from '@/lib/server/rmf';
import { syncUserToDb } from '@/lib/server/user-sync';

export async function GET() {
  try {
    const data = await getRmfFaculties();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch RM faculties:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(request: Request) {
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

    return NextResponse.json(faculty);
  } catch (error: unknown) {
    console.error('Failed to create faculty:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
