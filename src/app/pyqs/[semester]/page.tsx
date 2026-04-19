import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import SubjectList from './SubjectList';
import SubjectLoading from './loading';
import AppHeader from '@/components/layout/AppHeader';
import AppSwitcher from '@/components/ui/AppSwitcher';
import { PageReveal } from '@/components/ui/PageReveal';

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

export const revalidate = 60;

async function getSubjects(semester: number): Promise<string[]> {
  const { data } = await supabase
    .from('pyqs')
    .select('subject_name')
    .eq('semester', semester);

  // Use a case-insensitive Map to group subjects
  const subjectMap = new Map<string, string>();
  (data ?? []).forEach((r: { subject_name: string }) => {
    const key = r.subject_name.trim().toLowerCase();
    // Keep the "best" casing (prefer capitalized)
    if (!subjectMap.has(key) || (r.subject_name[0] === r.subject_name[0].toUpperCase())) {
      subjectMap.set(key, r.subject_name.trim());
    }
  });

  return Array.from(subjectMap.values()).sort((a, b) => a.localeCompare(b));
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
      <PageReveal className="flex flex-col gap-6 pb-40 pt-1">
        <div className="flex flex-col gap-4">
          <AppHeader 
            title={<span className="font-headline text-xl font-bold tracking-tight text-primary italic">Semester {semNum}</span>} 
            backHref="/pyqs" 
          />
          <AppSwitcher />
        </div>
        <p className="font-headline text-2xl text-on-surface-variant text-center mt-10">semester not found 🫠</p>
        <Link href="/pyqs" className="mt-4 theme-kicker underline text-center">
          go back
        </Link>
      </PageReveal>
    );
  }

  return (
    <PageReveal className="flex flex-col gap-6 pb-40 pt-1">
      <div className="flex flex-col gap-4">
        <AppHeader 
          title={<span className="font-headline text-xl font-bold tracking-tight text-primary italic">Semester {semNum}</span>} 
          backHref="/pyqs" 
        />
        <AppSwitcher />
      </div>

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
    </PageReveal>
  );
}
