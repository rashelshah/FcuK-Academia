'use client';

import React, { useMemo, useState } from 'react';

import AppHeader from '@/components/layout/AppHeader';
import DayOrderPills from '@/components/ui/DayOrderPills';
import GlowCard from '@/components/ui/GlowCard';
import { PageReveal, RevealItem, RevealText } from '@/components/ui/PageReveal';
import { useAppState } from '@/context/AppStateContext';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useTimetable } from '@/hooks/useTimetable';
import { getClassesForDay, getCurrentClassIndex, getDayOrders } from '@/lib/academia-ui';
import { cn } from '@/lib/utils';
import { Download } from 'lucide-react';
import TimetableDownloadModal from '@/components/timetable/TimetableDownloadModal';

export default function TimetablePage() {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
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
  const currentTime = useCurrentTime();
  const highlightedClassIndex = useMemo(
    () => getCurrentClassIndex(classes, currentTime),
    [classes, currentTime],
  );

  return (
    <>
    <PageReveal className="flex flex-col gap-8 pb-32 pt-4 print:hidden">
      <AppHeader />

      <RevealText className="relative z-10 mt-4 flex items-center justify-between gap-3 sm:gap-5 pr-2 sm:pr-4">
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="theme-kicker hidden sm:inline">day order</span>
          <DayOrderPills
            days={dayOrders.length ? dayOrders : [1, 2, 3, 4]}
            activeDayOrder={dayOrder}
            onSelect={setActiveDayOrder}
          />
        </div>
        <button
          onClick={() => setIsDownloadModalOpen(true)}
          className="flex h-9 w-9 sm:h-11 sm:w-auto sm:px-5 shrink-0 items-center justify-center gap-2 rounded-full bg-primary font-headline text-sm font-bold text-on-primary shadow-[var(--glow-primary)] hover:opacity-90 transition-all"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Download</span>
        </button>
      </RevealText>

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
              const isPrimary = index === highlightedClassIndex;
              const glowColors: ('primary' | 'secondary' | 'error')[] = ['primary', 'secondary', 'error'];
              const glow = glowColors[index % glowColors.length];

              return (
                <RevealItem key={`${item.slot}-${item.time}-${index}`} className="relative flex gap-6">
                  <div className="relative mt-6">
                    <div
                      className={cn('relative z-10 h-2.5 w-2.5 rounded-full', glow === 'primary' ? 'bg-primary' : glow === 'secondary' ? 'bg-secondary' : 'bg-error')}
                      style={{ boxShadow: glow === 'primary' ? 'var(--glow-primary)' : glow === 'secondary' ? 'var(--glow-secondary)' : 'var(--glow-error)' }}
                    />
                  </div>
                  {isPrimary ? (
                    <div
                      className="theme-card flex-1 p-7 md:p-8"
                      style={{
                        background: 'linear-gradient(180deg, color-mix(in srgb, var(--primary) 9%, var(--surface)) 0%, color-mix(in srgb, var(--surface) 96%, transparent) 100%)',
                        borderColor: 'color-mix(in srgb, var(--primary) 20%, var(--border))',
                        '--card-edge-color': `var(--${glow})`,
                      } as React.CSSProperties}
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
                    <GlowCard glowColor={glow} className="flex-1 border-l-2 bg-transparent" style={{ '--card-edge-color': `var(--${glow})` } as React.CSSProperties}>
                      <div className={cn("mb-2 font-headline text-[14px] font-bold tracking-widest", glow === 'primary' ? 'text-primary' : glow === 'secondary' ? 'text-secondary' : 'text-error')}>{item.time}</div>
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
    <TimetableDownloadModal 
      isOpen={isDownloadModalOpen} 
      onClose={() => setIsDownloadModalOpen(false)} 
      timetable={timetableRaw} 
    />
    </>
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
