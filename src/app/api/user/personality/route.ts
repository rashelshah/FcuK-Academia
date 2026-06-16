import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/server/session';
import { handleRouteError } from '@/lib/server/route-utils';

export async function POST(request: Request) {
  try {
    const session = await getUserSession();
    
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { personalityMode } = await request.json();

    if (!personalityMode) {
      return NextResponse.json({ error: 'personalityMode is required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { email: session.email },
      data: { personalityMode },
    });

    return NextResponse.json({ success: true, personalityMode: user.personalityMode });
  } catch (error) {
    return handleRouteError(error);
  }
}
