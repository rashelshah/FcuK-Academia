import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Faculty ID required' }, { status: 400 });
    }

    const faculty = await prisma.faculty.findUnique({
      where: { id },
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    // Aggregated stats
    const stats = await prisma.rating.aggregate({
      where: { facultyId: id },
      _avg: {
        teachingClarity: true,
        approachability: true,
        gradingFairness: true,
        punctuality: true,
        partiality: true,
        behaviour: true,
      },
      _count: true,
    });

    // Compute overall
    const a = stats._avg;
    const overallRating =
      a.teachingClarity == null
        ? 0
        : (a.teachingClarity +
            a.approachability! +
            a.gradingFairness! +
            a.punctuality! +
            a.partiality! +
            a.behaviour!) /
          6;

    // Fetch the recent reviews to display in the list
    const rawReviews = await prisma.rating.findMany({
      where: {
        facultyId: id,
        review: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });

    const reviews = rawReviews.filter((r: typeof rawReviews[number]) => r.review && r.review.trim().length > 0);

    return NextResponse.json({
      faculty: {
        ...faculty,
        overallRating,
        reviewCount: stats._count,
        stats: stats._avg,
      },
      reviews,
    });
  } catch (error) {
    console.error('Failed to fetch faculty detailing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
