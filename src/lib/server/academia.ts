import 'server-only';

import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import * as cheerio from 'cheerio';
import { CookieJar } from 'tough-cookie';
import { promisify } from 'node:util';

const BASE_URL = 'https://academia.srmist.edu.in';
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  Origin: BASE_URL,
  Referer: `${BASE_URL}/`,
};

const URLS = {
  profile: '/srm_university/academia-academic-services/page/My_Time_Table_2023_24',
  attendance: '/srm_university/academia-academic-services/page/My_Attendance',
  gridBase: '/srm_university/academia-academic-services/page/Unified_Time_Table_2025',
  planner: '/srm_university/academia-academic-services/page/Academic_Planner_2025_26_EVEN',
} as const;

const execFileAsync = promisify(execFile);

export type SessionCookies = Record<string, string>;

export interface VerifyUserResponse {
  data: {
    lookup: {
      identifier: string;
      digest: string;
    };
  };
  status_code: number;
  message: string;
}

export interface VerifyPasswordResponse {
  data?: {
    cookies?: SessionCookies;
    statusCode: number;
    message?: string;
    captcha?: {
      required: boolean;
      digest: string | null;
      image?: string;
    };
  };
  isAuthenticated?: boolean;
  error?: string;
  errorReason?: unknown;
}

export interface RawAttendanceItem {
  courseCode: string;
  courseTitle: string;
  courseCategory: string;
  courseFaculty: string;
  courseSlot: string;
  courseConducted: number;
  courseAbsent: number;
  courseAttendance: string;
}

export interface RawMarkItem {
  course: string;
  category: string;
  marks: {
    exam: string;
    obtained: number;
    maxMark: number;
  }[];
  total: {
    obtained: number;
    maxMark: number;
  };
}

export interface RawCourseItem {
  courseCode: string;
  courseTitle: string;
  courseCredit: string;
  courseCategory: string;
  courseType: string;
  courseFaculty: string;
  courseSlot: string[];
  courseRoomNo: string;
}

export interface RawTimetableItem {
  dayOrder: string;
  class: {
    slot: string;
    isClass: boolean;
    courseTitle?: string;
    courseCode?: string;
    courseType?: string;
    courseCategory?: string;
    courseRoomNo?: string;
    faculty?: string;
    time: string;
  }[];
}

export interface RawCalendarMonth {
  month: string;
  days: {
    date: string;
    day: string;
    event: string;
    dayOrder: string;
  }[];
}

export interface RawUserInfo {
  regNumber: string;
  name: string;
  mobile: string;
  section: string;
  program: string;
  department: string;
  semester: string;
  batch: string;
}

function cleanText(value: string | undefined | null) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function decodeEscapedHtml(value: string) {
  return value
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, '\'')
    .replace(/\\\\/g, '\\')
    .replace(/\\\//g, '/')
    .replace(/\\-/g, '-');
}

function isValidSrmEmail(email: string) {
  return /^[A-Za-z0-9._%+-]+@srmist\.edu\.in$/i.test(email.trim());
}

interface SessionContainer {
  client: AxiosInstance;
  jar: CookieJar;
}

function isSessionContainer(value: SessionCookies | SessionContainer): value is SessionContainer {
  return 'client' in value && 'jar' in value;
}

async function createSessionClient(cookies: SessionCookies = {}) {
  const jar = new CookieJar();

  for (const [name, value] of Object.entries(cookies)) {
    await jar.setCookie(`${name}=${value}`, BASE_URL);
  }

  const client = wrapper(axios.create({
    jar,
    withCredentials: true,
    headers: DEFAULT_HEADERS,
    timeout: 30000,
    maxRedirects: 10,
    validateStatus: () => true,
  }));

  return { client, jar };
}

async function jarToCookies(jar: CookieJar): Promise<SessionCookies> {
  const cookies = await jar.getCookies(BASE_URL);
  return cookies.reduce<SessionCookies>((acc, cookie) => {
    acc[cookie.key] = cookie.value;
    return acc;
  }, {});
}

