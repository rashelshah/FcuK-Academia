'use client';

import { useEffect } from 'react';

/**
 * Silent background refresher for Google Drive cache.
 * When a user lands on a PYQ page, we trigger a refresh in the background
 * to ensure subsequent navigations/users get the latest data.
 */
export default function DriveRefresher() {
  useEffect(() => {
    // Small delay to prioritize main content loading
    const timer = setTimeout(() => {
      fetch('/api/pyqs/revalidate', { method: 'POST' })
        .catch(err => console.error('Silent drive refresh failed:', err));
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
