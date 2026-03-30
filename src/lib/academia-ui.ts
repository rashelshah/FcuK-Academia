import type { RawAttendanceItem, RawCalendarMonth, RawMarkItem, RawTimetableItem, RawUserInfo } from '@/lib/server/academia';
import type { Subject, TimetableEntry, UserProfile } from '@/lib/types';

type RawClassItem = RawTimetableItem['class'][number];

export interface ScheduleSnapshot {
  status: 'current' | 'upcoming' | 'tomorrow' | 'holiday' | 'none';
  classItem: RawClassItem | null;
  activeDayOrder: number | null;
  displayDayOrder: number | null;
}

export function createAvatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'SRM Student')}&background=111111&color=b6ff00&bold=true`;
}

export function formatRegistrationNumber(regNumber?: string | null) {
  if (!regNumber) return 'N/A';
  const normalized = regNumber.trim();
  return normalized.replace(/^ra/i, 'RA');
}

export function toUserProfile(userInfo: RawUserInfo): UserProfile {
  return {
    id: userInfo.regNumber || userInfo.name,
    name: userInfo.name || 'student',
    email: `${(userInfo.regNumber || 'student').toLowerCase()}@srmist.edu.in`,
    avatarUrl: createAvatarUrl(userInfo.name),
    studentId: userInfo.regNumber || 'N/A',
  };
}

export function combineSubjects(attendance: RawAttendanceItem[], marks: RawMarkItem[]): Subject[] {
  const groupedAttendance = new Map<string, RawAttendanceItem>();
  const groupedMarks = new Map<string, RawMarkItem>();

  for (const item of attendance) {
    const existing = groupedAttendance.get(item.courseCode);
    if (!existing) {
      groupedAttendance.set(item.courseCode, { ...item });
      continue;
    }

    const conducted = existing.courseConducted + item.courseConducted;
    const absent = existing.courseAbsent + item.courseAbsent;
    groupedAttendance.set(item.courseCode, {
      ...existing,
      courseConducted: conducted,
      courseAbsent: absent,
      courseAttendance: conducted ? (((conducted - absent) / conducted) * 100).toFixed(1) : '0',
      courseFaculty: existing.courseFaculty || item.courseFaculty,
      courseTitle: existing.courseTitle || item.courseTitle,
      courseSlot: existing.courseSlot || item.courseSlot,
      courseCategory: existing.courseCategory || item.courseCategory,
    });
  }

  for (const item of marks) {
    const existing = groupedMarks.get(item.course);
    if (!existing) {
      groupedMarks.set(item.course, {
        ...item,
        marks: [...item.marks],
        total: { ...item.total },
      });
      continue;
    }

    groupedMarks.set(item.course, {
      ...existing,
      marks: [...existing.marks, ...item.marks],
      total: {
        obtained: existing.total.obtained + item.total.obtained,
        maxMark: existing.total.maxMark + item.total.maxMark,
      },
      category: existing.category || item.category,
    });
  }

  return [...groupedAttendance.values()].map((item) => {
    const mark = groupedMarks.get(item.courseCode);
    const attended = Math.max(item.courseConducted - item.courseAbsent, 0);
    return {
      id: item.courseCode,
      name: item.courseTitle.toLowerCase(),
      code: item.courseCode,
      teacher: item.courseFaculty || 'faculty tba',
      credits: Number(item.courseCredit) || 0,
      attendance: {
        attended,
        total: item.courseConducted,
        percentage: Number(item.courseAttendance) || 0,
      },
      marks: {
        internal: mark?.total.obtained ?? 0,
        totalInternal: mark?.total.maxMark ?? 0,
        exams: mark?.marks.map((exam) => ({
          exam: exam.exam,
          obtained: Number.isFinite(exam.obtained) ? exam.obtained : null,
          maxMark: Number.isFinite(exam.maxMark) ? exam.maxMark : null,
        })) ?? [],
        grade: undefined,
      },
    };
  });
}

export function inferAttendanceComponent(courseSlot: string, courseCategory?: string, courseType?: string) {
  const normalizedType = (courseType || '').trim().toLowerCase();
  const normalizedSlot = (courseSlot || '').trim().toUpperCase();
  const normalizedCategory = (courseCategory || '').trim().toLowerCase();

  if (normalizedType === 'practical' || normalizedType === 'lab') return 'practical' as const;
  if (normalizedType === 'theory') return 'theory' as const;
  if (/^(P|L)/i.test(normalizedSlot) || normalizedSlot === 'LAB') return 'practical' as const;
  if (/^(practical|lab)$/.test(normalizedCategory)) return 'practical' as const;
  if (/(?:^|\s)(practical|laboratory|lab)(?:\s|$)/i.test(normalizedCategory) && !/theory/i.test(normalizedCategory)) {
    return 'practical' as const;
  }
  return 'theory' as const;
}

function getAttendanceDisplayName(
  courseTitle: string,
  component: 'theory' | 'practical',
  componentCount: number,
) {
  const normalizedTitle = courseTitle.toLowerCase();
  return componentCount > 1 ? `${normalizedTitle} (${component})` : normalizedTitle;
}

export function combineAttendanceSubjects(attendance: RawAttendanceItem[]) {
  const groupedAttendance = new Map<string, RawAttendanceItem>();
  const courseComponentCounts = new Map<string, Set<'theory' | 'practical'>>();

  for (const item of attendance) {
    const component = inferAttendanceComponent(item.courseSlot, item.courseCategory);
    const key = `${item.courseCode}:${component}`;
    const existing = groupedAttendance.get(key);

    if (!courseComponentCounts.has(item.courseCode)) {
      courseComponentCounts.set(item.courseCode, new Set());
    }
    courseComponentCounts.get(item.courseCode)?.add(component);

    if (!existing) {
      groupedAttendance.set(key, { ...item });
      continue;
    }

    const conducted = existing.courseConducted + item.courseConducted;
    const absent = existing.courseAbsent + item.courseAbsent;
    groupedAttendance.set(key, {
      ...existing,
      courseConducted: conducted,
      courseAbsent: absent,
      courseAttendance: conducted ? (((conducted - absent) / conducted) * 100).toFixed(1) : '0',
      courseFaculty: existing.courseFaculty || item.courseFaculty,
      courseTitle: existing.courseTitle || item.courseTitle,
      courseSlot: existing.courseSlot || item.courseSlot,
      courseCategory: existing.courseCategory || item.courseCategory,
    });
  }

  return [...groupedAttendance.entries()].map(([key, item]) => {
    const component = key.endsWith(':practical') ? 'practical' as const : 'theory' as const;
    const componentCount = courseComponentCounts.get(item.courseCode)?.size ?? 1;
    const attended = Math.max(item.courseConducted - item.courseAbsent, 0);

    return {
      id: `${item.courseCode}-${component}`,
      name: getAttendanceDisplayName(item.courseTitle, component, componentCount),
      code: item.courseCode,
      attendanceComponent: component,
      courseGroupLabel: item.courseTitle.toLowerCase(),
      teacher: item.courseFaculty || 'faculty tba',
      credits: Number(item.courseCredit) || 0,
      attendance: {
        attended,
        total: item.courseConducted,
        percentage: Number(item.courseAttendance) || 0,
      },
      marks: {
        internal: 0,
        totalInternal: 0,
        exams: [],
        grade: undefined,
      },
    } satisfies Subject;
  });
}

export function getOverallAttendance(attendance: RawAttendanceItem[]) {
  const conducted = attendance.reduce((sum, item) => sum + item.courseConducted, 0);
  const present = attendance.reduce((sum, item) => sum + Math.max(item.courseConducted - item.courseAbsent, 0), 0);
  return conducted ? (present / conducted) * 100 : 0;
}

export function getAverageMarks(marks: RawMarkItem[]) {
  const valid = marks.filter((item) => item.total.maxMark > 0);
  if (!valid.length) return 0;
  const sum = valid.reduce((acc, item) => acc + item.total.obtained, 0);
  return sum / valid.length;
}

export function getTotalMarks(marks: RawMarkItem[]) {
  return marks
    .filter((item) => item.total.maxMark > 0)
    .reduce((acc, item) => acc + item.total.obtained, 0);
}

export function getMarksPercentage(marks: RawMarkItem[]) {
  const valid = marks.filter((item) => item.total.maxMark > 0);
  const obtained = valid.reduce((acc, item) => acc + item.total.obtained, 0);
  const max = valid.reduce((acc, item) => acc + item.total.maxMark, 0);
  return max ? (obtained / max) * 100 : 0;
}

export function getWeakestMark(marks: RawMarkItem[]) {
  return [...marks]
    .filter((item) => item.total.maxMark > 0)
    .sort((a, b) => (a.total.obtained / a.total.maxMark) - (b.total.obtained / b.total.maxMark))[0] ?? null;
}

export function getCriticalAttendance(attendance: RawAttendanceItem[]) {
  return [...attendance]
    .filter((item) => Number(item.courseAttendance) < 75)
    .sort((a, b) => Number(a.courseAttendance) - Number(b.courseAttendance))[0] ?? null;
}

export function getDayOrders(timetable: RawTimetableItem[]) {
  return [...new Set(
    timetable
      .map((item) => Number(item.dayOrder))
      .filter((value) => !Number.isNaN(value)),
  )].sort((left, right) => left - right);
}

export function toTimetableEntries(timetable: RawTimetableItem[]): TimetableEntry[] {
  return timetable.flatMap((day) =>
    day.class
      .filter((item) => item.isClass && item.courseCode && item.courseTitle)
      .map((item, index) => {
        const [startTime = '', endTime = ''] = item.time.split('-').map((part) => part.trim());
        return {
          id: `${day.dayOrder}-${item.slot}-${index}`,
          day: `Day ${day.dayOrder}`,
          startTime,
          endTime,
          subjectId: item.courseCode || item.slot,
          room: item.courseRoomNo || 'TBA',
        };
      }),
  );
}

export function getClassesForDay(timetable: RawTimetableItem[], dayOrder: number) {
  return timetable.find((item) => Number(item.dayOrder) === dayOrder)?.class.filter((item) => item.isClass) ?? [];
}

export function formatDayOrderNumber(dayOrder: number | null | undefined) {
  if (!dayOrder || Number.isNaN(dayOrder) || dayOrder <= 0) return '--';
  return dayOrder.toString().padStart(2, '0');
}

function parseTimeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  // Academia slot strings omit AM/PM. Morning classes are 08:00-12:xx,
  // while 01:xx-06:xx represent afternoon/evening slots.
  const normalizedHours = hours >= 1 && hours < 8 ? hours + 12 : hours;
  return (normalizedHours * 60) + minutes;
}

export function getClassWindow(item: RawClassItem) {
  const [startText = '', endText = ''] = item.time.split('-').map((part) => part.trim());
  const start = parseTimeToMinutes(startText);
  const end = parseTimeToMinutes(endText);

  if (start === null || end === null) return null;

  return {
    start,
    end,
  };
}

export function getCurrentClassIndex(classes: RawClassItem[], referenceDate = new Date()) {
  const currentMinutes = (referenceDate.getHours() * 60) + referenceDate.getMinutes();

  return classes.findIndex((item) => {
    const window = getClassWindow(item);
    if (!window) return false;
    return currentMinutes >= window.start && currentMinutes < window.end;
  });
}

export function getScheduleSnapshot(
  timetable: RawTimetableItem[],
  dayOrder: number,
  orderedDayOrders?: number[],
  referenceDate = new Date(),
  calendar: RawCalendarMonth[] = [],
): ScheduleSnapshot {
  const classes = getClassesForDay(timetable, dayOrder);
  const currentMinutes = (referenceDate.getHours() * 60) + referenceDate.getMinutes();
  const availableDayOrders = (orderedDayOrders?.length ? orderedDayOrders : getDayOrders(timetable))
    .filter((value) => value > 0);
  const todayCalendarEntry = getCalendarEntryForDate(calendar, referenceDate);
  const immediateNextCalendarEntry = getNextCalendarEntry(calendar, referenceDate);

  if (todayCalendarEntry && isCalendarHoliday(todayCalendarEntry.day, todayCalendarEntry.month)) {
    if (immediateNextCalendarEntry && !isCalendarHoliday(immediateNextCalendarEntry.day, immediateNextCalendarEntry.month)) {
      const nextDayOrder = Number(immediateNextCalendarEntry.day.dayOrder);
      const nextDayClasses = nextDayOrder > 0 ? getClassesForDay(timetable, nextDayOrder) : [];

      return {
        status: nextDayClasses.length ? 'tomorrow' : 'none',
        classItem: nextDayClasses[0] ?? null,
        activeDayOrder: Number(todayCalendarEntry.day.dayOrder) > 0 ? Number(todayCalendarEntry.day.dayOrder) : null,
        displayDayOrder: nextDayClasses.length ? nextDayOrder : null,
      };
    }

    return {
      status: 'holiday',
      classItem: null,
      activeDayOrder: Number(todayCalendarEntry.day.dayOrder) > 0 ? Number(todayCalendarEntry.day.dayOrder) : null,
      displayDayOrder: null,
    };
  }

  const currentIndex = getCurrentClassIndex(classes, referenceDate);
  if (currentIndex >= 0) {
    return {
      status: 'current',
      classItem: classes[currentIndex] ?? null,
      activeDayOrder: dayOrder,
      displayDayOrder: dayOrder,
    };
  }

  const upcomingClass = classes.find((item) => {
    const window = getClassWindow(item);
    return window !== null && window.start > currentMinutes;
  }) ?? null;

  if (upcomingClass) {
    return {
      status: 'upcoming',
      classItem: upcomingClass,
      activeDayOrder: dayOrder,
      displayDayOrder: dayOrder,
    };
  }

  if (immediateNextCalendarEntry) {
    if (isCalendarHoliday(immediateNextCalendarEntry.day, immediateNextCalendarEntry.month)) {
      return {
        status: 'holiday',
        classItem: null,
        activeDayOrder: dayOrder,
        displayDayOrder: null,
      };
    }

    const nextCalendarDayOrder = Number(immediateNextCalendarEntry.day.dayOrder);
    const nextCalendarClasses = nextCalendarDayOrder > 0 ? getClassesForDay(timetable, nextCalendarDayOrder) : [];

    return {
      status: nextCalendarClasses.length ? 'tomorrow' : 'none',
      classItem: nextCalendarClasses[0] ?? null,
      activeDayOrder: dayOrder,
      displayDayOrder: nextCalendarClasses.length ? nextCalendarDayOrder : null,
    };
  }

  const currentDayOrderIndex = availableDayOrders.indexOf(dayOrder);
  const nextDayOrder = currentDayOrderIndex >= 0
    ? availableDayOrders[(currentDayOrderIndex + 1) % availableDayOrders.length]
    : availableDayOrders[0] ?? null;
  const nextDayClasses = nextDayOrder ? getClassesForDay(timetable, nextDayOrder) : [];

  return {
    status: nextDayClasses.length ? 'tomorrow' : 'none',
    classItem: nextDayClasses[0] ?? null,
    activeDayOrder: dayOrder,
    displayDayOrder: nextDayClasses.length ? nextDayOrder : dayOrder,
  };
}

export function getNextClass(timetable: RawTimetableItem[], dayOrder: number) {
  return getScheduleSnapshot(timetable, dayOrder).classItem;
}

export function flattenCalendar(calendar: RawCalendarMonth[]) {
  return calendar.flatMap((month) => month.days.map((day) => ({ ...day, month: month.month })));
}

export function getCalendarDayOrders(calendar: RawCalendarMonth[]) {
  return [...new Set(
    flattenCalendar(calendar)
      .map((item) => Number(item.dayOrder))
      .filter((value) => !Number.isNaN(value) && value > 0),
  )].sort((left, right) => left - right);
}

export function getFirstCalendarDayWithDayOrder(calendar: RawCalendarMonth[]) {
  for (const month of calendar) {
    const day = month.days.find((item) => Number(item.dayOrder) > 0);
    if (day) {
      return { month: month.month, day };
    }
  }

  return null;
}

export function getCalendarDayByKey(calendar: RawCalendarMonth[], selection: { month: string; date: string }) {
  const month = calendar.find((item) => item.month === selection.month);
  if (!month) return null;

  const day = month.days.find((item) => item.date === selection.date);
  return day ? { month: month.month, day } : null;
}

export function getCalendarDayForDayOrder(
  calendar: RawCalendarMonth[],
  dayOrder: number,
  preferredMonth?: string | null,
) {
  if (Number.isNaN(dayOrder) || dayOrder <= 0) return null;

  const target = String(dayOrder);
  const prioritizedMonths = [
    ...(preferredMonth ? calendar.filter((month) => month.month === preferredMonth) : []),
    ...calendar.filter((month) => month.month !== preferredMonth),
  ];

  for (const month of prioritizedMonths) {
    const day = month.days.find((item) => item.dayOrder === target);
    if (day) {
      return { month: month.month, day };
    }
  }

  return null;
}

function normalizeCalendarDate(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function parseCalendarMonthLabel(label: string) {
  const match = label.match(/([A-Za-z]{3,9})\s*'?\s*(\d{2,4})/);
  if (!match) return null;

  const monthName = match[1];
  const yearText = match[2];
  const monthDate = new Date(`${monthName} 1, ${yearText.length === 2 ? `20${yearText}` : yearText}`);
  if (Number.isNaN(monthDate.getTime())) return null;

  return {
    monthIndex: monthDate.getMonth(),
    year: monthDate.getFullYear(),
  };
}

export function toCalendarDate(month: RawCalendarMonth, date: string) {
  const parsedMonth = parseCalendarMonthLabel(month.month);
  const numericDate = Number(date);
  if (!parsedMonth || Number.isNaN(numericDate)) return null;

  const value = new Date(parsedMonth.year, parsedMonth.monthIndex, numericDate);
  return Number.isNaN(value.getTime()) ? null : value;
}

export function getCalendarWeekdayIndex(month: RawCalendarMonth, date: string) {
  return toCalendarDate(month, date)?.getDay() ?? null;
}

export function getCalendarWeekdayLabel(month: RawCalendarMonth, date: string) {
  const weekdayIndex = getCalendarWeekdayIndex(month, date);
  if (weekdayIndex === null) return null;

  return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][weekdayIndex] ?? null;
}

export function isCalendarHoliday(
  day: RawCalendarMonth['days'][number],
  month?: RawCalendarMonth | null,
) {
  const normalizedEvent = (day.event || '').trim().toLowerCase();
  const normalizedWeekday = (day.day || '').trim().toLowerCase();
  const weekdayIndex = month ? getCalendarWeekdayIndex(month, day.date) : null;
  const isWeekend = normalizedWeekday.startsWith('sat')
    || normalizedWeekday.startsWith('sun')
    || weekdayIndex === 0
    || weekdayIndex === 6;

  if (isWeekend) return true;
  if (!normalizedEvent || normalizedEvent === '-') return false;

  return /(holiday|leave|vacation|break|festival|closed|holi|no class)/i.test(normalizedEvent);
}

export function getCalendarEntryForDate(calendar: RawCalendarMonth[], referenceDate = new Date()) {
  const targetDate = normalizeCalendarDate(referenceDate).getTime();

  for (const month of calendar) {
    for (const day of month.days) {
      const calendarDate = toCalendarDate(month, day.date);
      if (calendarDate && normalizeCalendarDate(calendarDate).getTime() === targetDate) {
        return { month, day };
      }
    }
  }

  return null;
}

export function getNextCalendarEntry(calendar: RawCalendarMonth[], referenceDate = new Date()) {
  const targetDate = normalizeCalendarDate(referenceDate).getTime();

  let closestEntry: { month: RawCalendarMonth; day: RawCalendarMonth['days'][number] } | null = null;
  let closestTime = Number.POSITIVE_INFINITY;

  for (const month of calendar) {
    for (const day of month.days) {
      const calendarDate = toCalendarDate(month, day.date);
      if (!calendarDate) continue;

      const time = normalizeCalendarDate(calendarDate).getTime();
      if (time <= targetDate || time >= closestTime) continue;

      closestTime = time;
      closestEntry = { month, day };
    }
  }

  return closestEntry;
}

export function getCurrentCalendarMonth(calendar: RawCalendarMonth[]) {
  if (!calendar.length) return null;

  const now = new Date();
  const shortTarget = now.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  const longTarget = now.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const matchingMonth = calendar.find((month) => {
    const label = month.month.toLowerCase();
    return label.includes(shortTarget) || label.includes(longTarget);
  });

  if (matchingMonth) return matchingMonth;

  let closestMonth = calendar[0];
  let smallestDistance = Number.POSITIVE_INFINITY;

  for (const month of calendar) {
    const monthDate = toCalendarDate(month, '1');
    if (!monthDate) continue;
    const distance = Math.abs(monthDate.getTime() - now.getTime());
    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestMonth = month;
    }
  }

  return closestMonth;
}

export function getTodayCalendarItem(calendar: RawCalendarMonth[]) {
  const month = getCurrentCalendarMonth(calendar);
  if (!month) return null;

  const now = new Date();
  const day = String(now.getDate());
  const exactMatch = month.days.find((item) => item.date === day);
  if (exactMatch) return exactMatch;

  let closestItem = month.days[0] ?? null;
  let smallestDistance = Number.POSITIVE_INFINITY;

  for (const item of month.days) {
    const candidateDate = toCalendarDate(month, item.date);
    if (!candidateDate) continue;
    const distance = Math.abs(candidateDate.getTime() - now.getTime());
    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestItem = item;
    }
  }

  if (closestItem) return closestItem;

  return month.days.find((item) => item.dayOrder && item.dayOrder !== '-') ?? month.days[0] ?? null;
}

export function getUpcomingCalendarEvents(calendar: RawCalendarMonth[]) {
  return flattenCalendar(calendar).filter((item) => item.event && item.event !== '-').slice(0, 3);
}

export function formatMonthTitle(month: string) {
  return month.replace(/'/g, ' 20');
}

export function getCompactCourseLabel(userInfo?: RawUserInfo | null) {
  const candidates = [userInfo?.department, userInfo?.program]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value) && value !== 'N/A');

  for (const value of candidates) {
    if (/computer science and engineering/i.test(value) && /(?:software engineering|\bse\b|\bswe\b)/i.test(value)) {
      return 'CSE w/s SWE';
    }
  }

  return candidates[0] ?? 'Course not available';
}

export function inferGrade(percentage: number) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  return 'D';
}
