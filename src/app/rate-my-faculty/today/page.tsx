'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RmfTodayPage() {
  const router = useRouter();
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/rmf/today')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRatings(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
      {/* Global Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] to-[color-mix(in_srgb,var(--primary)_10%,var(--background))]" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[100px] bg-[var(--primary)]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-10 blur-[120px] bg-[var(--primary)]" />
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 px-4 sm:px-6 py-4 flex items-center justify-between pointer-events-none"
      >
        <div className="pointer-events-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-on-surface-variant font-medium text-sm hover:text-white transition-colors uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span>
          </button>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto flex gap-2 items-baseline">
          <span className="font-serif font-black tracking-tight text-xl text-[var(--text)] drop-shadow-sm">
            Today's <span className="italic text-[var(--primary)]">Voices</span>
          </span>
        </div>
        
        <div className="pointer-events-auto hidden sm:block">
          <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">LIVE FEED</span>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 backdrop-blur-sm">
          <p className="text-sm">
            <span className="text-[var(--primary)] font-bold">SRMIST Kattankulathur</span> <span className="text-on-surface-variant">· Faculty reviews posted today</span>
          </p>
        </motion.div>

        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-6">
          {ratings.length > 0 ? `${ratings.length} UPDATES TODAY` : '0 UPDATES TODAY'}
        </h3>

        {loading ? (
          <div className="flex justify-center py-20 text-[var(--primary)]"><Loader2 className="animate-spin" size={32} /></div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 text-red-400 rounded-xl">{error}</div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant italic font-serif">It is quiet today...</div>
        ) : (
          <div className="flex flex-col gap-6">
            <AnimatePresence>
              {ratings.map((rating, i) => {
                const overallRaw = getOverall(rating);
                const overall = parseFloat(overallRaw);
                const colorClass = getRatingColor(overall);

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={rating.id}
                    className="p-6 bg-[var(--surface-elevated)]/40 border border-white/5 rounded-[2rem] backdrop-blur-xl relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-black tabular-nums tracking-tighter ${colorClass} drop-shadow-sm`}>{overallRaw}</span>
                        <span className="text-xs text-on-surface-variant font-medium">/5 overall</span>
                      </div>
                      <span className="text-xs text-on-surface-variant">{getTimeAgo(rating.createdAt)}</span>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-[var(--text-muted)] font-semibold mb-2 capitalize">
                        {rating.faculty?.name} <span className="opacity-50">·</span> {rating.faculty?.department}
                      </p>
                      
                      {rating.review && rating.review.trim() !== '' && (
                        <div className="border-l-2 border-[var(--primary)] pl-4 py-1">
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
                      <Link href={`/rate-my-faculty/${rating.facultyId}`} className="text-xs font-bold text-[var(--primary)] hover:text-white transition-colors">
                        View Profile &rarr;
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
