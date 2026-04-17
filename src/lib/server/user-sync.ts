import 'server-only';
import prisma from '@/lib/prisma';
import { getUserSession, getCurrentSessionId, getSessionSnapshot } from '@/lib/server/session';

/**
 * Synchronizes the current session user to the database's User table.
 * This ensures we can track user engagement while keeping specific actions (like ratings) anonymous.
 * Uses upsert on the unique email field to prevent duplicate user records.
 */
export async function syncUserToDb() {
  try {
    // 1. Get the current session
    const session = await getUserSession();
    if (!session || !session.email) {
      return null;
    }

    // 2. Get the session ID to fetch the snapshot (which contains the real name)
    const sessionId = await getCurrentSessionId();
    let name = null;
    
    if (sessionId) {
      const snapshot = await getSessionSnapshot(sessionId);
      name = snapshot?.userInfo?.name || null;
    }

    // 3. Upsert the user into the database
    // email is marked as @unique in the schema, preventing duplicates
    const user = await prisma.user.upsert({
      where: { 
        email: session.email 
      },
      update: { 
        name: name || undefined // Only update if we have a name
      },
      create: {
        email: session.email,
        name: name,
      },
    });

    return user;
  } catch (error) {
    // We catch and log but don't throw to avoid breaking the main request flow
    console.error('[UserSync] Failed to sync user to DB:', error);
    return null;
  }
}
