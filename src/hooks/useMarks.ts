import { useState, useEffect } from 'react';
import { mockSubjects } from '@/lib/mockData';
import { Subject } from '@/lib/types';

export function useMarks() {
  const [marks, setMarks] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setMarks(mockSubjects);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return { marks, loading };
}
