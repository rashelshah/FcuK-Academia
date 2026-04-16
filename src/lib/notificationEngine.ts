'use client';

import {
  getCalendarEntryForDate,
  getClassWindow,
  getClassesForDay,
  getCriticalAttendance,
  getNextCalendarEntry,
  getMarksPercentage,
  isCalendarHoliday,
  toCalendarDate,
} from '@/lib/academia-ui';
import {
  getStoredMarksSnapshot,
  hasSeenNotification,
  markNotificationSeen,
  setStoredMarksSnapshot,
} from '@/lib/notifications/storage';
import type { NotificationPayload } from '@/lib/notifications/types';
import type {
  RawAttendanceItem,
  RawCalendarMonth,
  RawMarkItem,
  RawTimetableItem,
} from '@/lib/server/academia';

interface NotificationEngineInput {
  attendance: RawAttendanceItem[];
  markList: RawMarkItem[];
  timetable: RawTimetableItem[];
  calendar: RawCalendarMonth[];
  now?: Date;
}

const CLASS_REMINDER_LEAD_MINUTES = 30;

interface MarksSnapshot {
  signature: string;
  percentage: number;
  totalObtained: number;
  updatedAt: string;
}

function formatSubjectName(subject?: string) {
  return (subject || 'class').trim().toLowerCase();
}

function getMarksSnapshot(markList: RawMarkItem[], now: Date): MarksSnapshot {
  const percentage = Number(getMarksPercentage(markList).toFixed(2));
  const totalObtained = Number(
    markList.reduce((sum, item) => sum + (Number.isFinite(item.total.obtained) ? item.total.obtained : 0), 0).toFixed(2),
  );
  const signature = markList
    .filter((item) => item.total.maxMark > 0)
    .map((item) => `${item.course}:${item.total.obtained.toFixed(2)}/${item.total.maxMark.toFixed(2)}`)
    .sort()
    .join('|');

  return {
    signature,
    percentage,
    totalObtained,
    updatedAt: now.toISOString(),
  };
}

function readPreviousMarksSnapshot(): MarksSnapshot | null {
  const raw = getStoredMarksSnapshot();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as MarksSnapshot;
  } catch {
    return null;
  }
}

function getUpcomingClassNotification(
  timetable: RawTimetableItem[],
  calendar: RawCalendarMonth[],
  now: Date,
) {
  const todayEntry = getCalendarEntryForDate(calendar, now);
  const dayOrder = Number(todayEntry?.day.dayOrder);
  if (Number.isNaN(dayOrder) || dayOrder <= 0) return null;

  const classes = getClassesForDay(timetable, dayOrder);
  const currentMinutes = (now.getHours() * 60) + now.getMinutes();

  for (const classItem of classes) {
    const window = getClassWindow(classItem);
    if (!window) continue;

    const minutesUntilClass = window.start - currentMinutes;
    if (minutesUntilClass < 0 || minutesUntilClass > 30) continue;

    const identifier = `${dayOrder}-${classItem.slot}-${classItem.time}`;
    if (hasSeenNotification('class', identifier, now)) continue;

    markNotificationSeen('class', identifier, now);
    return {
      title: 'class radar',
      message: `📚 Bhai uth ja… 30 min mein ${formatSubjectName(classItem.courseTitle)} hai 💀`,
      type: 'class',
      sound: 'class',
      source: 'engine',
      metadata: {
        dayOrder,
        slot: classItem.slot,
      },
    } satisfies NotificationPayload;
  }

  return null;
}

function getAttendanceWarningNotification(attendance: RawAttendanceItem[], now: Date) {
  const criticalAttendance = getCriticalAttendance(attendance);
  if (!criticalAttendance) return null;

  const percentage = Number(criticalAttendance.courseAttendance);
  if (percentage >= 75) return null;

  const identifier = `${criticalAttendance.courseCode}-${Math.floor(percentage)}`;
  if (hasSeenNotification('attendance', identifier, now)) {
    return null;
  }

  markNotificationSeen('attendance', identifier, now);
  return {
    title: 'attendance cooked alert',
    message: '⚠️ Pushpa jhukega nahi… par tera attendance jhuk gaya hai 💀',
    type: 'warning',
    sound: 'warning',
    source: 'engine',
    deepLink: '/attendance',
    metadata: {
      courseCode: criticalAttendance.courseCode,
      attendance: percentage,
    },
  } satisfies NotificationPayload;
}

