import prisma from '@/lib/prisma';
import { syncUserToDb } from './user-sync';
import { unstable_cache } from 'next/cache';

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

const getSrmCollegeCached = unstable_cache(
  async () => {
    return prisma.college.findFirst({
      where: {
        name: { contains: 'SRM', mode: 'insensitive' },
      },
    });
  },
  ['srm-college'],
  { tags: ['rmf-college'], revalidate: false }
);

export async function getRmfFaculties() {
  // Sync user data to DB for analytics (async background sync)
  void syncUserToDb();

  const srmCollege = await getSrmCollegeCached();

  if (!srmCollege) {
    return { error: 'SRM College not found in database', faculties: [] };
  }

  return unstable_cache(
    async () => {
      // Parallelize fetching faculties and their aggregation stats
      const [faculties, groupStats] = await Promise.all([
        prisma.faculty.findMany({
          where: { collegeId: srmCollege.id },
          select: {
            id: true,
            name: true,
            department: true,
            designation: true,
          },
        }),
        prisma.rating.groupBy({
          by: ['facultyId'],
          where: { faculty: { collegeId: srmCollege.id } },
          _avg: {
            teachingClarity: true,
            approachability: true,
            gradingFairness: true,
            punctuality: true,
            partiality: true,
            behaviour: true,
          },
          _count: { _all: true }
        }),
      ]);

      const statsMap = new Map<string, any>(groupStats.map(s => [s.facultyId, s]));

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
    },
    ['rmf-faculties-list'],
    { tags: ['rmf-faculties'], revalidate: 300 } // 5 min cache
  )();
}

export async function getFacultyDetails(id: string) {
  if (!id) return null;

  return unstable_cache(
    async (facultyId: string) => {
      const [faculty, stats, rawReviews] = await Promise.all([
        prisma.faculty.findUnique({ where: { id: facultyId } }),
        prisma.rating.aggregate({
          where: { facultyId },
          _avg: {
            teachingClarity: true,
            approachability: true,
            gradingFairness: true,
            punctuality: true,
            partiality: true,
            behaviour: true,
          },
          _count: true,
        }),
        prisma.rating.findMany({
          where: { facultyId, review: { not: null } },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      if (!faculty) return null;

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
    },
    [`faculty-details-${id}`],
    { tags: [`faculty-${id}`], revalidate: 60 } // 1 min cache
  )(id);
}

export async function getTodayRatings() {
  void syncUserToDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return unstable_cache(
    async () => {
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
    },
    [`rmf-today-ratings-${today.getTime()}`],
    { tags: ['rmf-today'], revalidate: 30 } // 30 sec cache
  )();
}
