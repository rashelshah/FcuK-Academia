'use client';

import React from 'react';
import Image from 'next/image';

import SubjectCard from '@/components/dashboard/SubjectCard';
import GlowCard from '@/components/ui/GlowCard';
import ProgressBar from '@/components/ui/ProgressBar';
import CountUp from '@/components/ui/CountUp';
import { PageReveal, RevealHeading, RevealItem, RevealText } from '@/components/ui/PageReveal';
import { useAttendance } from '@/hooks/useAttendance';
import { useUser } from '@/hooks/useUser';
import { createAvatarUrl, getCriticalAttendance, getOverallAttendance } from '@/lib/academia-ui';

export default function AttendancePage() {
  const { attendance, attendanceList, loading, error } = useAttendance();
  const { user } = useUser();
  const overallAtt = getOverallAttendance(attendanceList);
  const critical = getCriticalAttendance(attendanceList);
  const avatarUrl = createAvatarUrl(user?.name || 'SRM Student');
  const projected = attendanceList.length
    ? ((attendanceList.reduce((sum, item) => sum + (item.courseConducted - item.courseAbsent), 0) + 5) /
        (attendanceList.reduce((sum, item) => sum + item.courseConducted, 0) + 5)) * 100
    : 0;

  return (
    <PageReveal className="flex flex-col gap-8 pb-32 pt-4">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 relative">
          <Image src={avatarUrl} alt="Profile" fill className="object-cover" unoptimized />
        </div>
        <span className="font-headline font-bold text-xl text-primary tracking-tighter lowercase">fcuk academia</span>
      </header>

      <section className="relative mt-8">
        <div className="absolute left-0 -top-8 opacity-5 select-none z-0">
          <span className="font-headline text-[12rem] leading-none font-bold tracking-tighter">04</span>
        </div>
        <RevealHeading className="relative z-10">
          <p className="font-label text-xs font-bold tracking-[0.2em] text-[#adaaaa] uppercase mb-1">OVERALL ATTENDANCE</p>
          <span className="font-headline font-bold text-[7rem] leading-[0.85] tracking-tighter text-primary">
            {loading ? '0.0%' : <CountUp value={overallAtt} decimals={1} suffix="%" />}
          </span>
        </RevealHeading>
      </section>

      <RevealItem>
      <GlowCard glowColor="error" className="relative overflow-hidden bg-gradient-to-r from-[#2c1310] to-[#140b0a] border-none !border-l-[4px] !border-l-error p-6 py-8 shadow-2xl">
        <div className="flex justify-between items-start">
          <div className="max-w-[60%]">
            <h3 className="font-headline text-2xl font-bold lowercase tracking-tighter text-error">you&apos;re cooked</h3>
            <p className="font-body text-xs text-[#adaaaa] mt-1 pr-4">
              {critical ? `${critical.courseTitle.toLowerCase()} is below the 75% safety threshold` : 'all tracked courses are above threshold'}
            </p>
          </div>
          <div className="text-right">
            <span className="font-headline text-5xl font-bold text-error block leading-none">
              {loading ? '0' : <CountUp value={critical ? Math.max(0, Math.ceil((3 * critical.courseConducted) - (4 * (critical.courseConducted - critical.courseAbsent)))) : 0} />}
            </span>
            <span className="font-headline text-xl font-bold lowercase text-error block mt-1 leading-none">classes</span>
            <span className="font-label text-[10px] font-bold text-[#808080] uppercase tracking-widest block mt-2">TO RECOVER</span>
            {critical ? (
              <span className="font-body text-[11px] text-[#c6aaa4] mt-3 block max-w-[8rem] leading-tight">
                {critical.courseTitle.toLowerCase()}
              </span>
            ) : null}
          </div>
        </div>
      </GlowCard>
      </RevealItem>

      <section className="space-y-4 pt-4">
        <RevealText className="flex justify-between items-end mb-2">
          <h2 className="font-headline text-3xl font-bold lowercase tracking-tighter text-white">simulator</h2>
          <span className="font-label text-[10px] font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">BETA ACCESS</span>
        </RevealText>
        <RevealItem className="bg-[#121212] border border-[#2a2a2a] rounded-[28px] p-7 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex justify-between items-baseline mb-6">
            <span className="font-bold text-white lowercase">if you attend the next 5 classes...</span>
            <span className="font-headline text-4xl font-bold tracking-tighter text-secondary">
              {loading ? '0.0%' : <CountUp value={projected} decimals={1} suffix="%" />}
            </span>
          </div>
          <ProgressBar value={projected} color="var(--secondary)" showText={false} className="mb-8" />
          <div className="flex gap-4">
            <button className="flex-1 border border-[#333] hover:border-white/20 bg-white/[0.02] text-white py-4 rounded-full font-label text-[10px] md:text-xs font-bold tracking-widest uppercase transition-colors">
              + ADD SESSION
            </button>
            <button className="flex-1 border border-[#333] hover:border-white/20 bg-white/[0.02] text-white py-4 rounded-full font-label text-[10px] md:text-xs font-bold tracking-widest uppercase transition-colors">
              - SKIP SESSION
            </button>
          </div>
        </RevealItem>
      </section>

      <section className="space-y-6 pt-4">
        <RevealText>
          <h2 className="font-headline text-3xl font-bold lowercase tracking-tighter text-white">breakdown</h2>
        </RevealText>
        {error ? <p className="text-sm text-error font-body">{error}</p> : null}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-surface rounded-[28px]" />)}
          </div>
        ) : (
          attendance.map((subject, index) => (
            <RevealItem key={`${subject.id}-${index}`}>
              <SubjectCard subject={subject} type="attendance" />
            </RevealItem>
          ))
        )}
      </div>
      </section>
    </PageReveal>
  );
}
