'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import AppHeader from '@/components/layout/AppHeader';
import CountUp from '@/components/ui/CountUp';
import GlassCard from '@/components/ui/GlassCard';
import { PageReveal, RevealHeading, RevealItem, RevealText } from '@/components/ui/PageReveal';
import { useAppState } from '@/context/AppStateContext';
import { cn } from '@/lib/utils';
import {
  formatMonthTitle,
  getCurrentCalendarMonth,
  getTodayCalendarItem,
} from '@/lib/academia-ui';
import type { RawCalendarMonth } from '@/lib/server/academia';

const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

type CalendarTone = 'default' | 'holiday' | 'exam' | 'event';

function getDayKey(month: string, date: string) {
  return `${month}-${date}`;
}

function getCalendarTone(event: string, day?: string) {
  const normalized = event.toLowerCase().trim();
  if ((!normalized || normalized === '-') && /^sat/i.test(day || '')) return 'holiday' as CalendarTone;
  if (!normalized || normalized === '-') return 'default' as CalendarTone;
  if (/(holiday|leave|vacation|break|festival|closed|holi)/i.test(normalized)) return 'holiday' as CalendarTone;
  if (/exam|test|assessment|quiz|cat|fat/i.test(normalized)) return 'exam' as CalendarTone;
  return 'event' as CalendarTone;
}

function getMonthIndex(calendar: RawCalendarMonth[], targetMonth: RawCalendarMonth | null) {
  if (!calendar.length || !targetMonth) return 0;
  const index = calendar.findIndex((month) => month.month === targetMonth.month);
  return index >= 0 ? index : 0;
}

