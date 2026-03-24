import type { RawAttendanceItem, RawCalendarMonth, RawMarkItem, RawTimetableItem, RawUserInfo } from '@/lib/server/academia';
import type { Subject, TimetableEntry, UserProfile } from '@/lib/types';

export function createAvatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'SRM Student')}&background=111111&color=b6ff00&bold=true`;
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
      credits: 0,
      attendance: {
        attended,
        total: item.courseConducted,
        percentage: Number(item.courseAttendance) || 0,
      },
      marks: {
        internal: mark?.total.obtained ?? 0,
        totalInternal: mark?.total.maxMark ?? 0,
        grade: undefined,
      },
    };
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
  return timetable.map((item) => Number(item.dayOrder)).filter((value) => !Number.isNaN(value));
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

export function getNextClass(timetable: RawTimetableItem[], dayOrder: number) {
  const classes = getClassesForDay(timetable, dayOrder);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const item of classes) {
    const [startText] = item.time.split('-').map((part) => part.trim());
    const [hours, minutes] = startText.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) continue;
    const start = hours * 60 + minutes;
    if (start >= currentMinutes) return item;
  }

  return classes[0] ?? null;
}

export function flattenCalendar(calendar: RawCalendarMonth[]) {
  return calendar.flatMap((month) => month.days.map((day) => ({ ...day, month: month.month })));
}

export function getCurrentCalendarMonth(calendar: RawCalendarMonth[]) {
  const now = new Date();
  const shortTarget = now.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  const longTarget = now.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  return (
    calendar.find((month) => {
      const label = month.month.toLowerCase();
      return label.includes(shortTarget) || label.includes(longTarget);
    }) ?? calendar[0] ?? null
  );
}

export function getTodayCalendarItem(calendar: RawCalendarMonth[]) {
  const now = new Date();
  const day = String(now.getDate());
  const month = getCurrentCalendarMonth(calendar);
  return month?.days.find((item) => item.date === day) ?? null;
}

export function getUpcomingCalendarEvents(calendar: RawCalendarMonth[]) {
  return flattenCalendar(calendar).filter((item) => item.event && item.event !== '-').slice(0, 3);
}

export function formatMonthTitle(month: string) {
  return month.replace(/'/g, ' 20');
}

export function inferGrade(percentage: number) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  return 'D';
}
