'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

import {
  getCalendarEntryForDate,
  getCalendarDayByKey,
  getCalendarDayOrders,
  getCurrentCalendarMonth,
  getFirstCalendarDayWithDayOrder,
  getTodayCalendarItem,
} from '@/lib/academia-ui';
import type { RawCalendarMonth } from '@/lib/server/academia';
import { useDashboardDataContext } from '@/context/DashboardDataContext';

type CalendarSelection = { month: string; date: string };

interface AppStateContextType {
  calendar: RawCalendarMonth[];
  calendarLoading: boolean;
  calendarError: string | null;
  activeDayOrder: number | null;
  availableDayOrders: number[];
  dayOrderSource: 'automatic' | 'manual';
  selectedCalendarDay: CalendarSelection | null;
  setSelectedCalendarDay: (selection: CalendarSelection) => void;
  setActiveDayOrder: (dayOrder: number) => void;
  isAnnouncementActive: boolean;
  setIsAnnouncementActive: (active: boolean) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

function getDefaultCalendarSelection(calendar: RawCalendarMonth[]) {
  const currentMonth = getCurrentCalendarMonth(calendar);
  const today = getTodayCalendarItem(calendar);
  if (currentMonth && today) {
    return { month: currentMonth.month, day: today };
  }

  return getFirstCalendarDayWithDayOrder(calendar);
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const {
    calendar,
    loading: calendarLoading,
    error: calendarError,
  } = useDashboardDataContext();
  const [selectedCalendarDayState, setSelectedCalendarDayState] = useState<CalendarSelection | null>(null);
  const [activeDayOrderState, setActiveDayOrderState] = useState<number | null>(null);
  const [isAnnouncementActive, setIsAnnouncementActive] = useState<boolean>(false);

  const availableDayOrders = useMemo(() => getCalendarDayOrders(calendar), [calendar]);
  const fallbackSelection = useMemo(
    () => getDefaultCalendarSelection(calendar),
    [calendar],
  );
  const selectedDay = useMemo(
    () => (selectedCalendarDayState ? getCalendarDayByKey(calendar, selectedCalendarDayState) : null),
    [calendar, selectedCalendarDayState],
  );
  const selectedCalendarDay = useMemo(() => {
    if (selectedDay) {
      return { month: selectedDay.month, date: selectedDay.day.date };
    }

    if (fallbackSelection) {
      return { month: fallbackSelection.month, date: fallbackSelection.day.date };
    }

    return null;
  }, [fallbackSelection, selectedDay]);
  const automaticDayOrder = useMemo(() => {
    const todayEntry = getCalendarEntryForDate(calendar);
    const todayDayOrder = Number(todayEntry?.day.dayOrder);
    if (!Number.isNaN(todayDayOrder) && todayDayOrder > 0) {
      return todayDayOrder;
    }

    return null;
  }, [calendar]);
  const activeDayOrder = useMemo(() => {
    if (activeDayOrderState !== null && availableDayOrders.includes(activeDayOrderState)) {
      return activeDayOrderState;
    }

    return automaticDayOrder;
  }, [activeDayOrderState, automaticDayOrder, availableDayOrders]);

  function setSelectedCalendarDay(selection: CalendarSelection) {
    setSelectedCalendarDayState(selection);
  }

  function setActiveDayOrder(dayOrder: number) {
    if (Number.isNaN(dayOrder) || dayOrder <= 0) return;
    setActiveDayOrderState(dayOrder);
  }

  return (
    <AppStateContext.Provider
      value={{
        calendar,
        calendarLoading,
        calendarError,
        activeDayOrder,
        availableDayOrders,
        dayOrderSource: activeDayOrderState !== null ? 'manual' : 'automatic',
        selectedCalendarDay,
        setSelectedCalendarDay,
        setActiveDayOrder,
        isAnnouncementActive,
        setIsAnnouncementActive,
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
