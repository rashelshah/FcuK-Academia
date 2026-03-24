import 'server-only';

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { SESSION_COOKIE } from '@/lib/auth-constants';
import type {
  RawAttendanceItem,
  RawCalendarMonth,
  RawMarkItem,
  RawTimetableItem,
  RawUserInfo,
  SessionCookies,
} from '@/lib/server/academia';

const SESSION_TTL_SECONDS = 60 * 60 * 12;
const SESSION_DIR = process.env.NODE_ENV === 'production' 
  ? path.join('/tmp', '.session-store')
  : path.join(process.cwd(), '.session-store');

export interface UserSession {
  email: string;
  cookies: SessionCookies;
  createdAt: number;
}

export interface SessionSnapshot {
  userInfo: RawUserInfo;
  attendance: RawAttendanceItem[];
  markList: RawMarkItem[];
  timetable: RawTimetableItem[];
  calendar: RawCalendarMonth[];
  updatedAt: number;
}

async function ensureSessionDir() {
  await fs.mkdir(SESSION_DIR, { recursive: true });
}

function getSessionPath(sessionId: string) {
  return path.join(SESSION_DIR, `${sessionId}.json`);
}

function getSnapshotPath(sessionId: string) {
  return path.join(SESSION_DIR, `${sessionId}.snapshot.json`);
}

async function readSession(sessionId: string) {
  try {
    const raw = await fs.readFile(getSessionPath(sessionId), 'utf8');
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export async function getUserSession() {
  const { cookies } = await import('next/headers');
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await readSession(sessionId);
  if (!session) return null;

  if (Date.now() - session.createdAt > SESSION_TTL_SECONDS * 1000) {
    await fs.rm(getSessionPath(sessionId), { force: true });
    return null;
  }

  return session;
}

export async function setUserSession(session: UserSession) {
  await ensureSessionDir();
  const sessionId = crypto.randomBytes(24).toString('hex');
  await fs.writeFile(getSessionPath(sessionId), JSON.stringify(session), 'utf8');
  return sessionId;
}

export async function updateUserSession(sessionId: string, session: UserSession) {
  await ensureSessionDir();
  await fs.writeFile(getSessionPath(sessionId), JSON.stringify(session), 'utf8');
}

export async function getSessionSnapshot(sessionId: string) {
  try {
    const raw = await fs.readFile(getSnapshotPath(sessionId), 'utf8');
    return JSON.parse(raw) as SessionSnapshot;
  } catch {
    return null;
  }
}

export async function setSessionSnapshot(sessionId: string, snapshot: SessionSnapshot) {
  await ensureSessionDir();
  await fs.writeFile(getSnapshotPath(sessionId), JSON.stringify(snapshot), 'utf8');
}

export async function clearUserSession(sessionId?: string | null) {
  const activeSessionId = sessionId ?? null;
  if (activeSessionId) {
    await fs.rm(getSessionPath(activeSessionId), { force: true });
    await fs.rm(getSnapshotPath(activeSessionId), { force: true });
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function getExpiredSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
}

export async function getCurrentSessionId() {
  const { cookies } = await import('next/headers');
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function clearCurrentUserSession() {
  const sessionId = await getCurrentSessionId();
  if (sessionId) {
    await fs.rm(getSessionPath(sessionId), { force: true });
    await fs.rm(getSnapshotPath(sessionId), { force: true });
  }
}
