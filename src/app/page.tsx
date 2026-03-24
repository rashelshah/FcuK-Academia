'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Bell, AlertTriangle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { createAvatarUrl, getAverageMarks, getNextClass, getOverallAttendance, getWeakestMark, getDayOrders, getUpcomingCalendarEvents } from '@/lib/academia-ui';
import { useDashboard } from '@/hooks/useDashboard';

export default function HomePage() {
  const { user, attendance, marks, timetable, calendar, loading, error } = useDashboard();
  const dayOrders = useMemo(() => getDayOrders(timetable), [timetable]);
  const [dayOrder, setDayOrder] = useState(dayOrders[0] || 1);

  const overallAttendance = getOverallAttendance(attendance);
  const averageMarks = getAverageMarks(marks);
  const nextClass = getNextClass(timetable, dayOrder);
  const weakestMark = getWeakestMark(marks);
  const upcomingEvent = getUpcomingCalendarEvents(calendar)[0];
  const profileName = user?.name?.split(' ')[0]?.toLowerCase() || 'student';
  const avatarUrl = createAvatarUrl(user?.name || 'SRM Student');

  const recentMarks = marks.filter((item) => item.total.maxMark > 0).slice(0, 3);

  return (
    <div className="flex flex-col gap-10 pb-40 pt-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 relative">
            <Image src={avatarUrl} alt="Profile" fill className="object-cover" unoptimized />
          </div>
          <span className="font-headline font-bold text-xl text-primary tracking-tighter lowercase">fcuk academia</span>
        </div>
        <Bell className="text-primary w-6 h-6" />
      </header>

      <section className="mt-2">
        <h1 className="font-headline text-[3.8rem] font-bold leading-[0.8] tracking-tighter text-white">sup, {profileName}</h1>
        <p className="font-label text-[10px] font-bold tracking-[0.2em] text-[#808080] uppercase mt-4">
          {user?.department || 'ready for the grind?'}
        </p>
      </section>

      <section className="flex gap-3">
        {(dayOrders.length ? dayOrders : [1, 2, 3, 4, 5]).map((num) => (
          <button
            key={num}
            onClick={() => setDayOrder(num)}
            className={cn(
              'w-[4.4rem] h-[4.4rem] rounded-full font-headline text-2xl font-bold flex items-center justify-center transition-all',
              dayOrder === num ? 'bg-primary text-[#1c1b18] shadow-[0_0_20px_rgba(182,255,0,0.5)]' : 'border-2 border-[#2c2c2c] text-[#808080]',
            )}
          >
            {num}
          </button>
        ))}
      </section>

      <section className="relative mt-4">
        <div className="absolute right-0 top-0 opacity-[0.05] -z-10">
          <span className="font-headline text-[12rem] font-bold tracking-tighter leading-none">01</span>
        </div>

        <div className="inline-flex items-center gap-2 bg-[#1c1c1c] border border-secondary/20 rounded-full px-4 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span className="font-label text-[9px] font-bold tracking-widest text-secondary uppercase">FIRST CLASS • SUBJECT</span>
        </div>

        <h2 className="font-headline text-[5.2rem] font-bold text-primary leading-[0.85] tracking-tighter mt-6">
          {loading ? 'loading' : nextClass?.courseTitle?.toLowerCase() || 'no class'}
        </h2>
        <p className="font-headline text-2xl font-bold text-[#808080] mt-3 tracking-tight">{nextClass?.time || 'schedule unavailable'}</p>
      </section>

      <section className="flex gap-4">
        <div className="bg-[#121212] rounded-[32px] p-7 flex-1 border border-white/5">
          <span className="font-label text-[9px] font-bold tracking-[0.2em] text-[#808080] uppercase">ATTENDANCE</span>
          <div className="font-headline text-[2.8rem] font-bold text-primary mt-1 leading-none tracking-tighter">{overallAttendance.toFixed(1)}%</div>
          <div className="font-label text-[10px] font-bold tracking-widest text-secondary mt-3 uppercase">
            {overallAttendance >= 75 ? "you're safe" : 'recovery mode'}
          </div>
        </div>
        <div className="bg-[#121212] rounded-[32px] p-7 flex-1 border border-white/5">
          <span className="font-label text-[9px] font-bold tracking-[0.2em] text-[#808080] uppercase">AVG GRADE</span>
          <div className="font-headline text-[2.8rem] font-bold text-white mt-1 leading-none tracking-tighter">{averageMarks.toFixed(1)}</div>
          <div className="font-label text-[10px] font-bold tracking-widest text-[#808080] mt-3 uppercase">live internal average</div>
        </div>
      </section>

      <section>
        <div className="bg-error rounded-[28px] p-8 flex flex-col gap-3 relative shadow-[0_4px_24px_rgba(255,115,81,0.3)]">
          <AlertTriangle className="absolute right-8 top-8 w-8 h-8 text-[#1c1b18]" />
          <h3 className="font-headline text-2xl font-bold lowercase text-[#1c1b18] leading-tight pr-12">academic alert: {upcomingEvent?.event?.toLowerCase() || 'watch your weakest subject'}</h3>
          <p className="font-body font-bold text-[#1c1b18] text-sm">{upcomingEvent ? `${upcomingEvent.day} ${upcomingEvent.date}` : weakestMark ? `${weakestMark.course} currently needs attention.` : 'all systems nominal.'}</p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-2xl font-bold lowercase text-white">recent marks</h3>
          <button className="font-label text-[10px] font-bold tracking-widest text-[#808080] uppercase border-b border-[#333] pb-0.5">VIEW ALL</button>
        </div>
        {error ? <p className="text-sm text-error font-body">{error}</p> : null}
        <div className="flex flex-col gap-4">
          {recentMarks.length ? recentMarks.map((item, index) => (
            <MarkItem
              key={`${item.course}-${index}`}
              dotColor={index === 0 ? 'bg-secondary' : index === 1 ? 'bg-primary' : 'bg-[#ff9d68]'}
              title={item.course}
              score={`${item.total.obtained}/${item.total.maxMark || 0}`}
            />
          )) : (
            <MarkItem dotColor="bg-secondary" title={loading ? 'loading' : 'no marks yet'} score="--" />
          )}
        </div>
      </section>
    </div>
  );
}

function MarkItem({ dotColor, title, score }: { dotColor: string; title: string; score: string }) {
  return (
    <div className="bg-[#121212] rounded-[24px] p-5 flex items-center justify-between border border-white/5">
      <div className="flex items-center gap-4">
        <div className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />
        <span className="font-headline text-lg font-bold text-white">{title}</span>
      </div>
      <span className="font-headline text-xl font-bold text-white tracking-tighter">{score}</span>
    </div>
  );
}
