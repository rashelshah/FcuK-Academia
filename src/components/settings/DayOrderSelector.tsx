'use client';

import Link from 'next/link';
import React from 'react';

import GlassCard from '@/components/ui/GlassCard';
import { useAppState } from '@/context/AppStateContext';

export default function DayOrderSelector() {
  const { activeDayOrder, dayOrderSource, selectedCalendarDay } = useAppState();

  return (
    <GlassCard className="space-y-5 p-5">
      <div className="space-y-1.5">
        <p className="theme-kicker">day order sync</p>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-headline text-2xl font-bold text-on-surface">active day {activeDayOrder ?? '--'}</h3>
          <span
            className="rounded-[var(--radius-pill)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{
              background: 'color-mix(in srgb, var(--primary) 16%, transparent)',
              color: 'var(--primary)',
            }}
          >
            {dayOrderSource} source
          </span>
        </div>
        <p className="text-sm leading-5 text-on-surface-variant">
          Calendar selection is view-only. The shared day order is automatic unless you pick one manually.
        </p>
      </div>

      <div
        className="rounded-[var(--radius-md)] border px-4 py-3.5"
        style={{
          borderColor: 'var(--card-border)',
          background: 'color-mix(in srgb, var(--surface-soft) 90%, transparent)',
        }}
      >
        <p className="theme-kicker">selected calendar entry</p>
        <p className="mt-2 text-sm font-semibold text-on-surface">
          {selectedCalendarDay ? `${selectedCalendarDay.month} / ${selectedCalendarDay.date}` : 'No synced date selected yet.'}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <Link href="/calendar" className="font-semibold text-primary">
          Open calendar
        </Link>
        <span className="text-on-surface-variant">source of truth</span>
      </div>
    </GlassCard>
  );
}
