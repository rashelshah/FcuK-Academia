import { useEffect, useMemo, useState } from 'react';

import { fetchJson, ApiError } from '@/lib/api/client';
import type { AttendanceResponse, MarksResponse } from '@/lib/api/types';
import { combineSubjects } from '@/lib/academia-ui';
import type { RawAttendanceItem, RawMarkItem } from '@/lib/server/academia';

export function useAttendance(markSeed: RawMarkItem[] = []) {
  const [attendanceList, setAttendanceList] = useState<RawAttendanceItem[]>([]);
  const [markList, setMarkList] = useState<RawMarkItem[]>(markSeed);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [attendanceData, marksData] = await Promise.all([
          fetchJson<AttendanceResponse>('/api/attendance'),
          markSeed.length ? Promise.resolve({ markList: markSeed }) : fetchJson<MarksResponse>('/api/marks'),
        ]);

        if (!active) return;
        setAttendanceList(attendanceData.attendance);
        setMarkList(marksData.markList);
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
  }, [markSeed]);

  const attendance = useMemo(() => combineSubjects(attendanceList, markList), [attendanceList, markList]);

  return { attendance, attendanceList, loading, error };
}
