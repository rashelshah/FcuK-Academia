import { Subject, TimetableEntry, UserProfile } from './types';

export const mockUser: UserProfile = {
  id: 'u1',
  name: 'alexander vance',
  email: 'alex.vance@academia.edu',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmuWe8tR0zidmHZlYtlyKw1pjvQUx3qYHMAfgEdywLSYTMw2sA8YgSObCss3AIfqL2MlAlRNyYrbQvz4A5WmaMsRAPYFpJ1aMcoulm9qNgEXAhSMWD0s279zyP0KvXs1XPcby0YuFG-Cj0NRLxGLoOTIiC-ye3fXZcSsvqsReayQYRKewOgAuq4_GJrp4XTvVhIqmyuxctBLtDNUXKyT7XBvSJQA305wR4pzZFgH6njvwtxOV0FfVgIfqajxokOj1C6gzZbfdN65g',
  studentId: 'FA-2024-X99',
};

export const mockSubjects: Subject[] = [
  {
    id: '1',
    name: 'advanced algorithms',
    code: 'CS401',
    teacher: 'Dr. Aris Thorne',
    credits: 4,
    attendance: { attended: 14, total: 18, percentage: 77.7 },
    marks: { internal: 24.5, totalInternal: 25, grade: 'A+' },
  },
  {
    id: '2',
    name: 'neural networks',
    code: 'CS402',
    teacher: 'Prof. X. Sterling',
    credits: 3,
    attendance: { attended: 16, total: 18, percentage: 88.8 },
    marks: { internal: 28.0, totalInternal: 30, grade: 'A' },
  },
  {
    id: '3',
    name: 'digital ethics',
    code: 'HU301',
    teacher: 'Dr. C. Vance',
    credits: 2,
    attendance: { attended: 9, total: 20, percentage: 45.0 },
    marks: { internal: 12.0, totalInternal: 25, grade: 'C' },
  },
];

export const mockTimetable: TimetableEntry[] = [
  {
    id: 't1',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    subjectId: 's1',
    room: 'Lab 4C',
  },
  {
    id: 't2',
    day: 'Monday',
    startTime: '11:00',
    endTime: '12:30',
    subjectId: 's2',
    room: 'Hall B',
  },
];
