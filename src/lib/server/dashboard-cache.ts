import 'server-only';

import { getDashboardData } from '@/lib/server/scraper-client';
import {
  clearSessionSnapshot,
  getSessionSnapshot,
  setSessionSnapshot,
  type SessionSnapshot,
  type UserSession,
} from '@/lib/server/session';

const SNAPSHOT_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const SESSION_REFRESH_THRESHOLD_MS = 1000 * 60 * 60; // 1 hour

function isSnapshotUsable(snapshot: SessionSnapshot) {
  const hasName = Boolean(snapshot.userInfo.name?.trim());
  const hasRealMarks = snapshot.markList.some((item) => item.total.maxMark > 0);
  const hasCalendarMonth = snapshot.calendar.some((month) => month.month && month.month.toLowerCase() !== 'dt');
  return hasName && hasCalendarMonth && (hasRealMarks || snapshot.markList.length === 0);
}

export async function getCachedDashboardData(sessionId: string, session: UserSession, options?: { forceRefresh?: boolean }) {
  const forceRefresh = options?.forceRefresh ?? false;
  const cached = await getSessionSnapshot(sessionId);
  
  // Decide if we should refresh the app session timestamp (throttled to once per hour)
  let updatedSession = session;
  if (Date.now() - session.lastRefreshedAt > SESSION_REFRESH_THRESHOLD_MS) {
    updatedSession = {
      ...session,
      lastRefreshedAt: Date.now(),
    };
  }

  if (!forceRefresh && cached && Date.now() - cached.updatedAt < SNAPSHOT_TTL_MS && isSnapshotUsable(cached)) {
    return {
      snapshot: cached,
      refreshed: false,
      session: updatedSession,
    };
  }

  if (cached && !isSnapshotUsable(cached)) {
    await clearSessionSnapshot(sessionId);
  }

  const result = await getDashboardData({
    ...session.cookies,
    plannerUrl: session.plannerUrl,
  } as any);
  if (result.status !== 200) {
    return {
      snapshot: cached || null,
      refreshed: false,
      session: updatedSession,
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
      ...updatedSession,
      cookies: result.cookies,
      plannerUrl: result.plannerUrl || updatedSession.plannerUrl,
    },
  };
}
