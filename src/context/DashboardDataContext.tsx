'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

import { ApiError, clearCachedJson, fetchJson, peekCachedJson } from '@/lib/api/client';
import { trackEvent } from '@/lib/analytics';
import type { DashboardData } from '@/lib/api/types';
import type { RawAttendanceItem, RawCalendarMonth, RawMarkItem, RawTimetableItem, RawUserInfo } from '@/lib/server/academia';

// Staleness thresholds
const FRESH_MS      = 60 * 1000;       // < 1 min → always bg-fetch (JS Map serves, no network)
const SOFT_STALE_MS = 5 * 60 * 1000;  // 1–5 min → bg-fetch via server snapshot
const FOCUS_SKIP_MS = 30 * 1000;      // focus listener: skip if synced < 30s ago

const PERSISTENCE_KEY = 'fcuk_dashboard_data_v1';

interface PersistedDashboard extends DashboardData { _fetchedAt: number; }

function readPersisted(): PersistedDashboard | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PERSISTENCE_KEY);
    return raw ? JSON.parse(raw) as PersistedDashboard : null;
  } catch { return null; }
}

function writePersisted(data: DashboardData) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(PERSISTENCE_KEY, JSON.stringify({ ...data, _fetchedAt: Date.now() })); }
  catch { /* quota */ }
}

function getPersistedAgeMs(): number {
  if (typeof window === 'undefined') return Infinity;
  try {
    const raw = localStorage.getItem(PERSISTENCE_KEY);
    if (!raw) return Infinity;
    return Date.now() - ((JSON.parse(raw) as Partial<PersistedDashboard>)._fetchedAt ?? 0);
  } catch { return Infinity; }
}

interface DashboardDataContextValue {
  userInfo: RawUserInfo | null;
  attendance: RawAttendanceItem[];
  markList: RawMarkItem[];
  timetable: RawTimetableItem[];
  calendar: RawCalendarMonth[];
  loading: boolean;
  refreshing: boolean;
  isStale: boolean;
  error: string | null;
  refreshDashboard: (source?: string) => Promise<void>;
}

