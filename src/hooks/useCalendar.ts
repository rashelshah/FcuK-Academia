import { useEffect, useState } from 'react';

import { fetchJson, ApiError } from '@/lib/api/client';
import type { CalendarResponse } from '@/lib/api/types';
import type { RawCalendarMonth } from '@/lib/server/academia';

export function useCalendar() {
  const [calendar, setCalendar] = useState<RawCalendarMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchJson<CalendarResponse>('/api/calendar');
        if (!active) return;
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

  return { calendar, loading, error };
}
