import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getSemesters } from '@/lib/drive';
import SemesterGrid from './SemesterGrid';
import PYQLoading from './loading';
import AppSwitcher from '@/components/ui/AppSwitcher';
import AppHeader from '@/components/layout/AppHeader';
import { PageReveal } from '@/components/ui/PageReveal';
import DriveRefresher from '@/components/pyqs/DriveRefresher';

export const metadata: Metadata = {
  title: 'PYQs — FcuK Academia',
  description: 'Previous Year Questions for all SRM semesters. Browse, search, and open PDFs instantly.',
};

export const dynamic = 'force-dynamic';

async function getSemestersData(): Promise<number[]> {
  try {
    const semesters = await getSemesters();
    return semesters;
  } catch (err) {
    console.error('Error fetching semesters from drive:', err);
    return [1, 2, 3, 4, 5, 6, 7, 8]; // Fallback
  }
}

async function SemesterContent() {
  const semesters = await getSemestersData();
  return <SemesterGrid semesters={semesters} />;
}

export default function PYQPage() {
  return (
    <div className="flex flex-col gap-8 pb-32 pt-1">
      <DriveRefresher />
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
