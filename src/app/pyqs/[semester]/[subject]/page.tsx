import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import PYQList from './PYQList';
import PYQListLoading from './loading';
import AppHeader from '@/components/layout/AppHeader';
import { PageReveal } from '@/components/ui/PageReveal';

interface Props {
  params: Promise<{ semester: string; subject: string }>;
}

export interface PYQItem {
  id: string;
  semester: number;
  subject_name: string;
  exam_type: string | null;
  year: number | null;
  source_label: string | null;
  file_url: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { semester, subject } = await params;
  const decodedSubject = decodeURIComponent(subject);
  return {
    title: `${decodedSubject} PYQs — Sem ${semester} | FcuK Academia`,
    description: `Previous Year Questions for ${decodedSubject}, Semester ${semester} at SRM University.`,
  };
}

export const revalidate = 60;

async function getPYQs(semester: number, subject: string): Promise<PYQItem[]> {
  const { data } = await supabase
    .from('pyqs')
    .select('id, semester, subject_name, exam_type, year, source_label, file_url')
    .eq('semester', semester)
    .ilike('subject_name', subject)
    .order('year', { ascending: false, nullsFirst: false })
    .order('source_label', { ascending: true });

  return (data ?? []) as PYQItem[];
}

async function PYQContent({ semester, subject }: { semester: number; subject: string }) {
  const pyqs = await getPYQs(semester, subject);
  return <PYQList pyqs={pyqs} subject={subject} semester={semester} />;
}

import AppSwitcher from '@/components/ui/AppSwitcher';

export default async function PYQSubjectPage({ params }: Props) {
  const { semester, subject } = await params;
  const semNum = parseInt(semester, 10);
  const decodedSubject = decodeURIComponent(subject);

  if (isNaN(semNum)) {
    return (
      <PageReveal className="flex flex-col items-center justify-center pt-24 pb-40">
        <p className="font-headline text-2xl text-on-surface-variant text-center">invalid page 🫠</p>
        <Link href="/pyqs" className="mt-4 theme-kicker underline text-center">
          start over
        </Link>
      </PageReveal>
    );
  }

  return (
    <PageReveal className="flex flex-col gap-6 pb-40 pt-1">
      <div className="flex flex-col gap-4">
        <AppHeader
          title={<span className="font-headline text-xl font-bold tracking-tight text-primary italic">{decodedSubject}</span>}
          backHref={`/pyqs/${semNum}`}
        />
        <AppSwitcher />
      </div>

      {/* Header */}
      <section className="space-y-2">
        <p className="theme-kicker">papers that almost ended careers 😮‍💨</p>
        <h1
          className="font-headline text-[2.4rem] font-bold leading-[0.9] tracking-tight capitalize"
          style={{ color: 'var(--text)' }}
        >
          {decodedSubject}
        </h1>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 font-label text-[9px] font-bold uppercase tracking-widest"
            style={{
              background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--primary) 28%, transparent)',
              color: 'var(--primary)',
            }}
          >
            sem {semNum}
          </span>
          <span
            className="font-label text-[9px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-subtle)' }}
          >
            srmist pyqs
          </span>
        </div>
      </section>

      {/* Background bloom */}
      <div
        className="pointer-events-none fixed left-0 bottom-20 -z-10 h-56 w-56"
        style={{
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
          opacity: 0.06,
          filter: 'blur(50px)',
        }}
      />

      {/* PYQ cards */}
      <Suspense fallback={<PYQListLoading />}>
        <PYQContent semester={semNum} subject={decodedSubject} />
      </Suspense>

      {/* Footer */}
      <footer className="mt-8 px-2 pb-6">
        <div className="flex flex-col gap-3 text-left">
          <p
            className="font-headline text-[clamp(3.2rem,14vw,4.4rem)] font-bold leading-[0.88] tracking-tight lowercase"
            style={{ color: 'color-mix(in srgb, var(--text) 90%, transparent)' }}
          >
            Want more?
          </p>
          <p className="max-w-sm text-sm font-medium leading-6 text-on-surface-variant lowercase">
            coming soon! on it&apos;s way...
          </p>
        </div>
      </footer>
    </PageReveal>
  );
}
