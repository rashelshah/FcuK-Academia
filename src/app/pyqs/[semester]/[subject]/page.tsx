import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import PYQList from './PYQList';
import PYQListLoading from './loading';

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

export const revalidate = 3600;

async function getPYQs(semester: number, subject: string): Promise<PYQItem[]> {
  const { data } = await supabase
    .from('pyqs')
    .select('id, semester, subject_name, exam_type, year, source_label, file_url')
    .eq('semester', semester)
    .eq('subject_name', subject)
    .order('year', { ascending: false, nullsFirst: false })
    .order('source_label', { ascending: true });

  return (data ?? []) as PYQItem[];
}

async function PYQContent({ semester, subject }: { semester: number; subject: string }) {
  const pyqs = await getPYQs(semester, subject);
  return <PYQList pyqs={pyqs} subject={subject} semester={semester} />;
}

export default async function PYQSubjectPage({ params }: Props) {
  const { semester, subject } = await params;
  const semNum = parseInt(semester, 10);
  const decodedSubject = decodeURIComponent(subject);

  if (isNaN(semNum)) {
    return (
      <div className="flex flex-col items-center justify-center pt-20">
        <p className="font-headline text-2xl text-on-surface-variant">invalid page 🫠</p>
        <Link href="/pyqs" className="mt-4 theme-kicker underline">
          start over
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-40 pt-4">
      {/* Back nav */}
      <Link
        href={`/pyqs/${semNum}`}
        className="inline-flex w-fit items-center gap-2 theme-outline-button px-4 py-2 text-sm font-semibold"
      >
        <ArrowLeft className="h-4 w-4" />
        subjects
      </Link>

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
    </div>
  );
}