function extractDecodedHtml(rawHtml: string) {
  if (!rawHtml) return null;

  if (rawHtml.toLowerCase().includes('concurrent') && rawHtml.toLowerCase().includes('terminate')) {
    return 'CONCURRENT_ERROR';
  }

  const sanitizerMatch = rawHtml.match(/pageSanitizer\.sanitize\('([\s\S]+?)'\)/);
  if (sanitizerMatch?.[1]) {
    try {
      return decodeEscapedHtml(sanitizerMatch[1]);
    } catch {
      // Ignore and fall through.
    }
  }

  const $ = cheerio.load(rawHtml);
  const hidden = $('div.zc-pb-embed-placeholder-content').first();
  const zmlValue = hidden.attr('zmlvalue');
  if (zmlValue) {
    return zmlValue
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\\\//g, '/')
      .replace(/\\-/g, '-');
  }

  return null;
}

async function fetchAcademiaPage(path: string, sessionSource: SessionCookies | SessionContainer) {
  const session = isSessionContainer(sessionSource) ? sessionSource : await createSessionClient(sessionSource);
  const response = await session.client.get(`${BASE_URL}${path}`, {
    responseType: 'text',
    maxRedirects: 0,
    validateStatus: () => true,
  });

  const location = String(response.headers.location || '');
  const finalUrl = String(response.request?.res?.responseUrl || '');
  if ([301, 302].includes(response.status) || location.includes('signin') || finalUrl.includes('signin')) {
    return { html: null as string | null, cookies: await jarToCookies(session.jar), session };
  }

  const rawHtml = typeof response.data === 'string' ? response.data : '';
  return {
    html: extractDecodedHtml(rawHtml),
    cookies: await jarToCookies(session.jar),
    session,
  };
}

export async function verifyUser(username: string): Promise<VerifyUserResponse> {
  const normalized = username.trim().toLowerCase();
  if (!isValidSrmEmail(normalized)) {
    throw new Error('Only @srmist.edu.in emails are allowed');
  }

  return {
    data: {
      lookup: {
        identifier: normalized,
        digest: crypto.createHash('sha256').update(normalized).digest('hex'),
      },
    },
    status_code: 200,
    message: 'ok',
  };
}

export async function verifyPassword({
  identifier,
  password,
  captcha,
  cdigest,
}: {
  identifier: string;
  digest?: string;
  password: string;
  captcha?: string;
  cdigest?: string;
}): Promise<VerifyPasswordResponse> {
  return attemptVerifyPassword({
    identifier,
    password,
    captcha,
    cdigest,
  });
}

async function attemptVerifyPassword({
  identifier,
  password,
  captcha,
  cdigest,
}: {
  identifier: string;
  password: string;
  captcha?: string;
  cdigest?: string;
}): Promise<VerifyPasswordResponse> {
  try {
    const scriptPath = process.cwd() + '/scripts/academia_auth.py';
    const payload = JSON.stringify({
        username: identifier,
        password,
        captcha,
        cdigest,
      });
    const { stdout } = await execFileAsync('python3', [scriptPath, payload], {
      maxBuffer: 1024 * 1024,
    });

    const output = String(stdout);
    const result = JSON.parse(output) as
      | { success: true; cookies: SessionCookies }
      | { success: false; error: string | { type?: string; message?: string; cdigest?: string | null; image?: string | null } };

    if (!result.success) {
      if (typeof result.error === 'object' && result.error?.type === 'CAPTCHA_REQUIRED') {
        return {
          data: {
            statusCode: 401,
            message: result.error.message ?? 'Additional verification required',
            captcha: {
              required: true,
              digest: result.error.cdigest ?? null,
              image: result.error.image ?? undefined,
            },
          },
          isAuthenticated: false,
        };
      }

      return {
        data: {
          statusCode: 401,
          message: typeof result.error === 'string' ? result.error : (result.error?.message ?? 'invalid credentials'),
        },
        isAuthenticated: false,
      };
    }

    return {
      data: {
        cookies: result.cookies,
        statusCode: 200,
        message: 'authenticated',
        captcha: {
          required: false,
          digest: null,
        },
      },
      isAuthenticated: true,
    };
  } catch (error) {
    return {
      error: 'server error',
      errorReason: error,
    };
  }
}

