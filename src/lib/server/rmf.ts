import prisma from '@/lib/prisma';
import { syncUserToDb } from './user-sync';

// Optimized interfaces for consistency between API and Server Components
export interface FacultyStats {
  teachingClarity: number;
  approachability: number;
  gradingFairness: number;
  punctuality: number;
  partiality: number;
  behaviour: number;
}

export interface Review {
  id: string;
  review: string | null;
  createdAt: string | Date;
}

export async function getRmfFaculties() {
  // Sync user data to DB for analytics (async background sync)
  void syncUserToDb();

  const srmCollege = await prisma.college.findFirst({
    where: {
      name: {
        contains: 'SRM',
        mode: 'insensitive',
      },
    },
  });

  if (!srmCollege) {
    return { error: 'SRM College not found in database', faculties: [] };
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

  const facultiesIds = faculties.map((f: any) => f.id);

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
  const statsMap = new Map<string, any>();
  for (const stat of groupStats) {
    statsMap.set(stat.facultyId, stat);
  }

  const facultiesWithStats = faculties.map((faculty: any) => {
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

  return { 
    college: srmCollege,
    faculties: facultiesWithStats 
  };
}

export async function getFacultyDetails(id: string) {
  if (!id) return null;

  const faculty = await prisma.faculty.findUnique({
    where: { id },
  });

  if (!faculty) return null;

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

  const reviews = rawReviews.filter((r: any) => r.review && r.review.trim().length > 0);

  return {
    faculty: {
      ...faculty,
      overallRating,
      reviewCount: stats._count,
      stats: stats._avg as unknown as FacultyStats,
    },
    reviews,
  };
}

export async function getTodayRatings() {
  void syncUserToDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ratings = await prisma.rating.findMany({
    where: {
      createdAt: {
        gte: today,
      },
    },
    include: {
      faculty: {
        include: {
          college: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Serialize dates for Server Components
  return ratings.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    faculty: r.faculty ? {
      ...r.faculty,
      createdAt: r.faculty.createdAt.toISOString(),
    } : null
  }));
}
