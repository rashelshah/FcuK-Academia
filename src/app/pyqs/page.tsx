import React, { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import SemesterGrid from './SemesterGrid';
import PYQLoading from './loading';
import AppSwitcher from '@/components/ui/AppSwitcher';
import AppHeader from '@/components/layout/AppHeader';
import { PageReveal } from '@/components/ui/PageReveal';

export const metadata: Metadata = {
  title: 'PYQs — FcuK Academia',
  description: 'Previous Year Questions for all SRM semesters. Browse, search, and open PDFs instantly.',
};

export const revalidate = 3600;

async function getSemesters(): Promise<number[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/pyqs/semesters`, {
    next: { revalidate: 3600 },
  }).catch(() => null);

  if (res?.ok) {
    const json = await res.json();
    return json.semesters ?? [];
  }

  // Fallback: direct Supabase query
  const { data } = await supabase.from('pyqs').select('semester').order('semester');
  const semesters = [...new Set((data ?? []).map((r: { semester: number }) => r.semester))].sort(
    (a, b) => a - b
  );
  return semesters.length ? semesters : [1, 2, 3, 4, 5, 6, 7, 8];
}

async function SemesterContent() {
  const semesters = await getSemesters();
  return <SemesterGrid semesters={semesters} />;
}

export default function PYQPage() {
  return (
    <div className="flex flex-col gap-8 pb-32 pt-1">
      <div className="flex flex-col gap-4">
        <AppHeader 
          title={<span className="font-headline text-xl font-bold tracking-tight text-primary italic">SRM PYQs</span>} 
          backHref="/" 
        />
        <AppSwitcher />
      </div>
      
      <PageReveal className="flex flex-col gap-8">
        {/* Header */}
        <section className="-mt-3 space-y-2">
          <p className="theme-kicker">last night saviour papers</p>
          <h1
          className="font-headline text-[3.15rem] font-bold leading-[0.88] tracking-tight"
          style={{ color: 'var(--primary)' }}
        >
          pick your<br />semester
        </h1>
        <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
          browse → choose semester → pick subject → open PDF
        </p>
      </section>

      {/* Background bloom */}
      <div
        className="pointer-events-none fixed left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, var(--primary) 0%, transparent 72%)',
          opacity: 0.07,
          filter: 'blur(60px)',
        }}
      />

      {/* Semester Grid */}
      <Suspense fallback={<PYQLoading />}>
        <SemesterContent />
      </Suspense>
      </PageReveal>
    </div>
  );
}
