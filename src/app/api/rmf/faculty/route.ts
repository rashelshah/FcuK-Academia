import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let srmCollege = await prisma.college.findFirst({
      where: {
        name: {
          contains: 'SRM',
          mode: 'insensitive',
        },
      },
    });

    if (!srmCollege) {
      return NextResponse.json({ error: 'SRM College not found in database', faculties: [] }, { status: 404 });
    }

    const faculties = await prisma.faculty.findMany({
      where: {
        collegeId: srmCollege.id,
      },
      select: {
        id: true,
        name: true,
        department: true,
        designation: true,
      },
    });

    const facultiesIds = faculties.map(f => f.id);

    // Fetch all aggregated stats in a single hyper-optimized query
    const groupStats = await prisma.rating.groupBy({
      by: ['facultyId'],
      where: { facultyId: { in: facultiesIds } },
      _avg: {
        teachingClarity: true,
        approachability: true,
        gradingFairness: true,
        punctuality: true,
        partiality: true,
        behaviour: true,
      },
      _count: {
        _all: true
      }
    });

    // Map stats for O(1) assignment
    const statsMap = new Map();
    for (const stat of groupStats) {
      statsMap.set(stat.facultyId, stat);
    }

    const facultiesWithStats = faculties.map((faculty) => {
      const stats = statsMap.get(faculty.id);

      if (!stats) {
         return {
          ...faculty,
          reviewCount: 0,
          overallRating: 0,
          stats: null,
         };
      }

      const a = stats._avg;
      const totalAvg =
        a.teachingClarity == null
          ? 0
          : (a.teachingClarity +
              a.approachability! +
              a.gradingFairness! +
              a.punctuality! +
              a.partiality! +
              a.behaviour!) /
            6;

      return {
        ...faculty,
        reviewCount: stats._count._all,
        overallRating: totalAvg,
        stats: stats._avg,
      };
    });

    return NextResponse.json({ 
      college: srmCollege,
      faculties: facultiesWithStats 
    });
  } catch (error) {
    console.error('Failed to fetch RM faculties:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
  } catch (error: any) {
    console.error('Failed to create faculty:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
