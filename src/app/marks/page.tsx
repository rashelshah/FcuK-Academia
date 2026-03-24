'use client';

import React from 'react';
import { AlertTriangle, ListFilter, TrendingUp } from 'lucide-react';

import AppHeader from '@/components/layout/AppHeader';
import CountUp from '@/components/ui/CountUp';
import GlassCard from '@/components/ui/GlassCard';
import GlowCard from '@/components/ui/GlowCard';
import SubjectCard from '@/components/dashboard/SubjectCard';
import { PageReveal, RevealHeading, RevealItem, RevealText } from '@/components/ui/PageReveal';
import { useMarks } from '@/hooks/useMarks';
import { getMarksPercentage, getWeakestMark, inferGrade } from '@/lib/academia-ui';

export default function MarksPage() {
  const { marks, markList, loading, error } = useMarks();
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

  return (
    <PageReveal className="flex flex-col gap-8 pb-32 pt-4">
      <AppHeader />

      <section className="mt-2 space-y-2">
        <p className="theme-kicker">total aggregate</p>
        <RevealHeading className="flex items-baseline gap-2">
          <span className="font-headline text-[5.2rem] font-bold leading-[0.82] tracking-tight text-primary">
            {loading ? '0.0' : <CountUp value={totalObtained} decimals={1} />}
          </span>
          <span className="font-headline text-4xl font-bold text-on-surface-variant">/ {totalMax || 0}</span>
        </RevealHeading>
        <div
          className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{
            background: 'color-mix(in srgb, var(--surface-soft) 92%, transparent)',
            border: '1px solid var(--border)',
          }}
        >
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-on-surface">
            {loading ? '0.0% live internal score' : <CountUp value={percentage} decimals={1} suffix="% live internal score" />}
          </span>
        </div>
      </section>

      <RevealItem>
        <GlassCard className="mt-2 flex flex-col justify-between p-6">
          <div>
            <h2 className="font-headline text-3xl font-bold lowercase tracking-tight text-on-surface">future grade prediction</h2>
            <p className="mt-1 text-sm text-on-surface-variant">based on current trajectory</p>
          </div>
          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <span className="inline-block font-headline text-6xl font-bold leading-none text-secondary">{predictedGrade}</span>
              <p className="mt-2 font-label text-[10px] font-bold uppercase tracking-widest text-secondary/80">
                probability {loading ? '0%' : <CountUp value={probability} suffix="%" />}
              </p>
            </div>
            <button type="button" className="theme-outline-button px-5 py-3 font-label text-[10px] font-bold uppercase tracking-widest">
              simulate
            </button>
          </div>
        </GlassCard>
      </RevealItem>

      <RevealItem>
        <GlowCard glowColor="error" borderStyle="dashed" className="mt-1 p-0">
          <div
            className="rounded-[inherit] p-6"
            style={{
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--error) 10%, var(--surface)) 0%, color-mix(in srgb, var(--surface) 96%, transparent) 100%)',
            }}
          >
            <AlertTriangle className="absolute right-6 top-6 h-7 w-7 text-error" />
            <div className="mb-6 w-full text-left">
              <h3 className="font-headline text-3xl font-bold lowercase tracking-tight text-error">you&apos;re cooked</h3>
              <p className="mt-1 text-sm text-on-surface-variant">subjects requiring immediate trauma recovery</p>
            </div>
            <div
              className="flex flex-col gap-5 rounded-[24px] p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6"
              style={{
                background: 'color-mix(in srgb, var(--surface-soft) 92%, transparent)',
                border: '1px solid color-mix(in srgb, var(--error) 16%, transparent)',
              }}
            >
              <div className="min-w-0 flex-1 text-left">
                <h4 className="font-headline text-[2rem] font-bold lowercase leading-[1] text-on-surface">{weakestSubjectName}</h4>
                <p className="mt-1 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {weakest ? `${weakest.category} / INTERNAL: ${weakest.total.obtained}/${weakest.total.maxMark}` : 'live data / internals stable'}
                </p>
              </div>
              <span className="shrink-0 self-start font-headline text-[4.2rem] font-bold leading-none tracking-tight text-error sm:self-auto sm:text-5xl">
                {weakest && weakest.total.maxMark
                  ? (loading ? '0.0' : <CountUp value={(weakest.total.obtained / weakest.total.maxMark) * 100} decimals={1} />)
                  : '--'}
              </span>
            </div>
          </div>
        </GlowCard>
      </RevealItem>

      <RevealText className="mt-10 flex items-center justify-between">
        <h2 className="font-headline text-4xl font-bold lowercase tracking-tight text-on-surface">academic breakdown</h2>
        <div className="theme-icon-button flex items-center justify-center">
          <ListFilter size={18} />
        </div>
      </RevealText>

      {error ? <p className="text-sm text-error font-body">{error}</p> : null}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-[28px] bg-surface" />)}
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
