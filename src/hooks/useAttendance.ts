import { useState, useEffect } from 'react';
import { mockSubjects } from '@/lib/mockData';

export function useAttendance() {
  const [attendance, setAttendance] = useState(mockSubjects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAttendance(mockSubjects);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return { attendance, loading };
}
