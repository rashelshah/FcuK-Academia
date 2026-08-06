'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ThemeSelectionPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings?gallery=open');
  }, [router]);

  return null;
}

