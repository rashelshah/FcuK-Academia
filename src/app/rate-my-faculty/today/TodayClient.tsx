'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TodayRating {
  id: string;
  review: string | null;
  createdAt: string;
  teachingClarity: number;
  approachability: number;
  gradingFairness: number;
  punctuality: number;
  partiality: number;
  behaviour: number;
  facultyId: string;
  faculty?: {
    name: string;
    department: string | null;
  } | null;
}


export default function TodayClient({ initialRatings }: { initialRatings: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    router.prefetch('/rate-my-faculty');
  }, [router]);

  const getOverall = (r: any) => {
    return ((r.teachingClarity + r.approachability + r.gradingFairness + r.punctuality + r.partiality + r.behaviour) / 6).toFixed(1);
  };

  const getTimeAgo = (dateString: string) => {
    const time = new Date(dateString).getTime();
    const now = new Date().getTime();
    const mins = Math.floor((now - time) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-400';
    if (rating >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen relative pb-32 text-[var(--text)] font-[var(--font-body)]">
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] to-[color-mix(in_srgb,var(--primary)_10%,var(--background))]" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[100px] bg-[var(--primary)]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-10 blur-[120px] bg-[var(--primary)]" />
        {/* noiseSvg removed — feTurbulence SVG is expensive on mobile */}
      </div>

      {/* ── Section 1: Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0 }}
        style={{ willChange: 'transform, opacity' }}
        className="sticky top-0 z-40 px-4 sm:px-6 py-4 flex items-center justify-between pointer-events-none"
      >
        <div className="pointer-events-auto flex items-center gap-4">
          <Link 
            href="/rate-my-faculty" 
            className="flex items-center gap-2 text-on-surface-variant font-medium text-sm hover:text-white transition-colors uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5"
          >
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span>
          </Link>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto flex gap-2 items-baseline">
          <span className="font-serif font-black tracking-tight text-xl text-[var(--text)] drop-shadow-sm">
            Today's <span className="italic text-[var(--primary)]">Voices</span>
          </span>
        </div>
        
        <div className="pointer-events-auto hidden sm:block">
          <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE FEED
          </span>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        {/* ── Section 2: Status Banner & Count Label ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.07 }}
          style={{ willChange: 'transform, opacity' }}
        >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.07 }}
          className="mb-8 p-4 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5"
        >
          <p className="text-sm">
            <span className="text-[var(--primary)] font-bold">SRMIST Kattankulathur</span> <span className="text-on-surface-variant">· Faculty reviews posted today</span>
          </p>
        </motion.div>

        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-6">
          {initialRatings.length > 0 ? `${initialRatings.length} UPDATES TODAY` : '0 UPDATES TODAY'}
        </h3>
        </motion.div>

        {/* ── Section 3: Reviews List ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.14 }}
          style={{ willChange: 'transform, opacity' }}
        >
        {initialRatings.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant italic font-serif opacity-50">It is quiet today...</div>
        ) : (
          <div className="flex flex-col gap-6">
            <AnimatePresence>
              {initialRatings.map((rating, i) => {
                const overallRaw = getOverall(rating);
                const overall = parseFloat(overallRaw);
                const colorClass = getRatingColor(overall);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={rating.id}
                    className="p-6 bg-[var(--surface-soft)] border border-white/5 rounded-[2rem] relative overflow-hidden group hover:bg-[var(--surface-elevated)] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-black tabular-nums tracking-tighter ${colorClass} drop-shadow-sm`}>{overallRaw}</span>
                        <span className="text-xs text-on-surface-variant font-medium">/5 overall</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant font-bold">
                        <Clock size={12} className="opacity-50" />
                        {getTimeAgo(rating.createdAt)}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-[var(--text-muted)] font-semibold mb-2 capitalize">
                        {rating.faculty?.name} <span className="opacity-50">·</span> {rating.faculty?.department}
                      </p>
                      
                      {rating.review && rating.review.trim() !== '' && (
                        <div className="border-l-2 border-[var(--primary)]/30 group-hover:border-[var(--primary)] pl-4 py-1 transition-colors">
                          <p className="text-[var(--text)] font-medium text-lg">&quot;{rating.review}&quot;</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 my-6">
                      {[
                        { label: 'TEACHING', val: rating.teachingClarity },
                        { label: 'APPROACH', val: rating.approachability },
                        { label: 'GRADING', val: rating.gradingFairness },
                        { label: 'PUNCTUALITY', val: rating.punctuality },
                        { label: 'FAIRNESS', val: rating.partiality },
                        { label: 'BEHAVIOUR', val: rating.behaviour },
                      ].map(stat => (
                        <div key={stat.label}>
                          <p className="text-[9px] uppercase tracking-widest text-[var(--text-subtle)] font-black mb-1">{stat.label}</p>
                          <p className="font-bold text-sm text-[var(--text)]">{stat.val}<span className="text-on-surface-variant/50 text-xs font-normal">/5</span></p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">VERIFIED ANONYMOUS</span>
                      <Link href={`/rate-my-faculty/${rating.facultyId}`} className="text-xs font-bold text-[var(--primary)] hover:text-white transition-colors flex items-center gap-1 group/link">
                        View Profile <span className="group-hover/link:translate-x-1 transition-transform">&rarr;</span>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
        </motion.div>
      </div>
    </div>
  );
}
