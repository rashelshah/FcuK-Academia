import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import SubjectList from './SubjectList';
import SubjectLoading from './loading';

interface Props {
  params: Promise<{ semester: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { semester } = await params;
  return {
    title: `Semester ${semester} Subjects — FcuK Academia PYQs`,
    description: `Browse PYQ subjects for Semester ${semester} at SRM University.`,
  };
}

export const revalidate = 3600;

async function getSubjects(semester: number): Promise<string[]> {
  const { data } = await supabase
    .from('pyqs')
    .select('subject_name')
    .eq('semester', semester)
    .order('subject_name', { ascending: true });

  const subjects = [
    ...new Map(
      (data ?? []).map((r: { subject_name: string }) => [r.subject_name, r.subject_name])
    ).values(),
  ].sort((a, b) => a.localeCompare(b));

  return subjects;
}

async function SubjectContent({ semester }: { semester: number }) {
  const subjects = await getSubjects(semester);
  return <SubjectList subjects={subjects} semester={semester} />;
}

export default async function SemesterPage({ params }: Props) {
  const { semester } = await params;
  const semNum = parseInt(semester, 10);

  if (isNaN(semNum) || semNum < 1 || semNum > 8) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 text-center">
        <p className="font-headline text-2xl text-on-surface-variant">semester not found 🫠</p>
        <Link href="/pyqs" className="mt-4 theme-kicker underline">
          go back
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-40 pt-4">
      {/* Back button */}
      <Link
        href="/pyqs"
        className="inline-flex w-fit items-center gap-2 theme-outline-button px-4 py-2 text-sm font-semibold"
      >
        <ArrowLeft className="h-4 w-4" />
        semesters
      </Link>

      {/* Header */}
      <section className="space-y-2">
        <p className="theme-kicker">pass hone ka jugaad here 😏</p>
        <h1
          className="font-headline text-[3rem] font-bold leading-[0.9] tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          semester {semNum}
        </h1>
        <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
          pick your subject 👀
        </p>
      </section>

      {/* Background bloom */}
      <div
        className="pointer-events-none fixed right-0 top-0 -z-10 h-64 w-64"
        style={{
          background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)',
          opacity: 0.05,
          filter: 'blur(50px)',
        }}
      />

      {/* Subject list */}
      <Suspense fallback={<SubjectLoading />}>
        <SubjectContent semester={semNum} />
      </Suspense>
    </div>
  );
}
