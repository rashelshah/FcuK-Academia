import 'server-only';

import fs from 'node:fs/promises';
import path from 'node:path';

import { getDashboardData } from '@/lib/server/academia';
import {
  getSessionSnapshot,
  setSessionSnapshot,
  updateUserSession,
  type SessionSnapshot,
  type UserSession,
} from '@/lib/server/session';

const SNAPSHOT_TTL_MS = 1000 * 60 * 2;
const SESSION_DIR = path.join(process.cwd(), '.session-store');

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
    };
  }

  if (cached && !isSnapshotUsable(cached)) {
    await fs.rm(path.join(SESSION_DIR, `${sessionId}.snapshot.json`), { force: true });
  }

  const result = await getDashboardData(session.cookies);
  if (result.status !== 200) {
    return {
      snapshot: null,
      refreshed: false,
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
    updateUserSession(sessionId, {
      ...session,
      cookies: result.cookies,
    }),
  ]);

  return {
    snapshot,
    refreshed: true,
  };
}
