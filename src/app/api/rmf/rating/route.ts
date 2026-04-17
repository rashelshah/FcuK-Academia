import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/server/session';
import { syncUserToDb } from '@/lib/server/user-sync';

export async function POST(request: Request) {
  try {
    const session = await getUserSession();
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Unauthorized: You must be logged in to rate.' }, { status: 401 });
    }

    // Sync user data to DB (async background sync)
    // Ratings remain anonymous as they only store a ratingHash, not a userId.
    void syncUserToDb();

    const body = await request.json();
    const {
      facultyId,
      teachingClarity,
      approachability,
      gradingFairness,
      punctuality,
      partiality,
      behaviour,
      review,
    } = body;

    if (
      !facultyId ||
      typeof teachingClarity !== 'number' ||
      typeof approachability !== 'number' ||
      typeof gradingFairness !== 'number' ||
      typeof punctuality !== 'number' ||
      typeof partiality !== 'number' ||
      typeof behaviour !== 'number'
    ) {
      return NextResponse.json({ error: 'Missing or invalid rating parameters' }, { status: 400 });
    }

    const secret = process.env.RMF_HASH_SECRET || 'fallback-secret-if-missing';
    const ratingHash = crypto
      .createHash('sha256')
      .update(session.email + facultyId + secret)
      .digest('hex');

    const result = await prisma.rating.create({
      data: {
        facultyId,
        teachingClarity,
        approachability,
        gradingFairness,
        punctuality,
        partiality,
        behaviour,
        review: review?.trim() || null,
        ratingHash,
      },
    });

    return NextResponse.json({ success: true, rating: result });
  } catch (error: any) {
    console.error('Failed to submit rating:', error);
    // P2002 is Prisma's unique constraint violation code
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You have already dropped a rating for this faculty. Exposure logged once.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
