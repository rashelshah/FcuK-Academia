'use client';

import React from 'react';

import AppHeader from '@/components/layout/AppHeader';
import CountUp from '@/components/ui/CountUp';
import ProgressBar from '@/components/ui/ProgressBar';
import SubjectCard from '@/components/dashboard/SubjectCard';
import GlowCard from '@/components/ui/GlowCard';
import { PageReveal, RevealHeading, RevealItem, RevealText } from '@/components/ui/PageReveal';
import { useAppState } from '@/context/AppStateContext';
import { useAttendance } from '@/hooks/useAttendance';
import { getCriticalAttendance, getOverallAttendance } from '@/lib/academia-ui';

export default function AttendancePage() {
  const { attendance, attendanceList, loading, error } = useAttendance();
  const { activeDayOrder, dayOrderSource } = useAppState();
  const overallAtt = getOverallAttendance(attendanceList);
  const critical = getCriticalAttendance(attendanceList);
  const projected = attendanceList.length
    ? ((attendanceList.reduce((sum, item) => sum + (item.courseConducted - item.courseAbsent), 0) + 5) /
      (attendanceList.reduce((sum, item) => sum + item.courseConducted, 0) + 5)) * 100
    : 0;

  return (
    <PageReveal className="flex flex-col gap-8 pb-32 pt-4">
      <AppHeader />

      <RevealItem className="theme-card flex items-center justify-between gap-4 p-5">
        <div>
          <p className="theme-kicker">shared day order</p>
          <p className="mt-2 font-headline text-2xl font-bold text-on-surface">
            Day {activeDayOrder ?? '--'}
          </p>
        </div>
        <span
          className="rounded-[var(--radius-pill)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{
            background: dayOrderSource === 'calendar'
              ? 'color-mix(in srgb, var(--primary) 16%, transparent)'
              : 'color-mix(in srgb, var(--secondary) 16%, transparent)',
            color: dayOrderSource === 'calendar' ? 'var(--primary)' : 'var(--secondary)',
          }}
        >
          {dayOrderSource}
        </span>
      </RevealItem>

      <section className="relative mt-6">
        <div className="absolute left-0 top-[-1rem] z-0 select-none opacity-[0.08]">
          <span className="font-headline text-[12rem] font-bold leading-none tracking-tight text-on-surface">04</span>
        </div>
        <RevealHeading className="relative z-10">
          <p className="theme-kicker mb-2">overall attendance</p>
          <span className="font-headline text-[6.6rem] font-bold leading-[0.86] tracking-tight text-primary">
            {loading ? '0.0%' : <CountUp value={overallAtt} decimals={1} suffix="%" />}
          </span>
        </RevealHeading>
      </section>

      <RevealItem>
        <GlowCard glowColor="error" className="p-0">
          <div
            className="rounded-[inherit] px-6 py-7"
            style={{
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--error) 10%, var(--surface)) 0%, color-mix(in srgb, var(--surface) 96%, transparent) 100%)',
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-[60%]">
                <h3 className="font-headline text-2xl font-bold lowercase tracking-tight text-error">you&apos;re cooked</h3>
                <p className="mt-1 pr-4 text-xs text-on-surface-variant">
                  {critical ? `${critical.courseTitle.toLowerCase()} is below the 75% safety threshold` : 'all tracked courses are above threshold'}
                </p>
              </div>
              <div className="text-right">
                <span className="block font-headline text-5xl font-bold leading-none text-error">
                  {loading ? '0' : <CountUp value={critical ? Math.max(0, Math.ceil((3 * critical.courseConducted) - (4 * (critical.courseConducted - critical.courseAbsent)))) : 0} />}
                </span>
                <span className="mt-1 block font-headline text-xl font-bold lowercase leading-none text-error">classes</span>
                <span className="mt-2 block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">to recover</span>
                {critical ? (
                  <span className="mt-3 block max-w-[8rem] text-[11px] leading-tight text-on-surface-variant">
                    {critical.courseTitle.toLowerCase()}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </GlowCard>
      </RevealItem>

      <section className="space-y-4 pt-2">
        <RevealText className="flex items-end justify-between">
          <h2 className="font-headline text-3xl font-bold lowercase tracking-tight text-on-surface">simulator</h2>
          <span
            className="rounded-full px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest text-primary"
            style={{ background: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}
          >
            beta access
          </span>
        </RevealText>
        <RevealItem className="theme-card p-6">
          <div className="mb-6 flex items-baseline justify-between gap-3">
            <span className="font-body text-sm font-semibold lowercase text-on-surface">if you attend the next 5 classes...</span>
            <span className="font-headline text-4xl font-bold tracking-tight text-secondary">
              {loading ? '0.0%' : <CountUp value={projected} decimals={1} suffix="%" />}
            </span>
          </div>
          <ProgressBar value={projected} color="var(--secondary)" showText={false} className="mb-6" />
          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="theme-outline-button px-4 py-3 font-label text-[10px] font-bold uppercase tracking-widest">
              + add session
            </button>
            <button type="button" className="theme-outline-button px-4 py-3 font-label text-[10px] font-bold uppercase tracking-widest">
              - skip session
            </button>
          </div>
        </RevealItem>
      </section>

      <section className="space-y-6 pt-2">
        <RevealText>
          <h2 className="font-headline text-3xl font-bold lowercase tracking-tight text-on-surface">breakdown</h2>
        </RevealText>
        {error ? <p className="text-sm text-error font-body">{error}</p> : null}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-[28px] bg-surface" />)}
            </div>
          ) : (
            attendance.map((subject, index) => (
              <RevealItem key={`${subject.id}-${index}`}>
                <SubjectCard subject={subject} type="attendance" />
              </RevealItem>
            ))
          )}
        </div>
      </section>
    </PageReveal>
  );
}
