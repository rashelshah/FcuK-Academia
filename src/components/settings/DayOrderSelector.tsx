'use client';

import Link from 'next/link';
import React from 'react';

import GlassCard from '@/components/ui/GlassCard';
import DayOrderPills from '@/components/ui/DayOrderPills';
import { useAppState } from '@/context/AppStateContext';

export default function DayOrderSelector() {
  const {
    activeDayOrder,
    availableDayOrders,
    dayOrderSource,
    setActiveDayOrder,
    clearManualDayOrder,
  } = useAppState();

  const days = availableDayOrders.length ? availableDayOrders : [1, 2, 3, 4, 5];

  return (
    <GlassCard className="space-y-5 p-5">
      <div className="space-y-1.5">
        <p className="theme-kicker">day order sync</p>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-headline text-2xl font-bold text-on-surface">active day {activeDayOrder ?? '--'}</h3>
          <span
            className="rounded-[var(--radius-pill)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{
              background: dayOrderSource === 'calendar'
                ? 'color-mix(in srgb, var(--primary) 16%, transparent)'
                : 'color-mix(in srgb, var(--secondary) 16%, transparent)',
              color: dayOrderSource === 'calendar' ? 'var(--primary)' : 'var(--secondary)',
            }}
          >
            {dayOrderSource === 'calendar' ? 'calendar sync' : 'manual override'}
          </span>
        </div>
        <p className="text-sm leading-5 text-on-surface-variant">
          Calendar drives the shared day order across the app.
        </p>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <DayOrderPills days={days} activeDayOrder={activeDayOrder} onSelect={setActiveDayOrder} />
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <Link href="/calendar" className="font-semibold text-primary">
          Open calendar
        </Link>
        {dayOrderSource === 'manual' ? (
          <button type="button" onClick={clearManualDayOrder} className="font-semibold text-secondary">
            Reset to calendar
          </button>
        ) : null}
      </div>
    </GlassCard>
  );
}
