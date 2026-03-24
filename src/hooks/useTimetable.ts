import { useEffect, useMemo, useState } from 'react';

import { fetchJson, ApiError } from '@/lib/api/client';
import type { DashboardData } from '@/lib/api/types';
import { toTimetableEntries } from '@/lib/academia-ui';
import type { RawTimetableItem } from '@/lib/server/academia';

export function useTimetable() {
  const [timetableRaw, setTimetableRaw] = useState<RawTimetableItem[]>([]);
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
        setTimetableRaw(data.timetable);
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

  const timetable = useMemo(() => toTimetableEntries(timetableRaw), [timetableRaw]);

  return { timetable, timetableRaw, loading, error };
}
