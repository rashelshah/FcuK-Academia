'use client';

import React from 'react';
import Image from 'next/image';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';

import GlassCard from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { useCalendar } from '@/hooks/useCalendar';
import { useUser } from '@/hooks/useUser';
import { createAvatarUrl, formatMonthTitle, getCurrentCalendarMonth, getTodayCalendarItem, getUpcomingCalendarEvents } from '@/lib/academia-ui';

const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function CalendarPage() {
  const { calendar, loading, error } = useCalendar();
  const { user } = useUser();
  const avatarUrl = createAvatarUrl(user?.name || 'SRM Student');
  const currentMonth = getCurrentCalendarMonth(calendar);
  const today = getTodayCalendarItem(calendar);
  const agenda = getUpcomingCalendarEvents(calendar);
  const dates = currentMonth?.days ?? [];

  return (
    <div className="flex flex-col gap-8 pb-40 pt-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 relative">
            <Image src={avatarUrl} alt="Profile" fill className="object-cover" unoptimized />
          </div>
          <span className="font-headline font-bold text-xl text-primary tracking-tighter lowercase">fcuk academia</span>
        </div>
        <Bell className="text-primary w-6 h-6" />
      </header>

      <section className="mt-4">
        <span className="font-label text-[10px] font-bold tracking-[0.2em] text-[#808080] uppercase">CURRENT CYCLE</span>
        <h1 className="font-headline text-[7.5rem] font-bold leading-[0.8] tracking-tighter text-white mt-4">day {today?.dayOrder || '--'}</h1>
        <p className="font-headline text-2xl font-semibold italic text-[#808080] mt-6">
          {today ? `${today.day.toLowerCase()}, ${currentMonth?.month.toLowerCase()} ${today.date}` : 'calendar syncing...'}
        </p>
      </section>

      <section className="mt-2">
        <div className="inline-flex flex-col gap-1 border-l-4 border-secondary bg-[#121212]/60 px-6 py-4 rounded-r-lg">
          <span className="font-label text-[9px] font-bold tracking-widest text-[#808080] uppercase">STATUS</span>
          <span className="font-headline text-xl font-bold text-secondary lowercase">{today?.event?.toLowerCase() || 'in_session'}</span>
        </div>
      </section>

      <section className="bg-[#121212] rounded-[42px] p-10 mt-10 border border-white/5 shadow-[0_4px_44px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-headline text-3xl font-bold text-white tracking-tight">{currentMonth ? formatMonthTitle(currentMonth.month).toLowerCase() : 'calendar'}</h2>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#808080] bg-[#1c1c1c] hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#808080] bg-[#1c1c1c] hover:text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {error ? <p className="text-sm text-error font-body mb-6">{error}</p> : null}
        <div className="grid grid-cols-7 gap-y-8 text-center">
          {days.map((d) => (
            <div key={d} className="font-label text-[9px] font-bold tracking-[0.2em] text-[#444] uppercase">{d}</div>
          ))}
          {(loading ? [] : dates).map((date, index) => (
            <div key={`${date.date}-${index}`} className="relative flex flex-col items-center group cursor-pointer">
              <div
                className={cn(
                  'w-11 h-11 flex items-center justify-center font-headline text-xl font-bold transition-all',
                  date.date === today?.date
                    ? 'border-2 border-primary rounded-xl bg-primary/10 text-primary shadow-[0_0_20px_rgba(182,255,0,0.3)] scale-110'
                    : 'text-white group-hover:bg-white/5 rounded-lg',
                )}
              >
                {date.date}
              </div>
              <div className="flex gap-0.5 mt-1 absolute -bottom-3">
                {date.event ? <div className={cn('w-1.5 h-1.5 rounded-full shadow-sm', date.event.toLowerCase().includes('exam') ? 'bg-secondary' : 'bg-error')} /> : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex gap-6 px-1 mt-8">
        <LegendItem color="bg-secondary" label="MAJOR EXAMS" />
        <LegendItem color="bg-error" label="EVENTS" />
        <LegendItem color="bg-[#444]" label="DAY ORDER" />
      </section>

      <section className="mt-8">
        <div className="inline-block border-b-2 border-primary mb-8 px-1">
          <h2 className="font-headline text-2xl font-bold lowercase text-white pb-1">today&apos;s_agenda</h2>
        </div>

        <GlassCard className="p-8 space-y-10 bg-[#121212]/50 backdrop-blur-xl border border-white/5">
          {(agenda.length ? agenda : [{ date: '--', event: 'no upcoming events', day: 'stay tuned', dayOrder: '-', month: '' }]).map((item, index) => (
            <AgendaItem
              key={`${item.date}-${item.event}-${index}`}
              time={item.date}
              title={item.event || 'no event'}
              subtitle={`${item.day} • day ${item.dayOrder}`}
              active={index === 0}
            />
          ))}
        </GlassCard>
      </section>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]', color === 'bg-secondary' ? 'text-secondary' : color === 'bg-error' ? 'text-error' : 'text-[#444]', color)} />
      <span className="font-label text-[8px] font-bold tracking-widest text-[#808080] uppercase">{label}</span>
    </div>
  );
}

function AgendaItem({ time, title, subtitle, active }: { time: string; title: string; subtitle: string; active?: boolean }) {
  return (
    <div className="flex gap-8 relative group">
      <div className="w-12 pt-1 font-label text-[10px] font-bold tracking-widest text-[#808080] uppercase opacity-70">{time}</div>
      <div className={cn('flex-1 relative pl-5', active && 'text-secondary')}>
        {active ? <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-secondary shadow-[0_0_12px_var(--secondary)]" /> : null}
        <h3 className={cn('font-headline text-[20px] font-bold leading-tight', active ? 'text-secondary' : 'text-white')}>{title}</h3>
        <p className="text-[13px] text-[#808080] mt-1.5 font-body">{subtitle}</p>
      </div>
    </div>
  );
}