export default function CalendarPage() {
  const {
    calendar,
    calendarLoading: loading,
    calendarError: error,
    selectedCalendarDay,
    setSelectedCalendarDay,
  } = useAppState();
  const derivedCurrentMonth = getCurrentCalendarMonth(calendar) ?? calendar[0] ?? null;
  const derivedToday = getTodayCalendarItem(calendar) ?? derivedCurrentMonth?.days.find((item) => item.dayOrder && item.dayOrder !== '-') ?? derivedCurrentMonth?.days[0] ?? null;
  const preferredMonth = useMemo(
    () => calendar.find((month) => month.month === selectedCalendarDay?.month) ?? derivedCurrentMonth,
    [calendar, derivedCurrentMonth, selectedCalendarDay?.month],
  );
  const initialMonthIndex = useMemo(
    () => getMonthIndex(calendar, preferredMonth),
    [calendar, preferredMonth],
  );

  const [activeMonthIndex, setActiveMonthIndex] = useState(initialMonthIndex);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  useEffect(() => {
    setActiveMonthIndex(initialMonthIndex);
  }, [initialMonthIndex]);

  const activeMonth = calendar[activeMonthIndex] ?? derivedCurrentMonth;
  const dates = activeMonth?.days ?? [];

  useEffect(() => {
    if (!activeMonth) {
      setSelectedDayKey(null);
      return;
    }

    if (selectedCalendarDay && selectedCalendarDay.month === activeMonth.month) {
      setSelectedDayKey(getDayKey(activeMonth.month, selectedCalendarDay.date));
      return;
    }

    const fallbackDay =
      (activeMonth.month === derivedCurrentMonth?.month ? derivedToday : null) ||
      activeMonth.days.find((item) => item.event && item.event !== '-') ||
      activeMonth.days.find((item) => item.dayOrder && item.dayOrder !== '-') ||
      activeMonth.days[0] ||
      null;

    setSelectedDayKey(fallbackDay ? getDayKey(activeMonth.month, fallbackDay.date) : null);
  }, [activeMonth, derivedCurrentMonth?.month, derivedToday, selectedCalendarDay]);

  const selectedDay = useMemo(() => {
    if (!activeMonth) return null;
    return (
      activeMonth.days.find((item) => getDayKey(activeMonth.month, item.date) === selectedDayKey) ||
      activeMonth.days[0] ||
      null
    );
  }, [activeMonth, selectedDayKey]);

  const monthEventItems = useMemo(() => {
    if (!activeMonth) return [];

    const withEvents = activeMonth.days
      .filter((item) => item.event && item.event !== '-' && !/^(?:day\s*)?[1-5]$/i.test(item.event))
      .sort((a, b) => Number(a.date) - Number(b.date));

    const selectedKey = selectedDay ? getDayKey(activeMonth.month, selectedDay.date) : null;
    return withEvents.sort((a, b) => {
      const aSelected = selectedKey === getDayKey(activeMonth.month, a.date);
      const bSelected = selectedKey === getDayKey(activeMonth.month, b.date);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return Number(a.date) - Number(b.date);
    });
  }, [activeMonth, selectedDay]);

  function handleSelectDay(date: string) {
    if (!activeMonth) return;
    setSelectedDayKey(getDayKey(activeMonth.month, date));

    const selectedDay = activeMonth.days.find((item) => item.date === date);
    const parsedDayOrder = Number(selectedDay?.dayOrder);

    setSelectedCalendarDay(
      { month: activeMonth.month, date },
      Number.isNaN(parsedDayOrder) || parsedDayOrder <= 0 ? null : parsedDayOrder,
    );
  }

  function goToPreviousMonth() {
    setActiveMonthIndex((current) => Math.max(0, current - 1));
  }

  function goToNextMonth() {
    setActiveMonthIndex((current) => Math.min(calendar.length - 1, current + 1));
  }

  const canGoPrevious = activeMonthIndex > 0;
  const canGoNext = activeMonthIndex < calendar.length - 1;

  return (
    <PageReveal className="flex flex-col gap-8 pb-40 pt-4">
      <AppHeader />

      <section className="mt-2">
        <span className="theme-kicker">current cycle</span>
        <RevealHeading>
          <h1 className="mt-4 font-headline text-[7rem] font-bold leading-[0.82] tracking-tight">
            <span className="text-on-surface">day </span>
            <span className="text-primary">
              {loading || !selectedDay?.dayOrder || selectedDay.dayOrder === '--' || Number.isNaN(Number(selectedDay.dayOrder))
                ? '--'
                : <CountUp value={Number(selectedDay.dayOrder)} />}
            </span>
          </h1>
        </RevealHeading>
        <RevealText>
          <p className="mt-5 font-headline text-2xl font-semibold italic text-on-surface-variant">
            {loading
              ? 'calendar syncing...'
              : selectedDay && activeMonth
                ? `${selectedDay.day.toLowerCase()}, ${activeMonth.month.toLowerCase()} ${selectedDay.date}`
                : activeMonth
                  ? `${formatMonthTitle(activeMonth.month).toLowerCase()} calendar loaded`
                  : 'calendar loading'}
          </p>
        </RevealText>
      </section>

      <RevealItem className="theme-card mt-1 p-7 sm:p-8">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
            {activeMonth ? formatMonthTitle(activeMonth.month).toLowerCase() : 'calendar'}
          </h2>
          <div className="flex gap-3">
            <button
              onClick={goToPreviousMonth}
              disabled={!canGoPrevious}
              className="theme-icon-button flex items-center justify-center"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} className={cn(!canGoPrevious && 'opacity-40')} />
            </button>
            <button
              onClick={goToNextMonth}
              disabled={!canGoNext}
              className="theme-icon-button flex items-center justify-center"
              aria-label="Next month"
            >
              <ChevronRight size={20} className={cn(!canGoNext && 'opacity-40')} />
            </button>
          </div>
        </div>

        {error ? <p className="mb-6 text-sm text-error font-body">{error}</p> : null}
        <div className="grid grid-cols-7 gap-y-8 text-center">
          {days.map((day) => (
            <div key={day} className="font-label text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">{day}</div>
          ))}
          {(loading ? [] : dates).map((date, index) => {
            const dateKey = activeMonth ? getDayKey(activeMonth.month, date.date) : `${date.date}-${index}`;
            const isSelected = dateKey === selectedDayKey;
            const tone = getCalendarTone(date.event || '', date.day);

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => handleSelectDay(date.date)}
                className="group relative flex flex-col items-center"
              >
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-xl font-headline text-xl font-bold transition-all',
                    !isSelected && tone === 'default' && 'text-on-surface group-hover:bg-white/5',
                    !isSelected && tone === 'exam' && 'text-secondary',
                    !isSelected && tone === 'event' && 'text-error',
                    !isSelected && tone === 'holiday' && 'text-warning',
                  )}
                  style={getCalendarDayStyle(tone, isSelected)}
                >
                  {date.date}
                </div>
                {tone !== 'default' ? (
                  <div className="absolute -bottom-3 mt-1 h-1.5 w-1.5 rounded-full" style={{ background: getToneColor(tone), boxShadow: `0 0 10px ${getToneColor(tone)}` }} />
                ) : null}
              </button>
            );
          })}
        </div>
      </RevealItem>

      <RevealText className="mt-2 flex flex-wrap gap-5 px-1">
        <LegendItem color="var(--secondary)" label="major exams" />
        <LegendItem color="var(--error)" label="events" />
        <LegendItem color="var(--warning)" label="holidays" />
        <LegendItem color="var(--text-subtle)" label="day order" />
      </RevealText>

      <section className="mt-4">
        <RevealText className="mb-6 inline-block border-b-2 border-primary px-1">
          <h2 className="pb-1 font-headline text-2xl font-bold lowercase text-on-surface">daily_events</h2>
        </RevealText>

        <GlassCard className="space-y-8 p-6">
          {(monthEventItems.length
            ? monthEventItems
            : [{ date: selectedDay?.date || '--', day: selectedDay?.day || 'stay tuned', dayOrder: selectedDay?.dayOrder || '-', event: selectedDay?.event && selectedDay.event !== '-' ? selectedDay.event : 'no upcoming events' }]
          ).map((item, index) => {
            const tone = getCalendarTone(item.event || '', item.day);
            const isSelected =
              activeMonth &&
              selectedDay &&
              getDayKey(activeMonth.month, item.date) === getDayKey(activeMonth.month, selectedDay.date);

            return (
              <RevealItem key={`${item.date}-${item.event}-${index}`}>
                <AgendaItem
                  time={item.date || '--'}
                  title={(item.event || 'no upcoming events').toLowerCase()}
                  subtitle={`${(item.day || 'stay tuned').toLowerCase()} / day ${item.dayOrder || '-'}`}
                  tone={tone}
                  active={isSelected || index === 0}
                />
              </RevealItem>
            );
          })}
        </GlassCard>
      </section>
    </PageReveal>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <span className="font-label text-[8px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
    </div>
  );
}

