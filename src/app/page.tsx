'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

import AppHeader from '@/components/layout/AppHeader';
import HomeFooter from '@/components/layout/HomeFooter';
import DayOrderPills from '@/components/ui/DayOrderPills';
import CountUp from '@/components/ui/CountUp';
import TextType from '@/components/ui/TextType';
import { PageReveal, RevealHeading, RevealItem, RevealText } from '@/components/ui/PageReveal';
import { useAppState } from '@/context/AppStateContext';
import { formatDayOrderNumber, getDayOrders, getOverallAttendance, getScheduleSnapshot, getTotalMarks, getWeakestMark } from '@/lib/academia-ui';
import { useDashboard } from '@/hooks/useDashboard';
import { useCurrentTime } from '@/hooks/useCurrentTime';

export default function HomePage() {
  const { user, attendance, marks, timetable, loading, error } = useDashboard();
  const {
    activeDayOrder,
    availableDayOrders,
    setActiveDayOrder,
  } = useAppState();
  const timetableDayOrders = useMemo(() => getDayOrders(timetable), [timetable]);
  const dayOrders = useMemo(
    () => [...new Set([...availableDayOrders, ...timetableDayOrders])].sort((left, right) => left - right),
    [availableDayOrders, timetableDayOrders],
  );
  const dayOrder = activeDayOrder && dayOrders.includes(activeDayOrder)
    ? activeDayOrder
    : dayOrders[0] || activeDayOrder || 1;
  const currentTime = useCurrentTime();

  const overallAttendance = getOverallAttendance(attendance);
  const totalMarks = getTotalMarks(marks);
  const schedule = useMemo(
    () => getScheduleSnapshot(timetable, dayOrder, dayOrders, currentTime),
    [currentTime, dayOrder, dayOrders, timetable],
  );
  const featuredClass = schedule.classItem;
  const backgroundDayOrder = formatDayOrderNumber(schedule.displayDayOrder ?? dayOrder);
  const scheduleHeading = schedule.status === 'current'
    ? 'current class / subject'
    : schedule.status === 'tomorrow'
      ? "tomorrow's first class"
      : 'next class / subject';
  const weakestMark = getWeakestMark(marks);
  const firstName = user?.name?.split(' ')[0]?.trim() || 'student';
  const profileName = firstName ? `${firstName.charAt(0).toUpperCase()}${firstName.slice(1).toLowerCase()}` : 'Student';
  const greetings = useMemo(
    () => [
      `you made it, ${profileName}`,
      `ready to suffer, ${profileName}?`,
      `lock in, ${profileName}`,
      `still alive, ${profileName}`,
      `cooked yet, ${profileName}?`,
      `FcuKed yet, ${profileName}?`,
      `don't fail today, ${profileName}`,
    ],
    [profileName],
  );
  const greeting = useMemo(() => {
    const seed = `${user?.regNumber || ''}${profileName}`;
    const hash = [...seed].reduce((total, char, index) => total + (char.charCodeAt(0) * (index + 1)), 0);
    return greetings[hash % greetings.length] || greetings[0];
  }, [greetings, profileName, user?.regNumber]);
  const courseTitleMap = useMemo(
    () => new Map(attendance.map((item) => [item.courseCode, item.courseTitle])),
    [attendance],
  );
  const weakestSubjectName = weakestMark
    ? (courseTitleMap.get(weakestMark.course) || weakestMark.course).toLowerCase()
    : null;

  const recentMarks = useMemo(
    () =>
      marks
        .filter((item) => item.total.maxMark > 0)
        .slice(0, 3)
        .map((item) => ({
          ...item,
          displayTitle: (courseTitleMap.get(item.course) || item.course).toLowerCase(),
        })),
    [courseTitleMap, marks],
  );

  return (
    <PageReveal className="flex flex-col gap-8 pb-40 pt-4">
      <AppHeader />

      <section className="mt-1 space-y-2">
        <RevealText>
          <p className="theme-kicker">{user?.department || 'ready for the grind?'}</p>
        </RevealText>
        <RevealHeading>
          <h1 className="font-headline text-[3.6rem] font-bold leading-[0.84] tracking-tight text-on-surface">
            <TextType text={loading ? 'loading' : greeting} typingSpeed={34} startDelay={40} />
          </h1>
        </RevealHeading>
      </section>

      <section className="-mx-4 overflow-x-auto px-4 pb-2">
        <DayOrderPills
          days={dayOrders.length ? dayOrders : [1, 2, 3, 4, 5]}
          activeDayOrder={dayOrder}
          onSelect={setActiveDayOrder}
        />
      </section>

      <RevealItem className="relative overflow-hidden px-1">
        <div className="pointer-events-none absolute right-0 top-0 -z-10 opacity-[0.08]">
          <span className="font-headline text-[12rem] font-bold leading-none tracking-tight text-on-surface">
            {backgroundDayOrder}
          </span>
        </div>

        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            background: 'color-mix(in srgb, var(--surface-soft) 92%, transparent)',
            border: '1px solid color-mix(in srgb, var(--secondary) 22%, transparent)',
          }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
          <span className="font-label text-[9px] font-bold uppercase tracking-widest text-secondary">{scheduleHeading}</span>
        </div>

        <h2 className="mt-6 max-w-full break-words font-headline text-[clamp(3.4rem,21vw,5rem)] font-bold leading-[0.9] tracking-tight text-primary [overflow-wrap:anywhere]">
          <TextType
            text={loading ? 'loading' : featuredClass?.courseTitle?.toLowerCase() || 'no class'}
            typingSpeed={32}
            startDelay={40}
          />
        </h2>
        <p className="mt-3 font-headline text-2xl font-bold tracking-tight text-on-surface-variant">
          {featuredClass?.time || 'schedule unavailable'}
        </p>
      </RevealItem>

      <RevealItem className="grid grid-cols-2 gap-3">
        <div className="theme-card p-6">
          <div className="space-y-0.5">
            <span className="block font-label text-[9px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">overall</span>
            <span className="block font-label text-[9px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">attendance</span>
          </div>
          <div className="mt-2 font-headline text-[2.6rem] font-bold leading-none tracking-tight text-primary">
            {loading ? '0.0%' : <CountUp value={overallAttendance} decimals={1} suffix="%" />}
          </div>
          <div className="mt-3 font-label text-[10px] font-bold uppercase tracking-widest text-secondary">
            {overallAttendance >= 75 ? "you're safe" : 'recovery mode'}
          </div>
        </div>

        <div className="theme-card p-6">
          <span className="block font-label text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">total marks</span>
          <div className="mt-3 font-headline text-[clamp(2.15rem,10vw,2.85rem)] font-bold leading-none tracking-tight text-on-surface">
            {loading ? '0.00' : <CountUp value={totalMarks} decimals={2} />}
          </div>
          <div className="mt-3 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">live internal total</div>
        </div>
      </RevealItem>

      <RevealItem>
        <div
          className="theme-card relative flex flex-col gap-3 p-7"
          style={{
            background: 'linear-gradient(180deg, color-mix(in srgb, var(--error) 10%, var(--surface)) 0%, color-mix(in srgb, var(--surface) 96%, transparent) 100%)',
            borderColor: 'color-mix(in srgb, var(--error) 18%, var(--border))',
          }}
        >
          <AlertTriangle className="absolute right-7 top-7 h-7 w-7 text-error" />
          <h3 className="pr-10 font-headline text-2xl font-bold lowercase leading-tight text-on-surface">
            academic alert: watch your weakest subject
          </h3>
          <p className="text-sm font-semibold text-on-surface-variant">
            {weakestSubjectName ? `${weakestSubjectName} currently needs attention.` : 'all systems nominal.'}
          </p>
        </div>
      </RevealItem>

      <section className="space-y-5">
        <RevealText className="flex items-center justify-between">
          <h3 className="font-headline text-2xl font-bold lowercase text-on-surface">recent marks</h3>
          <Link href="/marks" className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            view all
          </Link>
        </RevealText>
        {error ? <p className="text-sm text-error font-body">{error}</p> : null}
        <div className="flex flex-col gap-4">
          {recentMarks.length ? recentMarks.map((item, index) => (
            <RevealItem key={`${item.course}-${index}`}>
              <MarkItem
                dotColor={index === 0 ? 'var(--secondary)' : index === 1 ? 'var(--primary)' : 'var(--accent)'}
                title={item.displayTitle}
                score={`${item.total.obtained.toFixed(2)}/${(item.total.maxMark || 0).toFixed(2)}`}
              />
            </RevealItem>
          )) : (
            <RevealItem>
              <MarkItem dotColor="var(--secondary)" title={loading ? 'loading' : 'no marks yet'} score="--" />
            </RevealItem>
          )}
        </div>
      </section>

      <RevealItem>
        <HomeFooter />
      </RevealItem>
    </PageReveal>
  );
}

function MarkItem({ dotColor, title, score }: { dotColor: string; title: string; score: string }) {
  return (
    <div className="theme-card flex items-center justify-between p-5">
      <div className="flex min-w-0 items-center gap-4 pr-4">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor, boxShadow: `0 0 12px ${dotColor}` }} />
        <span className="font-headline text-lg font-bold leading-tight text-on-surface">{title}</span>
      </div>
      <span className="font-headline text-xl font-bold tracking-tight text-on-surface">{score}</span>
    </div>
  );
}
