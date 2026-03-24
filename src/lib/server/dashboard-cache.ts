import 'server-only';

import { getDashboardData } from '@/lib/server/academia';
import {
  clearSessionSnapshot,
  getSessionSnapshot,
  setSessionSnapshot,
  type SessionSnapshot,
  type UserSession,
} from '@/lib/server/session';

const SNAPSHOT_TTL_MS = 1000 * 60 * 2;

function isSnapshotUsable(snapshot: SessionSnapshot) {
  const hasName = Boolean(snapshot.userInfo.name?.trim());
  const hasRealMarks = snapshot.markList.some((item) => item.total.maxMark > 0);
  const hasCalendarMonth = snapshot.calendar.some((month) => month.month && month.month.toLowerCase() !== 'dt');
  return hasName && hasCalendarMonth && (hasRealMarks || snapshot.markList.length === 0);
}

export async function getCachedDashboardData(sessionId: string, session: UserSession) {
  const cached = await getSessionSnapshot(sessionId);
  if (cached && Date.now() - cached.updatedAt < SNAPSHOT_TTL_MS && isSnapshotUsable(cached)) {
    return {
      snapshot: cached,
      refreshed: false,
      session,
    };
  }

  if (cached && !isSnapshotUsable(cached)) {
    await clearSessionSnapshot(sessionId);
  }

  const result = await getDashboardData(session.cookies);
  if (result.status !== 200) {
    return {
      snapshot: null,
      refreshed: false,
      session,
      error: result.error ?? 'session expired',
    };
  }

  const snapshot: SessionSnapshot = {
    userInfo: result.userInfo,
    attendance: result.attendance,
    markList: result.markList,
    timetable: result.timetable,
    calendar: result.calendar,
    updatedAt: Date.now(),
  };

  await Promise.all([
    setSessionSnapshot(sessionId, snapshot),
  ]);

  return {
    snapshot,
    refreshed: true,
    session: {
      ...session,
      cookies: result.cookies,
    },
  };
}
