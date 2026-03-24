export interface Subject {
  id: string;
  name: string;
  code: string;
  teacher: string;
  credits: number;
  attendance: {
    attended: number;
    total: number;
    percentage: number;
  };
  marks: {
    internal: number;
    totalInternal: number;
    grade?: string;
  };
}

export interface TimetableEntry {
  id: string;
  day: string; // e.g., "Monday", "Day 1"
  startTime: string;
  endTime: string;
  subjectId: string;
  room: string;
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  subjectId: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  studentId: string;
}

export type ThemeType = 'dark' | 'neon' | 'light';
