'use client';

import { useEffect } from 'react';

const DRIVE_REVALIDATE_KEY = 'fcuk_drive_last_revalidate';
// Only ping the revalidate endpoint if the Drive cache is older than 10 minutes.
// This matches the server-side CACHE_TTL in lib/drive.ts.
const REVALIDATE_INTERVAL_MS = 10 * 60 * 1000;

/**
 * Silent background refresher for Google Drive cache.
 * Fires at most once per REVALIDATE_INTERVAL_MS to prevent hammering the
 * Drive API on every PYQ page visit.
 */
export default function DriveRefresher() {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const lastRevalidate = parseInt(
          localStorage.getItem(DRIVE_REVALIDATE_KEY) ?? '0',
          10,
        );

        if (Date.now() - lastRevalidate < REVALIDATE_INTERVAL_MS) {
          // Cache is still warm — skip the network call.
          return;
        }

        localStorage.setItem(DRIVE_REVALIDATE_KEY, String(Date.now()));

        fetch('/api/pyqs/revalidate', { method: 'POST' }).catch((err) =>
          console.error('Silent drive refresh failed:', err),
        );
      } catch {
        // localStorage unavailable (private browsing etc.) — skip.
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