const DashboardDataContext = createContext<DashboardDataContextValue | undefined>(undefined);

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const cachedDashboard = peekCachedJson<DashboardData>('/api/dashboard');
  const initialPersisted = readPersisted();

  const [userInfo,    setUserInfo]    = useState<RawUserInfo | null>(cachedDashboard?.userInfo    ?? initialPersisted?.userInfo    ?? null);
  const [attendance,  setAttendance]  = useState<RawAttendanceItem[]>(cachedDashboard?.attendance ?? initialPersisted?.attendance ?? []);
  const [markList,    setMarkList]    = useState<RawMarkItem[]>(cachedDashboard?.markList         ?? initialPersisted?.markList    ?? []);
  const [timetable,   setTimetable]   = useState<RawTimetableItem[]>(cachedDashboard?.timetable   ?? initialPersisted?.timetable   ?? []);
  const [calendar,    setCalendar]    = useState<RawCalendarMonth[]>(cachedDashboard?.calendar    ?? initialPersisted?.calendar    ?? []);
  const [loading,     setLoading]     = useState(!cachedDashboard && !initialPersisted);
  const [refreshing,  setRefreshing]  = useState(false);
  const [isStale,     setIsStale]     = useState(cachedDashboard?.isStale ?? false);
  const [error,       setError]       = useState<string | null>(null);

  const autoSyncStartedRef  = useRef(false);
  const cachedDashboardRef  = useRef(cachedDashboard);
  cachedDashboardRef.current = cachedDashboard;
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // ── Global fetch lock ──────────────────────────────────────────────────────
  // Prevents concurrent overlapping fetches from focus + auto-sync + manual.
  // Force-refresh always overrides a soft fetch already in-flight.
  const isSyncingRef = useRef<'soft' | 'force' | null>(null);

  const loadDashboard = useCallback(
    async (options?: { forceRefresh?: boolean; preserveLoading?: boolean }) => {
      const forceRefresh   = options?.forceRefresh   ?? false;
      const preserveLoading = options?.preserveLoading ?? false;

      // Fetch lock — allow force to preempt a soft in-flight sync.
      if (isSyncingRef.current === 'force') return;
      if (isSyncingRef.current === 'soft' && !forceRefresh) return;

      isSyncingRef.current = forceRefresh ? 'force' : 'soft';

      const currentCached = cachedDashboardRef.current;

      try {
        // Always clear the client-side JS Map so every loadDashboard call
        // goes to the network (or browser HTTP cache, max-age=5s).
        // Without this, the JS Map can serve stale data from a previous
        // session even when background-syncing fresh data.
        clearCachedJson('/api/dashboard');
        if (forceRefresh) {
          clearCachedJson('/api/calendar');
          setRefreshing(true);
        } else if (currentCached) {
          setRefreshing(true);
        }

        if (!preserveLoading) setLoading((c) => c && !currentCached);
        setError(null);

        const data = await fetchJson<DashboardData>(
          forceRefresh ? '/api/dashboard?refresh=1' : '/api/dashboard',
        );

        setUserInfo(data.userInfo);
        setAttendance(data.attendance);
        setMarkList(data.markList);
        setTimetable(data.timetable);
        setCalendar(data.calendar);
        setIsStale(data.isStale ?? false);
        writePersisted(data);
      } catch (loadError) {
        if (currentCached) {
          setUserInfo(currentCached.userInfo); setAttendance(currentCached.attendance);
          setMarkList(currentCached.markList); setTimetable(currentCached.timetable);
          setCalendar(currentCached.calendar); setIsStale(true); setError(null);
        } else {
          setError(loadError instanceof ApiError ? loadError.message : 'server error');
        }
      } finally {
        if (!preserveLoading) setLoading(false);
        setRefreshing(false);
        isSyncingRef.current = null;
      }
    },
    [],
  );

  const loadDashboardRef = useRef(loadDashboard);
  loadDashboardRef.current = loadDashboard;

  // ── Auto-sync (once per mount) ────────────────────────────────────────────
  // SWR pattern: ALWAYS background-fetch, even for FRESH data.
  // When age < 5 min, fetchJson returns from JS Map (no network). Safe.
  // When age >= 5 min, force a real Academia scrape.
  useEffect(() => {
    if (pathname === '/login') { autoSyncStartedRef.current = false; return; }
    if (autoSyncStartedRef.current) return;
    autoSyncStartedRef.current = true;

    const timer = setTimeout(() => {
      const hasCachedData = !!cachedDashboardRef.current || !!readPersisted();

      if (!hasCachedData) {
        void loadDashboardRef.current({ forceRefresh: false, preserveLoading: false });
        return;
      }

      const age = getPersistedAgeMs();
      const forceRefresh = age >= SOFT_STALE_MS;

      // Always background-sync (SWR pattern).
      // forceRefresh=false → JS Map serves if < 5 min (no network cost).
      // forceRefresh=true  → clears JS Map → fresh Academia scrape.
      void loadDashboardRef.current({ forceRefresh, preserveLoading: true });
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname]);

  // ── Tab focus / visibility → real-time sync ───────────────────────────────
  // Fires on every tab return, skips only if synced < 30s ago.
  useEffect(() => {
    const sync = () => {
      if (pathnameRef.current === '/login') return;
      if (getPersistedAgeMs() < FOCUS_SKIP_MS) return; // Very recently synced — skip.
      const forceRefresh = getPersistedAgeMs() >= SOFT_STALE_MS;
      void loadDashboardRef.current({ forceRefresh, preserveLoading: true });
    };

    const onVisibility = () => { if (document.visibilityState === 'visible') sync(); };

    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <DashboardDataContext.Provider value={{
      userInfo, attendance, markList, timetable, calendar,
      loading, refreshing, isStale, error,
      refreshDashboard: async (source?: string) => {
        trackEvent('data_refresh_triggered', { source: source ?? 'manual' });
        await loadDashboardRef.current({ forceRefresh: true, preserveLoading: true });
      },
    }}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardDataContext() {
  const context = useContext(DashboardDataContext);
  if (!context) throw new Error('useDashboardDataContext must be used within a DashboardDataProvider');
  return context;
}
