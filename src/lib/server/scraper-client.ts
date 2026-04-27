import 'server-only';

import type {
  SessionCookies,
  RawAttendanceItem,
  RawCalendarMonth,
  RawCourseItem,
  RawMarkItem,
  RawTimetableItem,
  RawUserInfo,
  VerifyPasswordResponse,
} from '@/lib/server/academia';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SCRAPER_URL = process.env.SCRAPER_SERVICE_URL ?? '';
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY ?? '';
const TIMEOUT_MS = 25000; // 25 s — academia pages can be slow

// ---------------------------------------------------------------------------
// Return types mirroring academia.ts exported functions
// ---------------------------------------------------------------------------

export interface DashboardDataResult {
  userInfo: RawUserInfo;
  attendance: RawAttendanceItem[];
  markList: RawMarkItem[];
  timetable: RawTimetableItem[];
  calendar: RawCalendarMonth[];
  plannerUrl?: string;
  cookies: SessionCookies;
  status: number;
  error?: string;
}

export interface CalendarResult {
  calendar: RawCalendarMonth[];
  cookies: SessionCookies;
  status: number;
  error?: string;
}

export interface CourseResult {
  courseList: RawCourseItem[];
  batch: string;
  cookies: SessionCookies;
  status: number;
  error?: string;
}

export interface AttendanceResult {
  attendance: RawAttendanceItem[];
  cookies: SessionCookies;
  status: number;
  error?: string;
}

export interface MarksResult {
  markList: RawMarkItem[];
  cookies: SessionCookies;
  status: number;
  error?: string;
}

export interface TimetableResult {
  timetable: RawTimetableItem[];
  cookies: SessionCookies;
  status: number;
  error?: string;
}

export interface UserInfoResult {
  userInfo: RawUserInfo;
  cookies: SessionCookies;
  status: number;
  error?: string;
}

