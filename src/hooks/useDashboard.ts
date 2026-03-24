import { useEffect, useState } from 'react';

import { ApiError, fetchJson } from '@/lib/api/client';
import type { DashboardData } from '@/lib/api/types';
import type { RawAttendanceItem, RawCalendarMonth, RawMarkItem, RawTimetableItem, RawUserInfo } from '@/lib/server/academia';

export function useDashboard() {
  const [user, setUser] = useState<RawUserInfo | null>(null);
  const [attendance, setAttendance] = useState<RawAttendanceItem[]>([]);
  const [marks, setMarks] = useState<RawMarkItem[]>([]);
  const [timetable, setTimetable] = useState<RawTimetableItem[]>([]);
  const [calendar, setCalendar] = useState<RawCalendarMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchJson<DashboardData>('/api/dashboard');

        if (!active) return;
        setUser(data.userInfo);
        setAttendance(data.attendance);
        setMarks(data.markList);
        setTimetable(data.timetable);
        setCalendar(data.calendar);
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

  return { user, attendance, marks, timetable, calendar, loading, error };
}