function parseProfile(htmlContent: string | null): RawUserInfo {
  if (!htmlContent) {
    return {
      regNumber: 'Unknown',
      name: '',
      mobile: 'N/A',
      section: 'N/A',
      program: 'N/A',
      department: 'N/A',
      semester: 'N/A',
      batch: 'N/A',
    };
  }

  const extractValue = (labelText: string) => {
    const escaped = labelText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
      new RegExp(`${escaped}\\s*:?\\s*<\\/td>\\s*<td[^>]*>\\s*<strong[^>]*>([\\s\\S]*?)<\\/strong>`, 'i'),
      new RegExp(`${escaped}\\s*:?\\s*<\\/td>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>`, 'i'),
      new RegExp(`${escaped}\\s*:?\\s*<\\/td>\\s*<td[^>]*>\\s*:?\\s*<\\/td>\\s*<td[^>]*>\\s*<strong[^>]*>([\\s\\S]*?)<\\/strong>`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = htmlContent.match(pattern);
      if (match?.[1]) {
        const text = cleanText(cheerio.load(`<div>${match[1]}</div>`)('div').text());
        if (text) return text;
      }
    }

    return '';
  };

  const departmentRaw = extractValue('Department');
  const sectionMatch = departmentRaw.match(/\(([^)]+Section)\)/i);
  const section = sectionMatch?.[1] ? `(${sectionMatch[1]})` : 'N/A';

  return {
    regNumber: extractValue('Registration Number') || 'Unknown',
    name: extractValue('Name'),
    mobile: extractValue('Mobile') || 'N/A',
    section,
    program: extractValue('Program') || 'N/A',
    department: departmentRaw.replace(section, '').replace(/-\s*$/, '').trim() || departmentRaw || 'N/A',
    semester: extractValue('Semester') || 'N/A',
    batch: extractValue('Batch') || 'N/A',
  };
}

function parseCourseMap(htmlContent: string | null) {
  if (!htmlContent) return new Map<string, RawCourseItem>();

  const $ = cheerio.load(htmlContent);
  const table = $('table').filter((_, el) => $(el).text().includes('Course Code')).first();
  const courseMap = new Map<string, RawCourseItem>();
  if (!table.length) return courseMap;

  const cells = table.find('td').toArray();
  const colCount = 11;
  let startIndex = 0;

  for (let i = 0; i < cells.length; i += 1) {
    const text = cleanText($(cells[i]).text());
    const nextText = cleanText($(cells[i + 1]).text());
    if (text === '1' && (Boolean(nextText.match(/^\d+/)) || nextText.length > 4)) {
      startIndex = i;
      break;
    }
  }

  for (let currentIndex = startIndex; currentIndex + 10 < cells.length; currentIndex += colCount) {
    const cols = cells.slice(currentIndex, currentIndex + colCount);
    const courseCode = cleanText($(cols[1]).text());
    if (!courseCode || courseCode.length < 3) continue;

    const courseTitle = cleanText($(cols[2]).text());
    const courseCredit = cleanText($(cols[3]).text());
    const courseCategory = cleanText($(cols[6]).text());
    let courseFaculty = cleanText($(cols[7]).text());
    if (courseFaculty.includes('Lab Based')) courseFaculty = 'Unknown';
    const slotRaw = cleanText($(cols[8]).text());
    const courseRoomNo = cleanText($(cols[9]).text());
    const slots = slotRaw
      .replace(/[-/,+]/g, ' ')
      .split(/\s+/)
      .map((slot) => slot.trim())
      .filter(Boolean);

    const itemBase = {
      courseCode,
      courseTitle,
      courseCredit,
      courseCategory,
      courseFaculty,
      courseRoomNo,
      courseSlot: slots,
    };

    for (const slot of slots) {
      courseMap.set(slot, {
        ...itemBase,
        courseType: /^(P|L)/i.test(slot) || slot.toUpperCase() === 'LAB' ? 'Practical' : 'Theory',
      });
    }
  }

  return courseMap;
}

