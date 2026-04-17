import React from 'react';

const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

export default function FacultyListLoading() {
  return (
    <div className="min-h-screen relative pb-32 text-[var(--text)] font-[var(--font-body)]">
      {/* Global Background Fix */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-[var(--background)]" />
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full opacity-[0.03] blur-[130px] bg-[var(--primary)] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.02] blur-[120px] bg-[var(--primary)] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: noiseSvg }}></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 mt-4">
        {/* College Section Skeleton */}
        <div className="flex justify-between items-end gap-4 mb-8">
          <div className="flex-1 space-y-4">
            <div className="h-5 w-24 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/10 animate-pulse" />
            <div className="h-12 w-3/4 rounded-2xl bg-white/5 animate-pulse" />
          </div>
          <div className="h-20 w-24 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
        </div>

        {/* Search & Actions Skeleton */}
        <div className="h-16 w-full rounded-[2rem] bg-white/5 border border-white/5 animate-pulse mb-12" />

        {/* LIST View Skeleton */}
        <div className="flex flex-col gap-4">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="p-5 bg-white/5 border border-white/5 rounded-2xl h-32 animate-pulse flex flex-col justify-between"
              style={{ opacity: 1 - (i * 0.1) }}
            >
              <div className="space-y-3">
                <div className="h-6 w-1/2 rounded-lg bg-white/5" />
                <div className="h-4 w-1/3 rounded-lg bg-white/5" />
              </div>
              <div className="h-4 w-1/4 rounded-lg bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
