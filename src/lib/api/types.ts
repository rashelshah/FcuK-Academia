import type { RawAttendanceItem, RawCalendarMonth, RawCourseItem, RawMarkItem, RawTimetableItem, RawUserInfo } from '@/lib/server/academia';

export interface DashboardData {
  user: RawUserInfo;
  marks: RawMarkItem[];
  attendance: RawAttendanceItem[];
  timetable: RawTimetableItem[];
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
