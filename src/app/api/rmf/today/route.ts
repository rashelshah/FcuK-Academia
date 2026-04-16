import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
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

    return NextResponse.json(ratings);
  } catch (error) {
    console.error('Failed to fetch today ratings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
