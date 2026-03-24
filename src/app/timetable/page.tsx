'use client';

import React, { useMemo } from 'react';

import AppHeader from '@/components/layout/AppHeader';
import DayOrderPills from '@/components/ui/DayOrderPills';
import GlowCard from '@/components/ui/GlowCard';
import { PageReveal, RevealItem, RevealText } from '@/components/ui/PageReveal';
import { useAppState } from '@/context/AppStateContext';
import { useTimetable } from '@/hooks/useTimetable';
import { getClassesForDay, getDayOrders } from '@/lib/academia-ui';
import { cn } from '@/lib/utils';

export default function TimetablePage() {
  const { timetableRaw, loading, error } = useTimetable();
  const {
    activeDayOrder,
    availableDayOrders,
    setActiveDayOrder,
  } = useAppState();
  const timetableDayOrders = useMemo(() => getDayOrders(timetableRaw), [timetableRaw]);
  const dayOrders = useMemo(
    () => [...new Set([...availableDayOrders, ...timetableDayOrders])].sort((left, right) => left - right),
    [availableDayOrders, timetableDayOrders],
  );
  const dayOrder = activeDayOrder && dayOrders.includes(activeDayOrder)
    ? activeDayOrder
    : dayOrders[0] || activeDayOrder || 1;
  const classes = getClassesForDay(timetableRaw, dayOrder);

  return (
    <PageReveal className="flex flex-col gap-8 pb-32 pt-4">
      <AppHeader />

      <RevealText className="relative z-10 mt-4 flex items-center gap-5">
        <span className="theme-kicker">day order</span>
        <DayOrderPills
          days={dayOrders.length ? dayOrders : [1, 2, 3, 4]}
          activeDayOrder={dayOrder}
          onSelect={setActiveDayOrder}
        />
      </RevealText>

      {error ? <p className="text-sm text-error font-body">{error}</p> : null}
      <section className="relative mt-2">
        <div
          className="absolute bottom-0 left-3 top-4 z-0 w-px"
          style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--border-strong) 80%, transparent), transparent)' }}
        />

        <div className="relative z-10 flex flex-col gap-8">
          {loading ? (
            [1, 2, 3].map((item) => <div key={item} className="ml-8 h-36 rounded-[28px] bg-surface animate-pulse" />)
          ) : classes.length ? (
            classes.map((item, index) => {
              const isPrimary = index === 2;
              const glow = index % 2 === 0 ? 'primary' : 'secondary';

              return (
                <RevealItem key={`${item.slot}-${item.time}-${index}`} className="relative flex gap-6">
                  <div className="relative mt-6">
                    <div
                      className={cn('relative z-10 h-2.5 w-2.5 rounded-full', glow === 'primary' ? 'bg-primary' : 'bg-secondary')}
                      style={{ boxShadow: glow === 'primary' ? 'var(--glow-primary)' : 'var(--glow-secondary)' }}
                    />
                  </div>
                  {isPrimary ? (
                    <div
                      className="theme-card flex-1 p-7 md:p-8"
                      style={{
                        background: 'linear-gradient(180deg, color-mix(in srgb, var(--primary) 9%, var(--surface)) 0%, color-mix(in srgb, var(--surface) 96%, transparent) 100%)',
                        borderColor: 'color-mix(in srgb, var(--primary) 20%, var(--border))',
                      }}
                    >
                      <div
                        className="mb-2 inline-block rounded-full px-3 py-1 font-headline text-[14px] font-bold tracking-widest"
                        style={{
                          background: 'color-mix(in srgb, var(--primary) 14%, transparent)',
                          color: 'var(--primary)',
                        }}
                      >
                        {item.time}
                      </div>
                      <h3 className="mb-6 font-headline text-[28px] font-bold lowercase leading-[1.1] text-on-surface">
                        {item.courseTitle?.toLowerCase()}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <InfoColumn label="room" value={item.courseRoomNo || 'TBA'} />
                        <InfoColumn label="faculty" value={item.faculty || 'Faculty TBA'} />
                      </div>
                    </div>
                  ) : (
                    <GlowCard glowColor={glow} className="flex-1 border-l-2 bg-transparent">
                      <div className="mb-2 font-headline text-[14px] font-bold tracking-widest text-secondary">{item.time}</div>
                      <h3 className="mb-6 pr-4 font-headline text-[26px] font-bold lowercase leading-[1.1] text-on-surface">
                        {item.courseTitle?.toLowerCase()}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <InfoColumn label="room" value={item.courseRoomNo || 'TBA'} />
                        <InfoColumn label="faculty" value={item.faculty || 'Faculty TBA'} />
                      </div>
                    </GlowCard>
                  )}
                </RevealItem>
              );
            })
          ) : (
            <RevealItem className="theme-card ml-8 p-8 text-on-surface-variant">No classes found for this day order.</RevealItem>
          )}
        </div>
      </section>
    </PageReveal>
  );
}

function InfoColumn({
  label,
  value,
  inverse,
}: {
  label: string;
  value: string;
  inverse?: boolean;
}) {
  return (
    <div>
      <span className={cn('mb-1 block font-label text-[9px] font-bold uppercase tracking-[0.2em]', inverse ? 'text-[rgba(0,0,0,0.55)]' : 'text-on-surface-variant')}>
        {label}
      </span>
      <span className={cn('block font-headline text-lg font-bold leading-tight', inverse ? 'text-[var(--text-inverse)]' : 'text-on-surface')}>
        {value}
      </span>
    </div>
  );
}
