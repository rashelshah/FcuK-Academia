'use client';

import React, { useState } from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';

import AppHeader from '@/components/layout/AppHeader';
import TargetGradeSheet, { TargetGradeTrigger } from '@/components/marks/TargetGradeSheet';
import CountUp from '@/components/ui/CountUp';
import GlowCard from '@/components/ui/GlowCard';
import SubjectCard from '@/components/dashboard/SubjectCard';
import ThemedNumberText from '@/components/ui/ThemedNumberText';
import { PageReveal, RevealHeading, RevealItem, RevealText } from '@/components/ui/PageReveal';
import { useMarks } from '@/hooks/useMarks';
import { getMarksPercentage, getWeakestMark } from '@/lib/academia-ui';

function formatMarkValue(value: number) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function MarksPage() {
  const [targetOpen, setTargetOpen] = useState(false);
  const { marks, markList, loading, error } = useMarks();
  const validMarkList = markList.filter((item) => item.total.maxMark > 0);

  const totalObtained = validMarkList.reduce((sum, item) => sum + item.total.obtained, 0);
  const totalMax = validMarkList.reduce((sum, item) => sum + item.total.maxMark, 0);
  const percentage = getMarksPercentage(validMarkList);
  const weakest = getWeakestMark(validMarkList);
  const weakestSubjectName = marks.find((subject) => subject.code === weakest?.course)?.name
    ?? weakest?.course?.toLowerCase()
    ?? 'no weak link';

  return (
    <PageReveal className="flex flex-col gap-6 pb-28 pt-4">
      <AppHeader />

      <section className="mt-2 space-y-2">
        <p className="theme-kicker">total aggregate</p>
        <RevealHeading className="flex items-baseline gap-2">
          <span className="text-[5.2rem] font-bold leading-[0.82] tracking-tight text-primary">
            {loading
              ? <ThemedNumberText value="0.0" />
              : <CountUp value={totalObtained} decimals={1} renderFormatted={(formatted) => <ThemedNumberText value={formatted} />} />}
          </span>
          <span className="font-headline text-4xl font-bold text-on-surface-variant">
            / <ThemedNumberText value={`${totalMax || 0}`} />
          </span>
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
        <GlowCard glowColor="error" borderStyle="dashed" className="mt-1 p-0">
          <div
            className="rounded-[inherit] p-5"
            style={{
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--error) 10%, var(--surface)) 0%, color-mix(in srgb, var(--surface) 96%, transparent) 100%)',
            }}
          >
            <AlertTriangle className="absolute right-5 top-5 h-6 w-6 text-error" />
            <div className="mb-4 w-full text-left pr-10">
              <h3 className="font-headline text-[2rem] font-bold normal-case tracking-tight text-error">you&apos;re FcuKed</h3>
              <p className="mt-1 text-[13px] leading-5 text-on-surface-variant">subjects requiring immediate trauma recovery</p>
            </div>
            <div
              className="flex flex-col gap-3 rounded-[20px] p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5"
              style={{
                background: 'color-mix(in srgb, var(--surface-soft) 92%, transparent)',
                border: '1px solid color-mix(in srgb, var(--error) 16%, transparent)',
              }}
            >
              <div className="min-w-0 flex-1 text-left">
                <h4 className="font-headline text-[1.65rem] font-bold lowercase leading-[0.96] text-on-surface">{weakestSubjectName}</h4>
                <p className="mt-1 font-label text-[9px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  {weakest ? `${weakest.category} / INTERNAL: ${formatMarkValue(weakest.total.obtained)}/${formatMarkValue(weakest.total.maxMark)}` : 'live data / internals stable'}
                </p>
              </div>
              <span className="shrink-0 self-start font-headline text-[3.4rem] font-bold leading-none tracking-tight text-error sm:self-auto sm:text-[3.8rem]">
                {weakest && weakest.total.maxMark
                  ? (loading ? '0.0' : <CountUp value={(weakest.total.obtained / weakest.total.maxMark) * 100} decimals={1} />)
                  : '--'}
              </span>
            </div>
          </div>
        </GlowCard>
      </RevealItem>

      <RevealText className="mt-6 flex items-center justify-between">
        <h2 className="font-headline text-4xl font-bold lowercase tracking-tight text-on-surface">academic breakdown</h2>
        <TargetGradeTrigger onClick={() => setTargetOpen(true)} />
      </RevealText>

      {error ? <p className="text-sm text-error font-body">{error}</p> : null}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-[24px] bg-surface" />)}
          </div>
        ) : (
          marks.map((subject, index) => (
            <RevealItem key={`${subject.id}-${index}`}>
              <SubjectCard subject={subject} type="marks" />
            </RevealItem>
          ))
        )}
      </div>

      <TargetGradeSheet open={targetOpen} subjects={marks} onClose={() => setTargetOpen(false)} />
    </PageReveal>
  );
}