function parseAttendance(htmlContent: string | null, courseMap: Map<string, RawCourseItem>): RawAttendanceItem[] {
  if (!htmlContent) return [];
  const $ = cheerio.load(htmlContent);
  const rows = $('tr').toArray();
  const items: RawAttendanceItem[] = [];

  for (const row of rows) {
    const cols = $(row).find('td').toArray();
    if (cols.length < 9) continue;
    const courseCode = cleanText($(cols[0]).text()).replace('Regular', '').trim();
    if (!/^[A-Z0-9]{8,12}/.test(courseCode)) continue;
    const courseSlot = cleanText($(cols[4]).text());
    const course = courseMap.get(courseSlot);
    const conducted = Number(cleanText($(cols[6]).text())) || 0;
    const absent = Number(cleanText($(cols[7]).text())) || 0;
    const attendanceValue = cleanText($(cols[8]).text()) || '0';

    items.push({
      courseCode,
      courseTitle: cleanText($(cols[1]).text()),
      courseCategory: cleanText($(cols[2]).text()),
      courseFaculty: course?.courseFaculty ?? 'Unknown',
      courseSlot,
      courseConducted: conducted,
      courseAbsent: absent,
      courseAttendance: attendanceValue,
    });
  }

  return items;
}

function parseMarks(htmlContent: string | null): RawMarkItem[] {
  if (!htmlContent) return [];
  const $ = cheerio.load(htmlContent);
  const table = $('table').filter((_, el) => $(el).text().includes('Test Performance')).first();
  const rows = (
    table.children('tbody').children('tr').length
      ? table.children('tbody').children('tr')
      : table.children('tr')
  ).toArray();
  const marks: RawMarkItem[] = [];

  for (const row of rows) {
    const cols = $(row).children('td').toArray();
    if (cols.length < 3) continue;

    const course = cleanText($(cols[0]).text());
    if (!/^[A-Z0-9]{8,12}$/.test(course)) continue;

    const category = cleanText($(cols[1]).text());
    const exams: RawMarkItem['marks'] = [];
    let obtainedTotal = 0;
    let maxTotal = 0;

    const pushExam = (header: string, score: string) => {
      const cleanedHeader = cleanText(header);
      const cleanedScore = cleanText(score);
      if (!cleanedHeader || !cleanedScore) return;

      const obtained = Number(cleanedScore.match(/-?\d+(\.\d+)?/)?.[0] ?? '0');
      const [examName, maxMarkText = '0'] = cleanedHeader.split('/');
      const maxMark = Number(cleanText(maxMarkText).match(/-?\d+(\.\d+)?/)?.[0] ?? '0');
      if (!examName.trim()) return;

      exams.push({
        exam: cleanText(examName),
        obtained,
        maxMark,
      });
      obtainedTotal += obtained;
      maxTotal += maxMark;
    };

    $(cols[2]).find('table td').each((_, cell) => {
      const cellHtml = $(cell).html() || '';
      const strongText = cleanText($(cell).find('strong').first().text());
      const remainingText = cleanText(
        cheerio.load(`<div>${cellHtml.replace(/<br\s*\/?>/gi, '\n')}</div>`)('div').text().replace(strongText, ''),
      );

      if (strongText && remainingText) {
        pushExam(strongText, remainingText);
        return;
      }

      const parts = $(cell)
        .text()
        .split(/\n+/)
        .map((part) => cleanText(part))
        .filter(Boolean);

      if (parts.length >= 2) {
        pushExam(parts[0], parts[1]);
      }
    });

    if (!exams.length) {
      const parts = $(cols[2])
        .text()
        .split(/\n+/)
        .map((part) => cleanText(part))
        .filter(Boolean);

      for (let index = 0; index < parts.length - 1; index += 1) {
        const current = parts[index];
        const next = parts[index + 1];
        const headerLike = current.includes('/') || /cat|fat|quiz|lab|assessment|test|model/i.test(current);
        const scoreLike = /^-?\d+(\.\d+)?$/.test(next) || /^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/.test(next);
        if (!headerLike || !scoreLike) continue;

        if (next.includes('/')) {
          const [obtained, maxMark] = next.split('/').map((value) => cleanText(value));
          pushExam(`${current.split('/')[0]}/${maxMark}`, obtained);
        } else {
          pushExam(current, next);
        }
      }
    }

    marks.push({
      course,
      category,
      marks: exams,
      total: {
        obtained: obtainedTotal,
        maxMark: maxTotal,
      },
    });
  }

  return marks;
}

