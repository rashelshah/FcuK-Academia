import { useEffect, useMemo, useState } from 'react';

import { fetchJson, ApiError } from '@/lib/api/client';
import type { MarksResponse } from '@/lib/api/types';
import { combineSubjects } from '@/lib/academia-ui';
import type { RawAttendanceItem, RawMarkItem } from '@/lib/server/academia';

export function useMarks(attendanceSeed: RawAttendanceItem[] = []) {
  const [markList, setMarkList] = useState<RawMarkItem[]>([]);
  const [attendance, setAttendance] = useState<RawAttendanceItem[]>(attendanceSeed);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [marksData, attendanceData] = await Promise.all([
          fetchJson<MarksResponse>('/api/marks'),
          attendanceSeed.length ? Promise.resolve({ attendance: attendanceSeed }) : fetchJson<{ attendance: RawAttendanceItem[] }>('/api/attendance'),
        ]);

        if (!active) return;
        setMarkList(marksData.markList);
        setAttendance(attendanceData.attendance);
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
  }, [attendanceSeed]);

  const marks = useMemo(() => combineSubjects(attendance, markList), [attendance, markList]);

  return { marks, markList, loading, error };
}