function getMarksUpdateNotification(markList: RawMarkItem[], now: Date) {
  const currentSnapshot = getMarksSnapshot(markList, now);
  const previousSnapshot = readPreviousMarksSnapshot();

  setStoredMarksSnapshot(JSON.stringify(currentSnapshot));

  if (!previousSnapshot || !previousSnapshot.signature || previousSnapshot.signature === currentSnapshot.signature) {
    return null;
  }

  const delta = currentSnapshot.percentage - previousSnapshot.percentage;
  const identifier = currentSnapshot.signature;
  if (hasSeenNotification('marks', identifier, now)) {
    return null;
  }

  markNotificationSeen('marks', identifier, now);

  if (delta >= 0) {
    return {
      title: 'marks just dropped',
      message: '🔥 Aaj khush toh bahut hoge tum 😏',
      type: 'good',
      sound: 'good',
      source: 'engine',
      deepLink: '/marks',
      metadata: {
        percentage: currentSnapshot.percentage,
        delta: Number(delta.toFixed(2)),
      },
    } satisfies NotificationPayload;
  }

  return {
    title: 'marks just dropped',
    message: '💀 This too shall pass...',
    type: 'bad',
    sound: 'bad',
    source: 'engine',
    deepLink: '/marks',
    metadata: {
      percentage: currentSnapshot.percentage,
      delta: Number(delta.toFixed(2)),
    },
  } satisfies NotificationPayload;
}

export function evaluateNotificationEngine({
  attendance,
  markList,
  timetable,
  calendar,
  now = new Date(),
}: NotificationEngineInput) {
  const notifications: NotificationPayload[] = [];

  const upcomingClass = getUpcomingClassNotification(timetable, calendar, now);
  if (upcomingClass) notifications.push(upcomingClass);

  const attendanceWarning = getAttendanceWarningNotification(attendance, now);
  if (attendanceWarning) notifications.push(attendanceWarning);

  const marksUpdate = getMarksUpdateNotification(markList, now);
  if (marksUpdate) notifications.push(marksUpdate);

  return notifications;
}

function getNextReminderDelayForDay(
  timetable: RawTimetableItem[],
  dayOrder: number,
  dayDate: Date,
  now: Date,
) {
  const classes = getClassesForDay(timetable, dayOrder);
  let smallestDelay: number | null = null;

  for (const classItem of classes) {
    const window = getClassWindow(classItem);
    if (!window) continue;

    const reminderAt = new Date(dayDate);
    reminderAt.setHours(0, window.start - CLASS_REMINDER_LEAD_MINUTES, 0, 0);

    const identifier = `${dayOrder}-${classItem.slot}-${classItem.time}`;
    if (hasSeenNotification('class', identifier, reminderAt)) continue;

    const delay = reminderAt.getTime() - now.getTime();
    if (delay <= 0) continue;

    if (smallestDelay === null || delay < smallestDelay) {
      smallestDelay = delay;
    }
  }

  return smallestDelay;
}

export function getNextNotificationEngineDelay({
  timetable,
  calendar,
  now = new Date(),
}: Pick<NotificationEngineInput, 'timetable' | 'calendar' | 'now'>) {
  const delays: number[] = [];
  const todayEntry = getCalendarEntryForDate(calendar, now);
  const todayDayOrder = Number(todayEntry?.day.dayOrder);

  if (
    todayEntry
    && !Number.isNaN(todayDayOrder)
    && todayDayOrder > 0
    && !isCalendarHoliday(todayEntry.day, todayEntry.month)
  ) {
    const todayDate = toCalendarDate(todayEntry.month, todayEntry.day.date);
    if (todayDate) {
      const delay = getNextReminderDelayForDay(timetable, todayDayOrder, todayDate, now);
      if (delay !== null) {
        delays.push(delay);
      }
    }
  }

  let cursorDate = now;
  for (let index = 0; index < 7; index += 1) {
    const nextEntry = getNextCalendarEntry(calendar, cursorDate);
    if (!nextEntry) break;

    const nextDate = toCalendarDate(nextEntry.month, nextEntry.day.date);
    const nextDayOrder = Number(nextEntry.day.dayOrder);
    if (!nextDate) break;

    cursorDate = new Date(nextDate);
    cursorDate.setDate(cursorDate.getDate() + 1);

    if (
      Number.isNaN(nextDayOrder)
      || nextDayOrder <= 0
      || isCalendarHoliday(nextEntry.day, nextEntry.month)
    ) {
      continue;
    }

    const delay = getNextReminderDelayForDay(timetable, nextDayOrder, nextDate, now);
    if (delay !== null) {
      delays.push(delay);
      break;
    }
  }

  if (!delays.length) return null;
  return Math.min(...delays);
}
