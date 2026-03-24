'use client';

import React, { useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import Image from 'next/image';

import GlowCard from '@/components/ui/GlowCard';
import { useTimetable } from '@/hooks/useTimetable';
import { useUser } from '@/hooks/useUser';
import { createAvatarUrl, getClassesForDay, getDayOrders } from '@/lib/academia-ui';

export default function TimetablePage() {
  const { timetableRaw, loading, error } = useTimetable();
  const { user } = useUser();
  const dayOrders = useMemo(() => getDayOrders(timetableRaw), [timetableRaw]);
  const [selectedDayOrder, setSelectedDayOrder] = useState(1);
  const dayOrder = dayOrders.includes(selectedDayOrder) ? selectedDayOrder : (dayOrders[0] || 1);
  const classes = getClassesForDay(timetableRaw, dayOrder);
  const avatarUrl = createAvatarUrl(user?.name || 'SRM Student');

  return (
    <div className="flex flex-col gap-8 pb-32 pt-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 relative">
            <Image src={avatarUrl} alt="Profile" fill className="object-cover" unoptimized />
          </div>
          <span className="font-headline font-bold text-xl text-primary tracking-tighter lowercase">fcuk academia</span>
        </div>
        <Bell className="text-primary w-6 h-6" />
      </header>

      <section className="flex items-center gap-6 mt-4 z-10 relative">
        <span className="font-label text-[10px] font-bold tracking-widest text-[#adaaaa] uppercase">day order</span>
        <div className="flex gap-3">
          {(dayOrders.length ? dayOrders : [1, 2, 3, 4]).map((num) => (
            <button
              key={num}
              onClick={() => setSelectedDayOrder(num)}
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

      {error ? <p className="text-sm text-error font-body">{error}</p> : null}
      <section className="relative mt-8">
        <div className="absolute left-3 top-4 bottom-0 w-[1px] bg-gradient-to-b from-[#2a2a2a] to-transparent z-0" />

        <div className="flex flex-col gap-8 relative z-10">
          {loading ? (
            [1, 2, 3].map((item) => <div key={item} className="h-36 rounded-[28px] bg-[#121212] animate-pulse ml-8" />)
          ) : classes.length ? (
            classes.map((item, index) => {
              const isPrimary = index === 2;
              const glow = index % 2 === 0 ? 'primary' : 'secondary';
              return (
                <div key={`${item.slot}-${item.time}-${index}`} className="flex gap-6 relative">
                  <div className="relative mt-6">
                    <div className={`w-2.5 h-2.5 rounded-full z-10 relative ${glow === 'primary' ? 'shadow-[0_0_10px_var(--primary)] bg-primary' : 'shadow-[0_0_10px_var(--secondary)] bg-secondary'}`} />
                  </div>
                  {isPrimary ? (
                    <div className="flex-1 rounded-[28px] bg-primary p-7 md:p-8 relative shadow-[0_4px_24px_rgba(182,255,0,0.4)]">
                      <div className="text-[#324b00] font-headline font-bold text-[14px] tracking-widest mb-2 bg-[#324b00]/10 inline-block px-2 py-0.5 rounded">{item.time}</div>
                      <h3 className="font-headline text-[28px] font-bold lowercase text-[#1c1b18] leading-[1.1] mb-6">{item.courseTitle?.toLowerCase()}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-label text-[9px] uppercase tracking-[0.2em] text-[#324b00]/60 block mb-1 font-bold">room</span>
                          <span className="font-headline text-lg font-bold text-[#1c1b18] leading-tight block">{item.courseRoomNo || 'TBA'}</span>
                        </div>
                        <div>
                          <span className="font-label text-[9px] uppercase tracking-[0.2em] text-[#324b00]/60 block mb-1 font-bold">faculty</span>
                          <span className="font-headline text-lg font-bold text-[#1c1b18] leading-tight block">{item.faculty || 'Faculty TBA'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <GlowCard glowColor={glow} className={`flex-1 border-l-2 ${glow === 'primary' ? 'border-l-primary' : 'border-l-secondary'} bg-[#121212]/80 backdrop-blur-xl`}>
                      <div className="text-secondary font-headline font-bold text-[14px] tracking-widest mb-2">{item.time}</div>
                      <h3 className="font-headline text-[26px] font-bold lowercase text-white leading-[1.1] mb-6 pr-4">{item.courseTitle?.toLowerCase()}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-label text-[9px] uppercase tracking-[0.2em] text-[#808080] block mb-1">room</span>
                          <span className="font-headline text-lg font-bold text-white leading-tight block">{item.courseRoomNo || 'TBA'}</span>
                        </div>
                        <div>
                          <span className="font-label text-[9px] uppercase tracking-[0.2em] text-[#808080] block mb-1">faculty</span>
                          <span className="font-headline text-lg font-bold text-white leading-tight block">{item.faculty || 'Faculty TBA'}</span>
                        </div>
                      </div>
                    </GlowCard>
                  )}
                </div>
              );
            })
          ) : (
            <div className="ml-8 rounded-[28px] border border-white/5 bg-[#121212] p-8 text-[#808080] font-body">No classes found for this day order.</div>
          )}
        </div>
      </section>
    </div>
  );
}
