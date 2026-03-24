'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Bell, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlassCard from '@/components/ui/GlassCard';

export default function HomePage() {
  const [dayOrder, setDayOrder] = useState(1);

  return (
    <div className="flex flex-col gap-10 pb-40 pt-4">
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

      {/* Greeting (Image 1) */}
      <section className="mt-2">
        <h1 className="font-headline text-[3.8rem] font-bold leading-[0.8] tracking-tighter text-white">sup, alex</h1>
        <p className="font-label text-[10px] font-bold tracking-[0.2em] text-[#808080] uppercase mt-4">READY FOR THE GRIND?</p>
      </section>

      {/* Day Selector (Image 1 style) */}
      <section className="flex gap-3">
        {[1, 2, 3, 4, 5].map(num => (
          <button
            key={num}
            onClick={() => setDayOrder(num)}
            className={cn(
               "w-[4.4rem] h-[4.4rem] rounded-full font-headline text-2xl font-bold flex items-center justify-center transition-all",
               dayOrder === num 
                 ? "bg-primary text-[#1c1b18] shadow-[0_0_20px_rgba(182,255,0,0.5)]" 
                 : "border-2 border-[#2c2c2c] text-[#808080]"
            )}
          >
            {num}
          </button>
        ))}
      </section>

      {/* Next Class Highlight (Image 1) */}
      <section className="relative mt-4">
        <div className="absolute right-0 top-0 opacity-[0.05] -z-10">
           <span className="font-headline text-[12rem] font-bold tracking-tighter leading-none">01</span>
        </div>
        
        <div className="inline-flex items-center gap-2 bg-[#1c1c1c] border border-secondary/20 rounded-full px-4 py-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
           <span className="font-label text-[9px] font-bold tracking-widest text-secondary uppercase">FIRST CLASS • SUBJECT</span>
        </div>

        <h2 className="font-headline text-[5.2rem] font-bold text-primary leading-[0.85] tracking-tighter mt-6">
           data structures
        </h2>
        <p className="font-headline text-2xl font-bold text-[#808080] mt-3 tracking-tight">8:30—9:30 AM</p>
      </section>

      {/* Stats Row (Image 1) */}
      <section className="flex gap-4">
        <div className="bg-[#121212] rounded-[32px] p-7 flex-1 border border-white/5">
           <span className="font-label text-[9px] font-bold tracking-[0.2em] text-[#808080] uppercase">ATTENDANCE</span>
           <div className="font-headline text-[2.8rem] font-bold text-primary mt-1 leading-none tracking-tighter">77.8%</div>
           <div className="font-label text-[10px] font-bold tracking-widest text-secondary mt-3 uppercase">you&apos;re safe</div>
        </div>
        <div className="bg-[#121212] rounded-[32px] p-7 flex-1 border border-white/5">
           <span className="font-label text-[9px] font-bold tracking-[0.2em] text-[#808080] uppercase">AVG GRADE</span>
           <div className="font-headline text-[2.8rem] font-bold text-white mt-1 leading-none tracking-tighter">16.4</div>
           <div className="font-label text-[10px] font-bold tracking-widest text-[#808080] mt-3 uppercase">top 5% of class</div>
        </div>
      </section>

      {/* Academic Alert (Image 1) */}
      <section>
        <div className="bg-error rounded-[28px] p-8 flex flex-col gap-3 relative shadow-[0_4px_24px_rgba(255,115,81,0.3)]">
           <AlertTriangle className="absolute right-8 top-8 w-8 h-8 text-[#1c1b18]" />
           <h3 className="font-headline text-2xl font-bold lowercase text-[#1c1b18] leading-tight pr-12">academic alert: exam approaching!</h3>
           <p className="font-body font-bold text-[#1c1b18] text-sm">Discrete Math in 48 hours.</p>
        </div>
      </section>

      {/* Recent Marks (Image 2) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="font-headline text-2xl font-bold lowercase text-white">recent marks</h3>
           <button className="font-label text-[10px] font-bold tracking-widest text-[#808080] uppercase border-b border-[#333] pb-0.5">VIEW ALL</button>
        </div>
        <div className="flex flex-col gap-4">
           <MarkItem dotColor="bg-secondary" title="Algo Design" score="15/20" />
           <MarkItem dotColor="bg-primary" title="System Arch" score="18/20" />
           <MarkItem dotColor="bg-[#ff9d68]" title="UX Principles" score="12/20" />
        </div>
      </section>
    </div>
  );
}

function MarkItem({ dotColor, title, score }: { dotColor: string, title: string, score: string }) {
  return (
    <div className="bg-[#121212] rounded-[24px] p-5 flex items-center justify-between border border-white/5">
       <div className="flex items-center gap-4">
          <div className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
          <span className="font-headline text-lg font-bold text-white">{title}</span>
       </div>
       <span className="font-headline text-xl font-bold text-white tracking-tighter">{score}</span>
    </div>
  );
}
