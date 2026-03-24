import { useState, useEffect } from 'react';
import { mockTimetable } from '@/lib/mockData';

export function useTimetable() {
  const [timetable, setTimetable] = useState(mockTimetable);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimetable(mockTimetable);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return { timetable, loading };
}
