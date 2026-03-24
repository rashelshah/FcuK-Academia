'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import {
  getCalendarDayByKey,
  getCalendarDayOrders,
  getCurrentCalendarMonth,
  getFirstCalendarDayWithDayOrder,
  getTodayCalendarItem,
} from '@/lib/academia-ui';
import { ApiError, fetchJson, peekCachedJson } from '@/lib/api/client';
import type { CalendarResponse, DashboardData } from '@/lib/api/types';
import type { RawCalendarMonth } from '@/lib/server/academia';

type DayOrderSource = 'calendar' | 'manual';
type CalendarSelection = { month: string; date: string };

interface AppStateContextType {
  calendar: RawCalendarMonth[];
  calendarLoading: boolean;
  calendarError: string | null;
  activeDayOrder: number | null;
  availableDayOrders: number[];
  dayOrderSource: DayOrderSource;
  selectedCalendarDay: CalendarSelection | null;
  setSelectedCalendarDay: (selection: CalendarSelection, dayOrder?: number | null) => void;
  setActiveDayOrder: (dayOrder: number) => void;
  clearManualDayOrder: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const cachedDashboard = peekCachedJson<DashboardData>('/api/dashboard');
  const [calendar, setCalendar] = useState<RawCalendarMonth[]>(cachedDashboard?.calendar ?? []);
  const [calendarLoading, setCalendarLoading] = useState(!cachedDashboard);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [selectedCalendarDay, setSelectedCalendarDayState] = useState<CalendarSelection | null>(null);
  const [calendarDayOrder, setCalendarDayOrder] = useState<number | null>(null);
  const [manualDayOrder, setManualDayOrder] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCalendar() {
      try {
        setCalendarLoading((current) => current && !cachedDashboard);
        setCalendarError(null);
        const data = await fetchJson<CalendarResponse>('/api/calendar');
        if (!active) return;
        setCalendar(data.calendar);
      } catch (error) {
        if (!active) return;

        if (cachedDashboard?.calendar?.length) {
          setCalendar(cachedDashboard.calendar);
          setCalendarError(null);
        } else {
          setCalendarError(error instanceof ApiError ? error.message : 'server error');
        }
      } finally {
        if (active) setCalendarLoading(false);
      }
    }

    loadCalendar();
    return () => {
      active = false;
    };
  }, [cachedDashboard]);

  const availableDayOrders = useMemo(() => getCalendarDayOrders(calendar), [calendar]);

  useEffect(() => {
    if (!calendar.length || selectedCalendarDay) return;

    const currentMonth = getCurrentCalendarMonth(calendar);
    const today = getTodayCalendarItem(calendar);
    const fallback = today && currentMonth
      ? { month: currentMonth.month, day: today }
      : getFirstCalendarDayWithDayOrder(calendar);

    if (!fallback) return;

    setSelectedCalendarDayState({
      month: fallback.month,
      date: fallback.day.date,
    });

    const derivedDayOrder = Number(fallback.day.dayOrder);
    if (!Number.isNaN(derivedDayOrder) && derivedDayOrder > 0) {
      setCalendarDayOrder(derivedDayOrder);
    }
  }, [calendar, selectedCalendarDay]);

  useEffect(() => {
    if (!selectedCalendarDay || !calendar.length) return;

    const resolved = getCalendarDayByKey(calendar, selectedCalendarDay);
    if (!resolved) return;

    const derivedDayOrder = Number(resolved.day.dayOrder);
    if (!Number.isNaN(derivedDayOrder) && derivedDayOrder > 0 && manualDayOrder === null) {
      setCalendarDayOrder(derivedDayOrder);
    }
  }, [calendar, manualDayOrder, selectedCalendarDay]);

  useEffect(() => {
    if (manualDayOrder === null || !availableDayOrders.length) return;
    if (!availableDayOrders.includes(manualDayOrder)) {
      setManualDayOrder(null);
    }
  }, [availableDayOrders, manualDayOrder]);

  const activeDayOrder = manualDayOrder ?? calendarDayOrder ?? availableDayOrders[0] ?? null;

  function setSelectedCalendarDay(selection: CalendarSelection, dayOrder?: number | null) {
    setSelectedCalendarDayState(selection);

    if (typeof dayOrder === 'number' && dayOrder > 0) {
      setCalendarDayOrder(dayOrder);
      setManualDayOrder(null);
    }
  }

  function setActiveDayOrder(dayOrder: number) {
    if (Number.isNaN(dayOrder) || dayOrder <= 0) return;
    setManualDayOrder(dayOrder);
  }

  function clearManualDayOrder() {
    setManualDayOrder(null);
  }

  return (
    <AppStateContext.Provider
      value={{
        calendar,
        calendarLoading,
        calendarError,
        activeDayOrder,
        availableDayOrders,
        dayOrderSource: manualDayOrder === null ? 'calendar' : 'manual',
        selectedCalendarDay,
        setSelectedCalendarDay,
        setActiveDayOrder,
        clearManualDayOrder,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }

  return context;
}
