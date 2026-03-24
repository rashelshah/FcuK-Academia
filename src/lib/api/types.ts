import type { RawAttendanceItem, RawCalendarMonth, RawCourseItem, RawMarkItem, RawTimetableItem, RawUserInfo } from '@/lib/server/academia';

export interface DashboardData {
  userInfo: RawUserInfo;
  attendance: RawAttendanceItem[];
  markList: RawMarkItem[];
  timetable: RawTimetableItem[];
  calendar: RawCalendarMonth[];
}

export interface ApiErrorShape {
  error: string;
}

export interface CalendarResponse {
  calendar: RawCalendarMonth[];
}

export interface CourseResponse {
  courseList: RawCourseItem[];
  batch?: string;
}

export interface MarksResponse {
  markList: RawMarkItem[];
}

export interface AttendanceResponse {
  attendance: RawAttendanceItem[];
}

export interface TimetableResponse {
  timetable: RawTimetableItem[];
}

export interface UserResponse {
  userInfo: RawUserInfo;
}
