import React from 'react';

const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

export default function RoomLoading() {
  return (
    <div className="min-h-screen relative pb-32 text-[var(--text)] font-[var(--font-body)]">
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-[var(--background)]" />
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: noiseSvg }}></div>
      </div>

      <div className="max-w-2xl mx-auto h-screen flex flex-col pt-24 mt-4 px-4 sm:px-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-10 animate-pulse">
          <div className="h-10 w-32 rounded-full bg-[var(--surface-highlight)] border border-[var(--border)]" />
          <div className="h-8 w-24 rounded-full bg-[var(--surface-highlight)] border border-[var(--border)]" />
        </div>

        {/* Chat Feed Skeleton */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-20 w-2/3 rounded-2xl bg-[var(--surface-highlight)] border border-[var(--border)] animate-pulse ${i % 2 === 0 ? 'self-start' : 'self-end bg-[var(--primary)]/5 border-[var(--primary)]/10 opacity-80'}`} />
          ))}
        </div>

        {/* Input Skeleton */}
        <div className="mt-8 h-12 w-full rounded-full bg-[var(--surface-highlight)] border border-[var(--border)] animate-pulse" />
      </div>
    </div>
  );
}
