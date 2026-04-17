import React from 'react';

const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

export default function RmfRoomsLoading() {
  return (
    <div className="min-h-screen relative pb-32 text-[var(--text)] font-[var(--font-body)] flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-[var(--background)]" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: noiseSvg }}></div>
      </div>

      <div className="flex-1 flex items-center justify-center -mt-20">
        <div className="w-full max-w-sm px-6 space-y-8 animate-pulse">
          <div className="h-10 w-48 mx-auto rounded-full bg-white/5" />
          <div className="h-64 w-full rounded-2xl bg-white/5 border border-white/5" />
          <div className="h-14 w-full rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}
