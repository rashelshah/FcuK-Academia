'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Bell, AlertTriangle, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  const calendarDates = [
    { day: '', muted: true },
    { day: '01' },
    { day: '02', dot: 'red' },
    { day: '03' },
    { day: '04', dots: ['cyan', 'cyan'] },
    { day: '05', muted: true },
    { day: '06', muted: true },
    { day: '07' },
    { day: '08' },
    { day: '09', dot: 'red' },
    { day: '10' },
    { day: '11', dot: 'grey' },
    { day: '12', muted: true },
    { day: '13', muted: true },
    { day: '14' },
    { day: '15' },
    { day: '16' },
    { day: '17' },
    { day: '18' },
    { day: '19', muted: true },
    { day: '20', muted: true },
    { day: '21' },
    { day: '22' },
    { day: '23' },
    { day: '24', active: true, dot: 'cyan' },
    { day: '25' },
    { day: '26', muted: true },
    { day: '27', muted: true },
    { day: '28' },
    { day: '29' },
    { day: '30' },
    { day: '31' },
    { day: '01', muted: true },
    { day: '02', muted: true },
    { day: '03', muted: true },
  ];

  return (
    <div className="flex flex-col gap-8 pb-40 pt-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 relative">
            <Image 
              src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop" 
              alt="Profile" 
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <span className="font-headline font-bold text-xl text-primary tracking-tighter lowercase">fcuk academia</span>
        </div>
        <Bell className="text-primary w-6 h-6" />
      </header>

      {/* Hero Day Display (Image 3) */}
      <section className="mt-4">
        <span className="font-label text-[10px] font-bold tracking-[0.2em] text-[#808080] uppercase">CURRENT CYCLE</span>
        <h1 className="font-headline text-[7.5rem] font-bold leading-[0.8] tracking-tighter text-white mt-4">day 08</h1>
        <p className="font-headline text-2xl font-semibold italic text-[#808080] mt-6">thursday, october 24th</p>
      </section>

      {/* Status Box (Image 3) */}
      <section className="mt-2">
         <div className="inline-flex flex-col gap-1 border-l-4 border-secondary bg-[#121212]/60 px-6 py-4 rounded-r-lg">
            <span className="font-label text-[9px] font-bold tracking-widest text-[#808080] uppercase">STATUS</span>
            <span className="font-headline text-xl font-bold text-secondary lowercase">in_session</span>
         </div>
      </section>

      {/* Month Grid (Image 3/4) */}
      <section className="bg-[#121212] rounded-[42px] p-10 mt-10 border border-white/5 shadow-[0_4px_44px_rgba(0,0,0,0.6)]">
         <div className="flex items-center justify-between mb-12">
            <h2 className="font-headline text-3xl font-bold text-white tracking-tight">october 2024</h2>
            <div className="flex gap-4">
               <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#808080] bg-[#1c1c1c] hover:text-white transition-colors">
                  <ChevronLeft size={20} />
               </button>
               <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#808080] bg-[#1c1c1c] hover:text-white transition-colors">
                  <ChevronRight size={20} />
               </button>
            </div>
         </div>

         <div className="grid grid-cols-7 gap-y-8 text-center">
            {days.map(d => (
              <div key={d} className="font-label text-[9px] font-bold tracking-[0.2em] text-[#444] uppercase">{d}</div>
            ))}
            {calendarDates.map((date, i) => (
              <div key={i} className="relative flex flex-col items-center group cursor-pointer">
                 <div className={cn(
                    "w-11 h-11 flex items-center justify-center font-headline text-xl font-bold transition-all",
                    date.active 
                      ? "border-2 border-primary rounded-xl bg-primary/10 text-primary shadow-[0_0_20px_rgba(182,255,0,0.3)] scale-110" 
                      : date.muted 
                        ? "text-[#333]" 
                        : "text-white group-hover:bg-white/5 rounded-lg"
                 )}>
                    {date.day}
                 </div>
                 {/* Dot Indicators */}
                 <div className="flex gap-0.5 mt-1 absolute -bottom-3">
                    {date.dots ? date.dots.map((dot, idx) => (
                       <div key={idx} className={cn("w-1.5 h-1.5 rounded-full shadow-sm", dot === 'cyan' ? 'bg-secondary' : 'bg-error')} />
                    )) : date.dot && (
                       <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm", 
                          date.dot === 'cyan' ? 'bg-secondary' : 
                          date.dot === 'red' ? 'bg-error' : 'bg-[#444]'
                       )} />
                    )}
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* Legend & Agenda (Image 4 style) */}
      <section className="flex gap-6 px-1 mt-8">
        <LegendItem color="bg-secondary" label="MAJOR EXAMS" />
        <LegendItem color="bg-error" label="DEADLINES" />
        <LegendItem color="bg-[#444]" label="OPTIONAL" />
      </section>

      <section className="mt-8">
        <div className="inline-block border-b-2 border-primary mb-8 px-1">
           <h2 className="font-headline text-2xl font-bold lowercase text-white pb-1">today&apos;s_agenda</h2>
        </div>

        <GlassCard className="p-8 space-y-10 bg-[#121212]/50 backdrop-blur-xl border border-white/5">
           <AgendaItem time="09:00" title="Advanced Chaos Theory" subtitle="Studio Room 402 • Prof. Vane" />
           <AgendaItem time="13:30" title={'Project "Anarchy" Review'} subtitle="Main Hallway Exhibition" active />
           <AgendaItem time="16:00" title="Coffee & Radical Thinking" subtitle="Student Hub" />
        </GlassCard>
      </section>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]", color === 'bg-secondary' ? 'text-secondary' : color === 'bg-error' ? 'text-error' : 'text-[#444]', color)} />
      <span className="font-label text-[8px] font-bold tracking-widest text-[#808080] uppercase">{label}</span>
    </div>
  );
}

function AgendaItem({ time, title, subtitle, active }: { time: string, title: string, subtitle: string, active?: boolean }) {
  return (
    <div className="flex gap-8 relative group">
      <div className="w-12 pt-1 font-label text-[10px] font-bold tracking-widest text-[#808080] uppercase opacity-70">{time}</div>
      <div className={cn(
        "flex-1 relative pl-5",
        active && "text-secondary"
      )}>
        {active && <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-secondary shadow-[0_0_12px_var(--secondary)]" />}
        <h3 className={cn("font-headline text-[20px] font-bold leading-tight", active ? "text-secondary" : "text-white")}>{title}</h3>
        <p className="text-[13px] text-[#808080] mt-1.5 font-body">{subtitle}</p>
      </div>
    </div>
  );
}
