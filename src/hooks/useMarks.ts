import { useEffect, useMemo, useState } from 'react';

import { fetchJson, ApiError } from '@/lib/api/client';
import type { DashboardData } from '@/lib/api/types';
import { combineSubjects } from '@/lib/academia-ui';
import type { RawAttendanceItem, RawMarkItem } from '@/lib/server/academia';

const EMPTY_ATTENDANCE: RawAttendanceItem[] = [];

export function useMarks(attendanceSeed: RawAttendanceItem[] = EMPTY_ATTENDANCE) {
  const [markList, setMarkList] = useState<RawMarkItem[]>([]);
  const [attendance, setAttendance] = useState<RawAttendanceItem[]>(attendanceSeed);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const attendanceSeedKey = JSON.stringify(attendanceSeed);
  const resolvedAttendanceSeed = useMemo(
    () => JSON.parse(attendanceSeedKey) as RawAttendanceItem[],
    [attendanceSeedKey],
  );

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchJson<DashboardData>('/api/dashboard');

        if (!active) return;
        setMarkList(data.markList);
        setAttendance(resolvedAttendanceSeed.length ? resolvedAttendanceSeed : data.attendance);
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
  }, [attendanceSeedKey, resolvedAttendanceSeed]);

  const marks = useMemo(() => combineSubjects(attendance, markList), [attendance, markList]);

  return { marks, markList, loading, error };
}
