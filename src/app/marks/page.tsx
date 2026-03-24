'use client';

import React from 'react';
import Image from 'next/image';
import { Bell, TrendingUp, AlertTriangle, ListFilter } from 'lucide-react';

import GlassCard from '@/components/ui/GlassCard';
import GlowCard from '@/components/ui/GlowCard';
import SubjectCard from '@/components/dashboard/SubjectCard';
import CountUp from '@/components/ui/CountUp';
import { PageReveal, RevealHeading, RevealItem, RevealText } from '@/components/ui/PageReveal';
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
  const weakestSubjectName = marks.find((subject) => subject.code === weakest?.course)?.name
    ?? weakest?.course?.toLowerCase()
    ?? 'no weak link';
  const predictedGrade = inferGrade(percentage);
  const probability = Math.min(97, Math.max(48, Math.round(percentage)));
  const avatarUrl = createAvatarUrl(user?.name || 'SRM Student');

  return (
    <PageReveal className="flex flex-col gap-8 pb-32 pt-4">
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
        <RevealHeading className="flex items-baseline gap-2">
          <span className="font-headline font-bold text-[5.5rem] leading-[0.8] tracking-tighter text-primary">
            {loading ? '0.0' : <CountUp value={totalObtained} decimals={1} />}
          </span>
          <span className="font-headline font-bold text-4xl text-[#808080]">/ {totalMax || 0}</span>
        </RevealHeading>
        <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.02] rounded-full px-4 py-1.5 mt-4">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span className="font-body text-xs text-[#e0e0e0] font-semibold">
            {loading ? '0.0% live internal score' : <CountUp value={percentage} decimals={1} suffix="% live internal score" />}
          </span>
        </div>
      </section>

      <RevealItem>
        <GlassCard className="mt-4 flex flex-col justify-between p-7">
        <div>
          <h2 className="font-headline text-3xl font-bold lowercase tracking-tighter text-white mb-1">future grade prediction</h2>
          <p className="font-body text-sm text-[#adaaaa]">based on current trajectory</p>
        </div>
        <div className="flex items-end justify-between mt-8">
          <div>
            <span className="font-headline font-bold text-6xl text-secondary inline-block leading-none">{predictedGrade}</span>
            <p className="font-label text-[10px] font-bold tracking-widest text-secondary/80 mt-2 uppercase">
              PROBABILITY {loading ? '0%' : <CountUp value={probability} suffix="%" />}
            </p>
          </div>
          <button className="bg-primary text-[#324b00] font-label font-bold uppercase tracking-widest textxs px-6 py-3 rounded-full hover:bg-primary/90 transition-colors shadow-[0_4px_14px_rgba(182,255,0,0.3)]">
            SIMULATE
          </button>
        </div>
        </GlassCard>
      </RevealItem>

      <RevealItem>
        <GlowCard glowColor="error" borderStyle="dashed" className="mt-2 text-center relative overflow-hidden bg-gradient-to-b from-[#1c0d0a] to-[#0c0c0c] border-[1.5px] p-8">
        <AlertTriangle className="absolute right-6 top-6 w-7 h-7 text-error" />
        <div className="text-left w-full mb-6">
          <h3 className="font-headline text-3xl font-bold lowercase tracking-tighter text-error">you&apos;re cooked</h3>
          <p className="font-body text-sm text-[#adaaaa] mt-1">subjects requiring immediate trauma recovery</p>
        </div>
        <div className="bg-[#181110] border border-[#3b1b16] rounded-[24px] p-5 sm:p-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-left min-w-0 flex-1">
            <h4 className="font-headline text-[2rem] font-bold lowercase text-white leading-[1] break-words">{weakestSubjectName}</h4>
            <p className="font-label text-[10px] font-bold tracking-widest text-[#adaaaa] mt-1 uppercase">
              {weakest ? `${weakest.category} • INTERNAL: ${weakest.total.obtained}/${weakest.total.maxMark}` : 'LIVE DATA • INTERNALS STABLE'}
            </p>
          </div>
          <span className="font-headline font-bold text-[4.2rem] sm:text-5xl text-error tracking-tighter leading-none self-start sm:self-auto shrink-0">
            {weakest && weakest.total.maxMark
              ? (loading ? '0.0' : <CountUp value={(weakest.total.obtained / weakest.total.maxMark) * 100} decimals={1} />)
              : '--'}
          </span>
        </div>
        </GlowCard>
      </RevealItem>

      <RevealText className="flex items-center justify-between mt-12">
        <h2 className="font-headline text-4xl font-bold lowercase tracking-tighter text-white">academic breakdown</h2>
        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#adaaaa] bg-[#121212]">
          <ListFilter size={18} />
        </div>
      </RevealText>

      {error ? <p className="text-sm text-error font-body">{error}</p> : null}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-surface rounded-[28px]" />)}
          </div>
        ) : (
          marks.map((subject, index) => (
            <RevealItem key={`${subject.id}-${index}`}>
              <SubjectCard subject={subject} type="marks" />
            </RevealItem>
          ))
        )}
      </div>
    </PageReveal>
  );
}