function parseTimetable(htmlContent: string | null, courseMap: Map<string, RawCourseItem>): RawTimetableItem[] {
  if (!htmlContent) return [];
  const $ = cheerio.load(htmlContent);
  const gridTable = $('table').filter((_, el) => {
    const text = $(el).text().toLowerCase();
    return text.includes('day 1') && text.includes('08:00');
  }).first();

  if (!gridTable.length) return [];

  const rows = gridTable.find('tr').toArray();
  const timeHeaders = rows.length
    ? $(rows[0])
        .find('td,th')
        .toArray()
        .map((cell) => cleanText($(cell).text()))
        .filter((text) => text.includes(':') && !text.toLowerCase().includes('day'))
    : [];

  const timetable: RawTimetableItem[] = [];

  for (const row of rows) {
    const cols = $(row).find('td').toArray();
    if (!cols.length) continue;
    const dayText = cleanText($(cols[0]).text());
    const dayMatch = dayText.match(/Day\s*(\d+)/i);
    if (!dayMatch) continue;

    const classes = cols.slice(1).map((cell, index) => {
      const rawSlot = cleanText($(cell).text());
      const slot = rawSlot.split('/')[0].trim();
      const course = slot ? courseMap.get(slot) : undefined;
      return {
        slot,
        isClass: Boolean(slot && slot !== '-' && course),
        courseTitle: course?.courseTitle,
        courseCode: course?.courseCode,
        courseType: course?.courseType,
        courseCategory: course?.courseCategory,
        courseRoomNo: course?.courseRoomNo,
        faculty: course?.courseFaculty,
        time: timeHeaders[index] ?? '',
      };
    });

    timetable.push({
      dayOrder: dayMatch[1],
      class: classes.filter((item) => item.time),
    });
  }

  return timetable;
}

