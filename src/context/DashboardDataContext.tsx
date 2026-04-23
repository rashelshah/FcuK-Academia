'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

import { ApiError, clearCachedJson, fetchJson, peekCachedJson } from '@/lib/api/client';
import { trackEvent } from '@/lib/analytics';
import type { DashboardData } from '@/lib/api/types';
import type { RawAttendanceItem, RawCalendarMonth, RawMarkItem, RawTimetableItem, RawUserInfo } from '@/lib/server/academia';

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
  const PERSISTENCE_KEY = 'fcuk_dashboard_data_v1';
  
  // Try to get persisted data for initial state to avoid flicker
  const getInitialPersisted = () => {
    if (typeof window === 'undefined') return null;
    try {
      const persisted = localStorage.getItem(PERSISTENCE_KEY);
      return persisted ? JSON.parse(persisted) as DashboardData : null;
    } catch {
      return null;
    }
  };

  const initialPersisted = getInitialPersisted();
  const [userInfo, setUserInfo] = useState<RawUserInfo | null>(cachedDashboard?.userInfo ?? initialPersisted?.userInfo ?? null);
  const [attendance, setAttendance] = useState<RawAttendanceItem[]>(cachedDashboard?.attendance ?? initialPersisted?.attendance ?? []);
  const [markList, setMarkList] = useState<RawMarkItem[]>(cachedDashboard?.markList ?? initialPersisted?.markList ?? []);
  const [timetable, setTimetable] = useState<RawTimetableItem[]>(cachedDashboard?.timetable ?? initialPersisted?.timetable ?? []);
  const [calendar, setCalendar] = useState<RawCalendarMonth[]>(cachedDashboard?.calendar ?? initialPersisted?.calendar ?? []);
  const [loading, setLoading] = useState(!cachedDashboard && !initialPersisted);
  const [refreshing, setRefreshing] = useState(false);
  const [isStale, setIsStale] = useState(cachedDashboard?.isStale ?? false);
  const [error, setError] = useState<string | null>(null);
  const autoSyncStartedRef = useRef(false);

  const loadDashboard = useCallback(async (options?: { forceRefresh?: boolean; preserveLoading?: boolean }) => {
    const forceRefresh = options?.forceRefresh ?? false;
    const preserveLoading = options?.preserveLoading ?? false;

    try {
      const isBackgroundRefresh = forceRefresh || (!!userInfo || attendance.length > 0);
      
      if (isBackgroundRefresh) {
        setRefreshing(true);
        if (forceRefresh) {
          clearCachedJson('/api/dashboard');
          clearCachedJson('/api/calendar');
        }
      }

      if (!preserveLoading) {
        setLoading((current) => (forceRefresh ? true : current && !cachedDashboard));
      }

      setError(null);

      const query = forceRefresh
        ? '/api/dashboard?refresh=1'
        : '/api/dashboard';
      const data = await fetchJson<DashboardData>(query);

      setUserInfo(data.userInfo);
      setAttendance(data.attendance);
      setMarkList(data.markList);
      setTimetable(data.timetable);
      setCalendar(data.calendar);
      setIsStale(data.isStale ?? false);

      // Persist successful fetch to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(data));
      }
    } catch (loadError) {
      if (cachedDashboard) {
        setUserInfo(cachedDashboard.userInfo);
        setAttendance(cachedDashboard.attendance);
        setMarkList(cachedDashboard.markList);
        setTimetable(cachedDashboard.timetable);
        setCalendar(cachedDashboard.calendar);
        setIsStale(true);
        setError(null);
      } else {
        setError(loadError instanceof ApiError ? loadError.message : 'server error');
      }
    } finally {
      if (!preserveLoading) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, [cachedDashboard, userInfo, attendance.length]);

  useEffect(() => {
    if (pathname === '/login') {
      autoSyncStartedRef.current = false;
      return;
    }

    if (autoSyncStartedRef.current) return;
    autoSyncStartedRef.current = true;

    if (cachedDashboard) {
      void loadDashboard({ forceRefresh: true, preserveLoading: true });
      return;
    }

    void loadDashboard({ forceRefresh: false, preserveLoading: false });
  }, [cachedDashboard, loadDashboard, pathname]);

  return (
    <DashboardDataContext.Provider
      value={{
        userInfo,
        attendance,
        markList,
        timetable,
        calendar,
        loading,
        refreshing,
        isStale,
        error,
        refreshDashboard: async (source?: string) => {
          trackEvent('data_refresh_triggered', {
            source: source ?? 'manual',
          });
          await loadDashboard({ forceRefresh: true, preserveLoading: true });
        },
      }}
    >
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardDataContext() {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error('useDashboardDataContext must be used within a DashboardDataProvider');
  }

  return context;
}
