import React from 'react';

const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

export default function RmfTodayLoading() {
  return (
    <div className="min-h-screen relative pb-32 text-[var(--text)] font-[var(--font-body)]">
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-[var(--background)]" />
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: noiseSvg }}></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 mt-4">
        <div className="h-16 w-full rounded-xl bg-white/5 animate-pulse mb-8" />
        <div className="h-4 w-32 rounded-full bg-white/5 animate-pulse mb-8" />
        
        <div className="flex flex-col gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] h-64 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