function AgendaItem({
  time,
  title,
  subtitle,
  tone,
  active,
}: {
  time: string;
  title: string;
  subtitle: string;
  tone: CalendarTone;
  active?: boolean;
}) {
  const color = getToneColor(tone);

  return (
    <div className="group relative flex gap-6">
      <div className="w-10 pt-1 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/80">{time}</div>
      <div className="relative flex-1 pl-5">
        <div className="absolute bottom-1 left-0 top-1 w-[2px]" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
        <h3 className={cn('font-headline text-[20px] font-bold leading-tight', active && tone === 'default' ? 'text-primary' : 'text-on-surface')} style={tone !== 'default' ? { color } : undefined}>
          {title}
        </h3>
        <p className="mt-1.5 text-[13px] text-on-surface-variant">{subtitle}</p>
      </div>
    </div>
  );
}

function getToneColor(tone: CalendarTone) {
  if (tone === 'holiday') return 'var(--warning)';
  if (tone === 'exam') return 'var(--secondary)';
  if (tone === 'event') return 'var(--error)';
  return 'var(--primary)';
}

function getCalendarDayStyle(tone: CalendarTone, isSelected: boolean) {
  const toneColor = getToneColor(tone);

  if (isSelected) {
    return {
      border: `2px solid ${toneColor}`,
      background: `color-mix(in srgb, ${toneColor} 12%, transparent)`,
      color: toneColor,
      boxShadow: `0 0 18px color-mix(in srgb, ${toneColor} 28%, transparent)`,
      transform: 'scale(1.08)',
    };
  }

  return {
    background: 'transparent',
    border: '1px solid transparent',
  };
}
