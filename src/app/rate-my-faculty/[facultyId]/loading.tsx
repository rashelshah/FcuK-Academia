import React from 'react';
import { ArrowLeft } from 'lucide-react';

const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

export default function FacultyDetailLoading() {
  return (
    <div className="min-h-screen relative pb-32 text-[var(--text)] font-[var(--font-body)] overflow-x-hidden">
      {/* Background - exactly matches FacultyDetailClient */}
      <div 
        className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden"
        style={{ willChange: 'transform' }}
      >
        <div 
          className="absolute inset-0" 
          style={{ 
            background: `radial-gradient(circle at 50% -20%, color-mix(in srgb, var(--primary) 8%, transparent), var(--background) 70%)` 
          }} 
        />
        <div className="absolute top-[5%] left-[-15%] w-[80%] h-[80%] rounded-full opacity-[0.12] blur-[120px] bg-[var(--primary)]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full opacity-[0.08] blur-[100px] bg-[var(--primary)]" />
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: noiseSvg }}></div>
      </div>

      {/* Header Skeleton - Matches Navbar height and position */}
      <div className="sticky top-0 z-40 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/5 flex items-center justify-center">
            <ArrowLeft size={18} className="text-[var(--text)] opacity-40" />
          </div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="font-[var(--font-headline)] font-bold tracking-tight text-base text-[var(--text)] opacity-30 uppercase tracking-widest">
            Faculty Detailing
          </span>
        </div>
        <div className="w-10" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        {/* Profile Card Skeleton - Match FacultyDetailClient style */}
        <div className="relative bg-[var(--surface)]/30 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 sm:p-8 mb-10 h-64 sm:h-52 animate-pulse overflow-hidden">
           <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid gap-x-10 sm:grid-cols-2 bg-[var(--surface)]/20 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/5 mb-10 h-96 sm:h-80 animate-pulse relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent" />
        </div>

        {/* Reviews Section Skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-48 rounded-lg bg-[var(--surface)]/20 animate-pulse mb-6" />
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="p-6 bg-[var(--surface)]/20 backdrop-blur-xl border border-white/5 rounded-[1.5rem] h-32 animate-pulse" 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