export interface StabilizeResult {
  userInfo: RawUserInfo;
  attendance: RawAttendanceItem[];
  markList: RawMarkItem[];
  cookies: SessionCookies;
  status: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function callScraperEndpoint<T>(body: Record<string, unknown>): Promise<T> {
  if (!SCRAPER_URL) {
    throw new Error('[scraper-client] SCRAPER_SERVICE_URL is not set — cannot call external scraper');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${SCRAPER_URL}/api/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SCRAPER_API_KEY,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Scraper responded ${response.status}: ${text}`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Public API — mirrors academia.ts exported functions exactly.
// In dev, if SCRAPER_SERVICE_URL is unset, falls back to local implementations.
// ---------------------------------------------------------------------------

async function getLocalAcademia() {
  return import('@/lib/server/academia');
}

export async function getDashboardData(cookies: SessionCookies): Promise<DashboardDataResult> {
  if (!SCRAPER_URL) {
    const academia = await getLocalAcademia();
    return academia.getDashboardData(cookies) as Promise<DashboardDataResult>;
  }
  const { plannerUrl, ...cookiesOnly } = cookies as SessionCookies & { plannerUrl?: string };
  return callScraperEndpoint<DashboardDataResult>({ action: 'getDashboardData', cookies: cookiesOnly, plannerUrl });
}

export async function stabilizeSession(cookies: SessionCookies): Promise<StabilizeResult> {
  if (!SCRAPER_URL) {
    const academia = await getLocalAcademia();
    return academia.stabilizeSession(cookies) as Promise<StabilizeResult>;
  }
  return callScraperEndpoint<StabilizeResult>({ action: 'stabilizeSession', cookies });
}

export async function getCalendar(cookies: SessionCookies): Promise<CalendarResult> {
  if (!SCRAPER_URL) {
    const academia = await getLocalAcademia();
    return academia.getCalendar(cookies) as Promise<CalendarResult>;
  }
  return callScraperEndpoint<CalendarResult>({ action: 'getCalendar', cookies });
}

export async function getCourse(cookies: SessionCookies): Promise<CourseResult> {
  if (!SCRAPER_URL) {
    const academia = await getLocalAcademia();
    return academia.getCourse(cookies) as Promise<CourseResult>;
  }
  return callScraperEndpoint<CourseResult>({ action: 'getCourse', cookies });
}

export async function getAttendance(cookies: SessionCookies): Promise<AttendanceResult> {
  if (!SCRAPER_URL) {
    const academia = await getLocalAcademia();
    return academia.getAttendance(cookies) as Promise<AttendanceResult>;
  }
  return callScraperEndpoint<AttendanceResult>({ action: 'getAttendance', cookies });
}

export async function getMarks(cookies: SessionCookies): Promise<MarksResult> {
  if (!SCRAPER_URL) {
    const academia = await getLocalAcademia();
    return academia.getMarks(cookies) as Promise<MarksResult>;
  }
  return callScraperEndpoint<MarksResult>({ action: 'getMarks', cookies });
}

export async function getTimetable(cookies: SessionCookies): Promise<TimetableResult> {
  if (!SCRAPER_URL) {
    const academia = await getLocalAcademia();
    return academia.getTimetable(cookies) as Promise<TimetableResult>;
  }
  return callScraperEndpoint<TimetableResult>({ action: 'getTimetable', cookies });
}

export async function getUserInfo(cookies: SessionCookies): Promise<UserInfoResult> {
  if (!SCRAPER_URL) {
    const academia = await getLocalAcademia();
    return academia.getUserInfo(cookies) as Promise<UserInfoResult>;
  }
  return callScraperEndpoint<UserInfoResult>({ action: 'getUserInfo', cookies });
}

export async function verifyPassword(params: {
  identifier: string;
  password: string;
  captcha?: string;
  cdigest?: string;
}): Promise<VerifyPasswordResponse> {
  if (!SCRAPER_URL) {
    const academia = await getLocalAcademia();
    return academia.verifyPassword(params);
  }
  return callScraperEndpoint<VerifyPasswordResponse>({ action: 'verifyPassword', ...params });
}

// ---------------------------------------------------------------------------
// Google Drive — proxied to /api/drive on the scraper service.
// ---------------------------------------------------------------------------

export interface DriveFileResult {
  name: string;
  type: 'pyq' | 'notes' | 'ct' | 'unknown';
  year: number | null;
  url: string;
}

async function callDriveEndpoint<T>(body: Record<string, unknown>): Promise<T> {
  if (!SCRAPER_URL) {
    throw new Error('[scraper-client] SCRAPER_SERVICE_URL is not set');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${SCRAPER_URL}/api/drive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SCRAPER_API_KEY,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Drive scraper responded ${response.status}: ${text}`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

async function getLocalDrive() {
  return import('@/lib/drive');
}

export async function getSemesters(): Promise<number[]> {
  if (!SCRAPER_URL) {
    const drive = await getLocalDrive();
    return drive.getSemesters();
  }
  const result = await callDriveEndpoint<{ semesters: number[] }>({ action: 'getSemesters' });
  return result.semesters;
}

export async function getSubjects(semester: string | number): Promise<string[]> {
  if (!SCRAPER_URL) {
    const drive = await getLocalDrive();
    return drive.getSubjects(semester);
  }
  const result = await callDriveEndpoint<{ subjects: string[] }>({ action: 'getSubjects', semester });
  return result.subjects;
}

export async function getFiles(semester: string | number, subject: string): Promise<DriveFileResult[]> {
  if (!SCRAPER_URL) {
    const drive = await getLocalDrive();
    return drive.getFiles(semester, subject) as Promise<DriveFileResult[]>;
  }
  const result = await callDriveEndpoint<{ files: DriveFileResult[] }>({ action: 'getFiles', semester, subject });
  return result.files;
}

export async function revalidateDriveCache(): Promise<void> {
  if (!SCRAPER_URL) {
    const drive = await getLocalDrive();
    await drive.getDriveData(true);
    return;
  }
  await callDriveEndpoint<{ success: boolean }>({ action: 'revalidate', forceRefresh: true });
}

