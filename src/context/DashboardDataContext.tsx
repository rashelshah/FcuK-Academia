'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { ApiError, clearCachedJson, fetchJson, peekCachedJson } from '@/lib/api/client';
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
  error: string | null;
  refreshDashboard: () => Promise<void>;
}

const DashboardDataContext = createContext<DashboardDataContextValue | undefined>(undefined);

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const cachedDashboard = peekCachedJson<DashboardData>('/api/dashboard');
  const [userInfo, setUserInfo] = useState<RawUserInfo | null>(cachedDashboard?.userInfo ?? null);
  const [attendance, setAttendance] = useState<RawAttendanceItem[]>(cachedDashboard?.attendance ?? []);
  const [markList, setMarkList] = useState<RawMarkItem[]>(cachedDashboard?.markList ?? []);
  const [timetable, setTimetable] = useState<RawTimetableItem[]>(cachedDashboard?.timetable ?? []);
  const [calendar, setCalendar] = useState<RawCalendarMonth[]>(cachedDashboard?.calendar ?? []);
  const [loading, setLoading] = useState(!cachedDashboard);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSyncStartedRef = useRef(false);

  const loadDashboard = useCallback(async (options?: { forceRefresh?: boolean; preserveLoading?: boolean }) => {
    const forceRefresh = options?.forceRefresh ?? false;
    const preserveLoading = options?.preserveLoading ?? false;

    try {
      if (forceRefresh) {
        setRefreshing(true);
        clearCachedJson('/api/dashboard');
        clearCachedJson('/api/calendar');
      }

      if (!preserveLoading) {
        setLoading((current) => (forceRefresh ? true : current && !cachedDashboard));
      }

      setError(null);

      const query = forceRefresh
        ? `/api/dashboard?refresh=1&ts=${Date.now()}`
        : `/api/dashboard?ts=${Date.now()}`;
      const data = await fetchJson<DashboardData>(query);

      setUserInfo(data.userInfo);
      setAttendance(data.attendance);
      setMarkList(data.markList);
      setTimetable(data.timetable);
      setCalendar(data.calendar);
    } catch (loadError) {
      if (cachedDashboard) {
        setUserInfo(cachedDashboard.userInfo);
        setAttendance(cachedDashboard.attendance);
        setMarkList(cachedDashboard.markList);
        setTimetable(cachedDashboard.timetable);
        setCalendar(cachedDashboard.calendar);
        setError(null);
      } else {
        setError(loadError instanceof ApiError ? loadError.message : 'server error');
      }
    } finally {
      if (!preserveLoading) {
        setLoading(false);
      }
      if (forceRefresh) {
        setRefreshing(false);
      }
    }
  }, [cachedDashboard]);

  useEffect(() => {
    if (autoSyncStartedRef.current) return;
    autoSyncStartedRef.current = true;
    void loadDashboard({ forceRefresh: true, preserveLoading: Boolean(cachedDashboard) });
  }, [cachedDashboard, loadDashboard]);

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
        error,
        refreshDashboard: () => loadDashboard({ forceRefresh: true, preserveLoading: true }),
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
