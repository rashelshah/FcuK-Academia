'use client';

import React, { useState } from 'react';
import GlowCard from '@/components/ui/GlowCard';
import { Bell } from 'lucide-react';
import Image from 'next/image';

export default function TimetablePage() {
  const [dayOrder, setDayOrder] = useState(1);

  return (
    <div className="flex flex-col gap-8 pb-32 pt-4">
      {/* Header from Image 1 */}
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

      {/* Day Order Selector (Image 1 style) */}
      <section className="flex items-center gap-6 mt-4 z-10 relative">
        <span className="font-label text-[10px] font-bold tracking-widest text-[#adaaaa] uppercase">day order</span>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => setDayOrder(num)}
              className={`w-11 h-11 rounded-full font-headline text-xl font-bold flex items-center justify-center transition-all ${
                dayOrder === num 
                  ? 'bg-[#e0eab0] text-[#1c1b18] shadow-[0_0_15px_rgba(224,234,176,0.4)]' 
                  : 'border-2 border-[#3a3a3a] text-[#808080] hover:border-white/20'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="relative mt-8">
        <div className="absolute left-3 top-4 bottom-0 w-[1px] bg-gradient-to-b from-[#2a2a2a] to-transparent z-0" />
        
        <div className="flex flex-col gap-8 relative z-10">
          {/* Item 1 */}
          <div className="flex gap-6 relative">
            <div className="relative mt-6">
              <div className="w-2.5 h-2.5 rounded-full z-10 relative shadow-[0_0_10px_var(--primary)] bg-primary" />
            </div>
            <GlowCard glowColor="primary" className="flex-1 !border-l-[2px] !border-l-primary bg-[#121212]/80 backdrop-blur-xl">
              <div className="text-secondary font-headline font-bold text-[14px] tracking-widest mb-2">08:30 — 10:00</div>
              <h3 className="font-headline text-[26px] font-bold lowercase text-white leading-[1.1] mb-6 pr-4">advanced chaos theory</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-label text-[9px] uppercase tracking-[0.2em] text-[#808080] block mb-1">room</span>
                  <span className="font-headline text-lg font-bold text-white leading-tight block">Lab 404_VOID</span>
                </div>
                <div>
                  <span className="font-label text-[9px] uppercase tracking-[0.2em] text-[#808080] block mb-1">faculty</span>
                  <span className="font-headline text-lg font-bold text-white leading-tight block">Dr. Aris Thorne</span>
                </div>
              </div>
            </GlowCard>
          </div>

          {/* Item 2 */}
          <div className="flex gap-6 relative">
            <div className="relative mt-6">
              <div className="w-2.5 h-2.5 rounded-full z-10 relative shadow-[0_0_10px_var(--secondary)] bg-secondary" />
            </div>
            <GlowCard glowColor="secondary" className="flex-1 !border-l-[2px] !border-l-secondary bg-[#121212]/80 backdrop-blur-xl">
              <div className="text-secondary font-headline font-bold text-[14px] tracking-widest mb-2">10:15 — 11:45</div>
              <h3 className="font-headline text-[26px] font-bold lowercase text-white leading-[1.1] mb-6 pr-4">rebel typography 101</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-label text-[9px] uppercase tracking-[0.2em] text-[#808080] block mb-1">room</span>
                  <span className="font-headline text-lg font-bold text-white leading-tight block">Studio Z</span>
                </div>
                <div>
                  <span className="font-label text-[9px] uppercase tracking-[0.2em] text-[#808080] block mb-1">faculty</span>
                  <span className="font-headline text-lg font-bold text-white leading-tight block">Prof. Helvetica</span>
                </div>
              </div>
            </GlowCard>
          </div>

          {/* Lunch Break (Image 2 style) */}
          <div className="flex items-center gap-4 py-8">
            <div className="h-[1px] flex-1 bg-[#2a2a2a]" />
            <span className="font-headline italic text-[#808080] text-lg font-semibold px-4 py-1.5 border border-white/5 bg-white/[0.02] rounded-lg">lunch break</span>
            <div className="h-[1px] flex-1 bg-[#2a2a2a]" />
          </div>

          {/* Item 3 - Solid Neon Card (Image 2 style) */}
          <div className="flex gap-6 relative">
             <div className="relative mt-6">
               <div className="w-2.5 h-2.5 rounded-full z-10 relative shadow-[0_0_10px_var(--primary)] bg-primary" />
             </div>
             <div className="flex-1 rounded-[28px] bg-primary p-7 md:p-8 relative shadow-[0_4px_24px_rgba(182,255,0,0.4)]">
                <div className="text-[#324b00] font-headline font-bold text-[14px] tracking-widest mb-2 bg-[#324b00]/10 inline-block px-2 py-0.5 rounded">13:00 — 14:30</div>
                <h3 className="font-headline text-[28px] font-bold lowercase text-[#1c1b18] leading-[1.1] mb-6">digital anarchy & dev</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-label text-[9px] uppercase tracking-[0.2em] text-[#324b00]/60 block mb-1 font-bold">room</span>
                    <span className="font-headline text-lg font-bold text-[#1c1b18] leading-tight block">The Pit</span>
                  </div>
                  <div>
                    <span className="font-label text-[9px] uppercase tracking-[0.2em] text-[#324b00]/60 block mb-1 font-bold">faculty</span>
                    <span className="font-headline text-lg font-bold text-[#1c1b18] leading-tight block">V. Gibson</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Item 4 */}
          <div className="flex gap-6 relative">
            <div className="relative mt-6">
              <div className="w-2.5 h-2.5 rounded-full z-10 relative shadow-[0_0_10px_var(--secondary)] bg-secondary" />
            </div>
            <GlowCard glowColor="secondary" className="flex-1 !border-l-[2px] !border-l-secondary bg-[#121212]/80 backdrop-blur-xl">
              <div className="text-secondary font-headline font-bold text-[14px] tracking-widest mb-2">14:45 — 16:15</div>
              <h3 className="font-headline text-[26px] font-bold lowercase text-white leading-[1.1] mb-6 pr-4">algorithmic bias</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-label text-[9px] uppercase tracking-[0.2em] text-[#808080] block mb-1">room</span>
                  <span className="font-headline text-lg font-bold text-white leading-tight block">Virtual_6</span>
                </div>
                <div>
                  <span className="font-label text-[9px] uppercase tracking-[0.2em] text-[#808080] block mb-1">faculty</span>
                  <span className="font-headline text-lg font-bold text-white leading-tight block">Dr. Echo</span>
                </div>
              </div>
            </GlowCard>
          </div>
        </div>
      </section>
    </div>
  );
}