function parseCalendar(htmlContent: string | null): RawCalendarMonth[] {
  if (!htmlContent) return [];
  const tableMatch = htmlContent.match(/<table[^>]*>[\s\S]*?<\/table>/i);
  if (!tableMatch?.[0]) return [];

  const tableHtml = tableMatch[0];
  const decodeCell = (cellHtml: string) => cleanText(cheerio.load(`<div>${cellHtml}</div>`)('div').text());
  const rowMatches = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  if (!rowMatches.length) return [];

  const monthHeaders = [...rowMatches[0][1].matchAll(/>(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*'?\s*(\d{2})</gi)]
    .map((match) => `${match[1]} '${match[2]}`);
  if (!monthHeaders.length) return [];

  const months: RawCalendarMonth[] = monthHeaders.map((month) => ({ month, days: [] }));

  for (const rowMatch of rowMatches.slice(1)) {
    const cells = [...rowMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => decodeCell(match[1]));
    if (!cells.length) continue;

    for (let blockIndex = 0; blockIndex < monthHeaders.length; blockIndex += 1) {
      const start = blockIndex * 5;
      if (start + 3 >= cells.length) continue;

      const date = cleanText(cells[start]);
      if (!/^\d+$/.test(date)) continue;

      months[blockIndex]?.days.push({
        date,
        day: cleanText(cells[start + 1]),
        event: cleanText(cells[start + 2]),
        dayOrder: cleanText(cells[start + 3]) || '-',
      });
    }
  }

  return months
    .map((month) => ({
      ...month,
      days: month.days.filter((day, index, array) =>
        array.findIndex((item) => item.date === day.date) === index,
      ),
    }))
    .filter((month) => month.days.length > 0);
}

async function getProfileAndCourses(cookies: SessionCookies) {
  const session = await createSessionClient(cookies);
  const profilePage = await fetchAcademiaPage(URLS.profile, session);
  const userInfo = parseProfile(profilePage.html);
  const courseMap = parseCourseMap(profilePage.html);
  return {
    userInfo,
    courseMap,
    cookies: profilePage.cookies,
    session,
    profileHtml: profilePage.html,
    isAuthenticated: Boolean(profilePage.html),
  };
}

export async function stabilizeSession(cookies: SessionCookies) {
  const {
    userInfo,
    courseMap,
    session,
    cookies: profileCookies,
    profileHtml,
    isAuthenticated,
  } = await getProfileAndCourses(cookies);
  const attendancePage = await fetchAcademiaPage(URLS.attendance, session);
  const markList = parseMarks(attendancePage.html);
  const attendance = parseAttendance(attendancePage.html, courseMap);

  return {
    userInfo,
    courseMap,
    attendance,
    markList,
    cookies: attendancePage.cookies,
    status: isAuthenticated && attendancePage.html ? 200 : 401,
    error: isAuthenticated && attendancePage.html ? undefined : 'session expired',
    profileCookies,
    profileHtml,
  };
}

export async function getDashboardData(cookies: SessionCookies) {
  const { userInfo, courseMap, session, isAuthenticated } = await getProfileAndCourses(cookies);
  if (!isAuthenticated) {
    return {
      userInfo,
      attendance: [] as RawAttendanceItem[],
      markList: [] as RawMarkItem[],
      timetable: [] as RawTimetableItem[],
      calendar: [] as RawCalendarMonth[],
      cookies,
      status: 401,
      error: 'session expired',
    };
  }

  const batch = String(userInfo.batch).toLowerCase().trim() === '1' ? 'Batch_1' : 'batch_2';
  const [attendancePage, gridPage, plannerPage] = await Promise.all([
    fetchAcademiaPage(URLS.attendance, session),
    fetchAcademiaPage(`${URLS.gridBase}_${batch}`, session),
    fetchAcademiaPage(URLS.planner, session),
  ]);

  return {
    userInfo,
    attendance: parseAttendance(attendancePage.html, courseMap),
    markList: parseMarks(attendancePage.html),
    timetable: parseTimetable(gridPage.html, courseMap),
    calendar: parseCalendar(plannerPage.html),
    cookies: plannerPage.cookies,
    status: attendancePage.html ? 200 : 401,
    error: attendancePage.html ? undefined : 'session expired',
  };
}

export async function getUserInfo(cookies: SessionCookies) {
  const { userInfo, isAuthenticated } = await getProfileAndCourses(cookies);
  return { userInfo, status: isAuthenticated ? 200 : 401, error: isAuthenticated ? undefined : 'session expired' };
}

export async function getCourse(cookies: SessionCookies) {
  const { courseMap, userInfo, isAuthenticated } = await getProfileAndCourses(cookies);
  const deduped = new Map<string, RawCourseItem>();
  for (const course of courseMap.values()) {
    if (!deduped.has(course.courseCode)) deduped.set(course.courseCode, course);
  }
  return {
    courseList: [...deduped.values()],
    batch: userInfo.batch,
    status: isAuthenticated ? 200 : 401,
    error: isAuthenticated ? undefined : 'session expired',
  };
}

export async function getAttendance(cookies: SessionCookies) {
  const { courseMap, session, isAuthenticated } = await getProfileAndCourses(cookies);
  const attendancePage = await fetchAcademiaPage(URLS.attendance, session);
  const attendance = parseAttendance(attendancePage.html, courseMap);
  return {
    attendance,
    status: isAuthenticated && attendancePage.html ? 200 : 401,
    error: isAuthenticated && attendancePage.html ? undefined : 'session expired',
  };
}

export async function getMarks(cookies: SessionCookies) {
  const attendancePage = await fetchAcademiaPage(URLS.attendance, cookies);
  const markList = parseMarks(attendancePage.html);
  return {
    markList,
    status: attendancePage.html ? 200 : 401,
    error: attendancePage.html ? undefined : 'session expired',
  };
}

export async function getTimetable(cookies: SessionCookies) {
  const { userInfo, courseMap, session, isAuthenticated } = await getProfileAndCourses(cookies);
  const batch = String(userInfo.batch).toLowerCase().trim() === '1' ? 'Batch_1' : 'batch_2';
  const gridPage = await fetchAcademiaPage(`${URLS.gridBase}_${batch}`, session);
  const timetable = parseTimetable(gridPage.html, courseMap);
  return {
    timetable,
    status: isAuthenticated && gridPage.html ? 200 : 401,
    error: isAuthenticated && gridPage.html ? undefined : 'session expired',
  };
}

export async function getCalendar(cookies: SessionCookies) {
  const plannerPage = await fetchAcademiaPage(URLS.planner, cookies);
  const calendar = parseCalendar(plannerPage.html);
  return {
    calendar,
    status: plannerPage.html ? 200 : 401,
    error: plannerPage.html ? undefined : 'session expired',
  };
}

export async function logoutUser() {
  return {
    message: 'logged out',
    status: 200,
  };
}
