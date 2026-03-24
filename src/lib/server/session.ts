import 'server-only';

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
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
const SESSION_SECRET_FALLBACK = 'fcuk-academia-session-secret';
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

function getSnapshotPath(sessionId: string) {
  return path.join(SESSION_DIR, `${sessionId}.snapshot.json`);
}

function getSessionSecret() {
  return (
    process.env.SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    SESSION_SECRET_FALLBACK
  );
}

function getSessionKey() {
  return crypto.createHash('sha256').update(getSessionSecret()).digest();
}

function createSessionId(cookieValue: string) {
  return crypto.createHash('sha256').update(cookieValue).digest('hex').slice(0, 32);
}

function encodeSession(session: UserSession) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getSessionKey(), iv);
  const plaintext = JSON.stringify(session);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

function decodeSession(value: string) {
  try {
    const payload = Buffer.from(value, 'base64url');
    if (payload.length <= 28) return null;

    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', getSessionKey(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    return JSON.parse(decrypted) as UserSession;
  } catch {
    return null;
  }
}

export async function getUserSession() {
  const { cookies } = await import('next/headers');
  const store = await cookies();
  const cookieValue = store.get(SESSION_COOKIE)?.value;
  if (!cookieValue) return null;

  const session = decodeSession(cookieValue);
  if (!session) return null;

  if (Date.now() - session.createdAt > SESSION_TTL_SECONDS * 1000) {
    return null;
  }

  return session;
}

export async function setUserSession(session: UserSession) {
  return encodeSession(session);
}

export async function updateUserSession(sessionId: string, session: UserSession) {
  void sessionId;
  return encodeSession(session);
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

export async function clearSessionSnapshot(sessionId: string) {
  await fs.rm(getSnapshotPath(sessionId), { force: true });
}

export async function clearUserSession(sessionId?: string | null) {
  const activeSessionId = sessionId ?? null;
  if (activeSessionId) {
    await clearSessionSnapshot(activeSessionId);
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
  const cookieValue = store.get(SESSION_COOKIE)?.value;
  if (!cookieValue) return null;
  return createSessionId(cookieValue);
}

export async function clearCurrentUserSession() {
  const sessionId = await getCurrentSessionId();
  if (sessionId) {
    await clearSessionSnapshot(sessionId);
  }
}

export function applySessionCookie(response: NextResponse, session: UserSession) {
  response.cookies.set(SESSION_COOKIE, encodeSession(session), getSessionCookieOptions());
  return response;
}
