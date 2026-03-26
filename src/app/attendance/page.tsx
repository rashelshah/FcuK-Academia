'use client';

import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';

import AppHeader from '@/components/layout/AppHeader';
import AttendancePredictModal from '@/components/attendance/AttendancePredictModal';
import CountUp from '@/components/ui/CountUp';
import SubjectCard from '@/components/dashboard/SubjectCard';
import GlowCard from '@/components/ui/GlowCard';
import { PageReveal, RevealHeading, RevealItem, RevealText } from '@/components/ui/PageReveal';
import { useAppState } from '@/context/AppStateContext';
import { useDashboardDataContext } from '@/context/DashboardDataContext';
import { useAttendance } from '@/hooks/useAttendance';
import type { Subject } from '@/lib/types';
import { formatDayOrderNumber } from '@/lib/academia-ui';

export default function AttendancePage() {
  const { attendance, attendanceList, loading, error } = useAttendance();
  const { calendar, timetable } = useDashboardDataContext();
  const { activeDayOrder } = useAppState();
  const [predictOpen, setPredictOpen] = useState(false);
  const [predictedAttendance, setPredictedAttendance] = useState<Subject[] | null>(null);
  const displayAttendance = predictedAttendance ?? attendance;
  const overallAtt = useMemo(() => {
    const totalConducted = displayAttendance.reduce((sum, item) => sum + item.attendance.total, 0);
    const totalAttended = displayAttendance.reduce((sum, item) => sum + item.attendance.attended, 0);
    return totalConducted ? (totalAttended / totalConducted) * 100 : 0;
  }, [displayAttendance]);
  const critical = useMemo(
    () => [...displayAttendance]
      .filter((item) => item.attendance.percentage < 75)
      .sort((left, right) => left.attendance.percentage - right.attendance.percentage)[0] ?? null,
    [displayAttendance],
  );
  const lowestMarginSubject = useMemo(
    () => [...displayAttendance]
      .map((item) => ({
        ...item,
        margin: Math.max(0, Math.floor((item.attendance.attended / 0.75) - item.attendance.total)),
      }))
      .sort((left, right) => {
        if (left.margin !== right.margin) return left.margin - right.margin;
        return left.attendance.percentage - right.attendance.percentage;
      })[0] ?? null,
    [displayAttendance],
  );
  const recoveryCount = useMemo(
    () => (critical ? Math.max(0, Math.ceil((0.75 * critical.attendance.total - critical.attendance.attended) / 0.25)) : 0),
    [critical],
  );
  const hasRequiredClasses = Boolean(critical);
  const survivedBlue = '#67b7ff';
  const summaryTitle = hasRequiredClasses ? "you're cooked" : 'you survived (for now)';
  const summaryGlowColor = hasRequiredClasses ? 'error' : 'secondary';
  const summaryAccentColor = hasRequiredClasses ? 'var(--error)' : survivedBlue;
  const summaryBody = hasRequiredClasses
    ? `${critical?.name.toLowerCase()} is below the 75% safety threshold`
    : `${lowestMarginSubject?.name.toLowerCase() || 'all tracked courses'} has the least margin`;
  const summaryValue = hasRequiredClasses ? recoveryCount : (lowestMarginSubject?.margin ?? 0);
  const summaryMeta = hasRequiredClasses ? 'to recover' : 'margin left';
  const summarySubject = hasRequiredClasses ? critical?.name.toLowerCase() : lowestMarginSubject?.name.toLowerCase();
  const sortedAttendance = useMemo(
    () => [...displayAttendance].sort((left, right) => {
      const componentPriority = left.attendanceComponent === right.attendanceComponent
        ? 0
        : left.attendanceComponent === 'practical'
          ? 1
          : -1;
      if (componentPriority !== 0) return componentPriority;

      const leftPriority = left.attendance.percentage < 75 ? 0 : 1;
      const rightPriority = right.attendance.percentage < 75 ? 0 : 1;

      if (leftPriority !== rightPriority) return leftPriority - rightPriority;
      return left.attendance.percentage - right.attendance.percentage;
    }),
    [displayAttendance],
  );
  const theorySubjects = useMemo(
    () => sortedAttendance.filter((subject) => subject.attendanceComponent !== 'practical'),
    [sortedAttendance],
  );
  const practicalSubjects = useMemo(
    () => sortedAttendance.filter((subject) => subject.attendanceComponent === 'practical'),
    [sortedAttendance],
  );
  const backgroundDayOrder = formatDayOrderNumber(activeDayOrder);

  return (
    <PageReveal className="flex flex-col gap-8 pb-32 pt-4">
      <AppHeader />

      <section className="relative mt-6">
        <div className="absolute left-0 top-[-1rem] z-0 select-none opacity-[0.08]">
          <span className="font-headline text-[12rem] font-bold leading-none tracking-tight text-on-surface">{backgroundDayOrder}</span>
        </div>
        <RevealHeading className="relative z-10">
          <p className="theme-kicker mb-2">overall attendance</p>
          <span className="font-headline text-[6.6rem] font-bold leading-[0.86] tracking-tight text-primary">
            {loading ? '0.0%' : <CountUp value={overallAtt} decimals={1} suffix="%" />}
          </span>
        </RevealHeading>
      </section>

      <RevealItem>
        <GlowCard
          glowColor={summaryGlowColor}
          className="p-0"
          style={hasRequiredClasses ? undefined : { borderColor: `color-mix(in srgb, ${survivedBlue} 58%, transparent)` }}
        >
          <div
            className="rounded-[inherit] px-6 py-7"
            style={{
              background: hasRequiredClasses
                ? 'linear-gradient(180deg, color-mix(in srgb, var(--error) 10%, var(--surface)) 0%, color-mix(in srgb, var(--surface) 96%, transparent) 100%)'
                : `linear-gradient(180deg, color-mix(in srgb, ${survivedBlue} 14%, var(--surface)) 0%, color-mix(in srgb, var(--surface) 96%, transparent) 100%)`,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-[60%]">
                <h3 className="font-headline text-2xl font-bold lowercase tracking-tight" style={{ color: summaryAccentColor }}>{summaryTitle}</h3>
                <p className="mt-1 pr-4 text-xs text-on-surface-variant">
                  {summaryBody}
                </p>
              </div>
              <div className="text-right">
                <span className="block font-headline text-5xl font-bold leading-none" style={{ color: summaryAccentColor }}>
                  {loading ? '0' : <CountUp value={summaryValue} />}
                </span>
                <span className="mt-1 block font-headline text-xl font-bold lowercase leading-none" style={{ color: summaryAccentColor }}>classes</span>
                <span className="mt-2 block font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{summaryMeta}</span>
                {summarySubject ? (
                  <span className="mt-3 block max-w-[8rem] text-[11px] leading-tight text-on-surface-variant">
                    {summarySubject}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </GlowCard>
      </RevealItem>

      <section className="space-y-6 pt-2">
        <RevealText className="flex items-center justify-between gap-3">
          <h2 className="font-headline text-3xl font-bold lowercase tracking-tight text-on-surface">breakdown</h2>
          <button
            type="button"
            onClick={() => {
              if (predictedAttendance) {
                setPredictedAttendance(null);
                return;
              }
              setPredictOpen(true);
            }}
            className="theme-outline-button px-4 py-3 font-label text-[10px] font-bold uppercase tracking-widest"
          >
            {predictedAttendance ? <X size={14} /> : 'predict'}
          </button>
        </RevealText>
        {error ? <p className="text-sm text-error font-body">{error}</p> : null}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-[28px] bg-surface" />)}
            </div>
          ) : (
            theorySubjects.map((subject, index) => (
              <RevealItem key={`${subject.id}-${index}`}>
                <SubjectCard subject={subject} type="attendance" />
              </RevealItem>
            ))
          )}
        </div>
      </section>

      {practicalSubjects.length ? (
        <section className="space-y-6 pt-2">
          <RevealText>
            <h2 className="font-headline text-3xl font-bold lowercase tracking-tight text-on-surface">practical</h2>
          </RevealText>
          <div className="grid grid-cols-1 gap-6">
            {practicalSubjects.map((subject, index) => (
              <RevealItem key={`${subject.id}-practical-${index}`}>
                <SubjectCard subject={subject} type="attendance" />
              </RevealItem>
            ))}
          </div>
        </section>
      ) : null}

      <AttendancePredictModal
        open={predictOpen}
        attendanceList={attendanceList}
        calendar={calendar}
        timetable={timetable}
        loading={loading}
        onApply={setPredictedAttendance}
        onClose={() => setPredictOpen(false)}
      />
    </PageReveal>
  );
}
