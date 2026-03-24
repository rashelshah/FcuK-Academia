import { useEffect, useState } from 'react';

import { ApiError, fetchJson } from '@/lib/api/client';
import type { AttendanceResponse, MarksResponse, TimetableResponse, UserResponse } from '@/lib/api/types';
import type { RawAttendanceItem, RawMarkItem, RawTimetableItem, RawUserInfo } from '@/lib/server/academia';

export function useDashboard() {
  const [user, setUser] = useState<RawUserInfo | null>(null);
  const [attendance, setAttendance] = useState<RawAttendanceItem[]>([]);
  const [marks, setMarks] = useState<RawMarkItem[]>([]);
  const [timetable, setTimetable] = useState<RawTimetableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [userData, attendanceData, marksData, timetableData] = await Promise.all([
          fetchJson<UserResponse>('/api/user'),
          fetchJson<AttendanceResponse>('/api/attendance'),
          fetchJson<MarksResponse>('/api/marks'),
          fetchJson<TimetableResponse>('/api/timetable'),
        ]);

        if (!active) return;
        setUser(userData.userInfo);
        setAttendance(attendanceData.attendance);
        setMarks(marksData.markList);
        setTimetable(timetableData.timetable);
      } catch (err) {
        if (!active) return;
        setError(err instanceof ApiError ? err.message : 'server error');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return { user, attendance, marks, timetable, loading, error };
}
