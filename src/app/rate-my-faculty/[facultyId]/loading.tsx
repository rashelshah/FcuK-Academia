import React from 'react';

const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

export default function FacultyDetailLoading() {
  return (
    <div className="min-h-screen relative pb-32 text-[var(--text)] font-[var(--font-body)]">
      {/* Global Background Fix */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-[var(--background)]" />
        <div className="absolute top-[10%] left-[-20%] w-[70%] h-[70%] rounded-full opacity-[0.03] blur-[130px] bg-[var(--primary)]" />
        <div className="absolute bottom-[0%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.02] blur-[120px] bg-[var(--primary)]" />
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: noiseSvg }}></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 mt-4">
        {/* Profile Card Skeleton */}
        <div className="relative bg-[var(--surface-highlight)] border border-[var(--border)] rounded-[2rem] p-6 sm:p-8 mb-8 h-48 animate-pulse" />

        {/* Breakdown Stats Skeleton */}
        <div className="grid gap-x-10 sm:grid-cols-2 bg-[var(--surface-highlight)] border border-[var(--border)] rounded-[2rem] p-6 sm:p-8 mb-10 h-80 animate-pulse" />

        {/* Reviews Skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-40 rounded-lg bg-[var(--surface-highlight)] animate-pulse mb-6" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 bg-[var(--surface-highlight)] border border-[var(--border)] rounded-[1.5rem] h-32 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
