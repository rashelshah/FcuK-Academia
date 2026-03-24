'use client';

import React from 'react';
import Image from 'next/image';
import { Bell, TrendingUp, AlertTriangle, ListFilter } from 'lucide-react';

import GlassCard from '@/components/ui/GlassCard';
import GlowCard from '@/components/ui/GlowCard';
import SubjectCard from '@/components/dashboard/SubjectCard';
import { useMarks } from '@/hooks/useMarks';
import { useUser } from '@/hooks/useUser';
import { createAvatarUrl, getMarksPercentage, getWeakestMark, inferGrade } from '@/lib/academia-ui';

export default function MarksPage() {
  const { marks, markList, loading, error } = useMarks();
  const { user } = useUser();
  const validMarkList = markList.filter((item) => item.total.maxMark > 0);

  const totalObtained = validMarkList.reduce((sum, item) => sum + item.total.obtained, 0);
  const totalMax = validMarkList.reduce((sum, item) => sum + item.total.maxMark, 0);
  const percentage = getMarksPercentage(validMarkList);
  const weakest = getWeakestMark(validMarkList);
  const predictedGrade = inferGrade(percentage);
  const probability = Math.min(97, Math.max(48, Math.round(percentage)));
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

      <section className="space-y-1 mt-4">
        <p className="font-label text-[10px] font-bold tracking-[0.2em] text-[#adaaaa] uppercase">TOTAL AGGREGATE</p>
        <div className="flex items-baseline gap-2">
          <span className="font-headline font-bold text-[5.5rem] leading-[0.8] tracking-tighter text-primary">{totalObtained.toFixed(1)}</span>
          <span className="font-headline font-bold text-4xl text-[#808080]">/ {totalMax || 0}</span>
        </div>
        <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.02] rounded-full px-4 py-1.5 mt-4">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span className="font-body text-xs text-[#e0e0e0] font-semibold">{percentage.toFixed(1)}% live internal score</span>
        </div>
      </section>

      <GlassCard className="mt-4 flex flex-col justify-between p-7">
        <div>
          <h2 className="font-headline text-3xl font-bold lowercase tracking-tighter text-white mb-1">future grade prediction</h2>
          <p className="font-body text-sm text-[#adaaaa]">based on current trajectory</p>
        </div>
        <div className="flex items-end justify-between mt-8">
          <div>
            <span className="font-headline font-bold text-6xl text-secondary inline-block leading-none">{predictedGrade}</span>
            <p className="font-label text-[10px] font-bold tracking-widest text-secondary/80 mt-2 uppercase">PROBABILITY {probability}%</p>
          </div>
          <button className="bg-primary text-[#324b00] font-label font-bold uppercase tracking-widest textxs px-6 py-3 rounded-full hover:bg-primary/90 transition-colors shadow-[0_4px_14px_rgba(182,255,0,0.3)]">
            SIMULATE
          </button>
        </div>
      </GlassCard>

      <GlowCard glowColor="error" borderStyle="dashed" className="mt-2 text-center relative overflow-hidden bg-gradient-to-b from-[#1c0d0a] to-[#0c0c0c] border-[1.5px] p-8">
        <AlertTriangle className="absolute right-6 top-6 w-7 h-7 text-error" />
        <div className="text-left w-full mb-6">
          <h3 className="font-headline text-3xl font-bold lowercase tracking-tighter text-error">you&apos;re cooked</h3>
          <p className="font-body text-sm text-[#adaaaa] mt-1">subjects requiring immediate trauma recovery</p>
        </div>
        <div className="bg-[#181110] border border-[#3b1b16] rounded-[24px] p-5 flex items-center justify-between">
          <div className="text-left">
            <h4 className="font-headline text-2xl font-bold lowercase text-white">{weakest?.course?.toLowerCase() || 'no weak link'}</h4>
            <p className="font-label text-[10px] font-bold tracking-widest text-[#adaaaa] mt-1 uppercase">
              {weakest ? `${weakest.category} • INTERNAL: ${weakest.total.obtained}/${weakest.total.maxMark}` : 'LIVE DATA • INTERNALS STABLE'}
            </p>
          </div>
          <span className="font-headline font-bold text-5xl text-error tracking-tighter">
            {weakest && weakest.total.maxMark ? ((weakest.total.obtained / weakest.total.maxMark) * 100).toFixed(1) : '--'}
          </span>
        </div>
      </GlowCard>

      <div className="flex items-center justify-between mt-12">
        <h2 className="font-headline text-4xl font-bold lowercase tracking-tighter text-white">academic breakdown</h2>
        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#adaaaa] bg-[#121212]">
          <ListFilter size={18} />
        </div>
      </div>

      {error ? <p className="text-sm text-error font-body">{error}</p> : null}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-surface rounded-[28px]" />)}
          </div>
        ) : (
          marks.map((subject, index) => (
            <SubjectCard key={`${subject.id}-${index}`} subject={subject} type="marks" />
          ))
        )}
      </div>
    </div>
  );
}
