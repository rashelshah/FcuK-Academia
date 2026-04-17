'use client';

import React, { useState, useOptimistic, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReviewModal = dynamic(() => import('./ReviewModal'), { 
  ssr: false,
  loading: () => <Loader2 className="animate-spin text-[var(--primary)]" />
});

interface Review {
  id: string;
  review: string | null;
  createdAt: string;
}

interface FacultyStats {
  teachingClarity: number;
  approachability: number;
  gradingFairness: number;
  punctuality: number;
  partiality: number;
  behaviour: number;
}

interface FacultyDetail {
  id: string;
  name: string;
  department: string | null;
  designation: string | null;
  overallRating: number;
  reviewCount: number;
  stats: FacultyStats;
}

const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

function CountUp({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    let totalMilSecDur = duration * 1000;
    let incrementTime = (totalMilSecDur / end) * 0.1;

    let timer = setInterval(() => {
      start += 0.1;
      setCount(start);
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{count.toFixed(1)}</>;
}

const getMoodEmoji = (rating: number) => {
  if (rating >= 4.5) return '🔥';
  if (rating >= 3.5) return '✨';
  if (rating >= 2.5) return '😐';
  return '💀';
};

export default function FacultyDetailClient({ 
  faculty: initialFaculty, 
  reviews: initialReviews 
}: { 
  faculty: FacultyDetail; 
  reviews: Review[] 
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Optimistic UI for reviews
  const [optimisticReviews, addOptimisticReview] = useOptimistic(
    initialReviews,
    (state: Review[], newReview: Review) => [newReview, ...state]
  );

  React.useEffect(() => {
    // Targeted prefetch for "Return to Feed"
    router.prefetch('/rate-my-faculty');
  }, [router]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formParams, setFormParams] = useState({
    review: '',
  });

  const handleReviewSuccess = () => {
    // router.refresh() will update the server component's "initialReviews" 
    router.refresh();
  };

  const MetricBar = ({ label, value }: { label: string; value: number | null }) => {
    const val = value ?? 0;
    const percentage = (val / 5) * 100;
    return (
      <div className="mb-5">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[var(--text-subtle)]">
            {label}
          </span>
          <span className="text-sm font-black text-[var(--primary)] tabular-nums">
            <CountUp value={val || 0} duration={1} />
          </span>
        </div>
        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden backdrop-blur-md border border-white/5 relative">
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: percentage / 100 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/30 to-[var(--primary)] shadow-sm overflow-hidden"
            style={{ 
              WebkitBackfaceVisibility: 'hidden',
              translateZ: 0 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative pb-32 text-[var(--text)] font-[var(--font-body)] overflow-x-hidden">

      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 rmf-bg-base" />
        <div className="absolute top-[5%] left-[-15%] w-[80%] h-[80%] rounded-full rmf-bg-bloom-top" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full rmf-bg-bloom-bottom" />
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: noiseSvg }}></div>
      </div>

      <motion.div
        initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 px-4 sm:px-6 py-4 flex items-center justify-between pointer-events-none"
      >
        <div className="pointer-events-auto flex items-center gap-4">
          <Link
            href="/rate-my-faculty"
            className="flex justify-center items-center p-2 rounded-full hover:bg-white/10 transition-colors bg-white/5 backdrop-blur-md border border-white/5 shadow-lg"
          >
            <ArrowLeft size={18} className="text-[var(--text)]" />
          </Link>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
          <span className="font-[var(--font-headline)] font-bold tracking-tight text-base text-[var(--text)] drop-shadow-sm opacity-80 uppercase tracking-widest">
            Faculty Detailing
          </span>
        </div>

        <div className="w-10" />
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">

        <motion.div
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative bg-[var(--surface)]/60 border border-white/10 rounded-[2rem] p-6 sm:p-8 mb-8 overflow-hidden shadow-xl backdrop-blur-2xl ring-1 ring-white/5"
        >

          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 md:items-center">
            <div className="flex-1 min-w-0 pr-4">
              <h1 className="text-3xl sm:text-5xl font-black font-[var(--font-headline)] tracking-tighter mb-2 text-[var(--text)] drop-shadow-sm capitalize">
                {initialFaculty.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="inline-block bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase text-[var(--primary)]">
                  {initialFaculty.designation || 'Faculty'}
                </p>
                {initialFaculty.department && (
                  <p className="inline-block bg-white/5 border border-white/10 px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase text-on-surface-variant">
                    {initialFaculty.department}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 bg-[var(--surface-highlight)]/40 border border-white/10 px-6 py-4 rounded-[2rem] flex-shrink-0 shadow-lg backdrop-blur-md">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-[var(--primary)] mb-1">
                  <span className="text-3xl sm:text-4xl">{getMoodEmoji(initialFaculty.overallRating)}</span>
                  <span className="text-5xl font-black tabular-nums leading-none tracking-tighter">
                    {initialFaculty.overallRating > 0 ? <CountUp value={initialFaculty.overallRating} duration={1.5} /> : 'N/A'}
                  </span>
                </div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  {initialFaculty.reviewCount} Reviews
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05, duration: 0.4 }}
          className="grid gap-x-10 sm:grid-cols-2 bg-[var(--surface)]/30 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/5 mb-10 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent" />

          <div className="col-span-full mb-8">
            <h3 className="text-xl font-black font-[var(--font-headline)] flex items-center gap-2">
              <Star size={20} className="text-[var(--primary)] fill-[var(--primary)] drop-shadow-[0_0_8px_var(--primary)]" />
              Rating Breakdown
            </h3>
          </div>
          <div>
            <MetricBar label="Teaching Clarity" value={initialFaculty.stats?.teachingClarity} />
            <MetricBar label="Approachability" value={initialFaculty.stats?.approachability} />
            <MetricBar label="Grading Fairness" value={initialFaculty.stats?.gradingFairness} />
          </div>
          <div>
            <MetricBar label="Punctuality" value={initialFaculty.stats?.punctuality} />
            <MetricBar label="Partiality" value={initialFaculty.stats?.partiality} />
            <MetricBar label="Behaviour" value={initialFaculty.stats?.behaviour} />
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex justify-center mb-16"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="group relative px-10 py-5 bg-[var(--primary)] text-[#1a1a1a] rounded-full font-black text-lg overflow-hidden shadow-[0_0_30px_color-mix(in_srgb,var(--primary)_40%,transparent)] hover:shadow-[0_0_50px_color-mix(in_srgb,var(--primary)_60%,transparent)] transition-all font-[var(--font-headline)] tracking-wide uppercase"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative flex items-center gap-3">
              <MessageSquare size={22} className="fill-[var(--primary)] opacity-20" />
              Drop your review
            </span>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-black font-[var(--font-headline)] mb-6 tracking-tight flex items-center gap-2">
            student reviews
          </h3>
          <div className="space-y-4">
            {optimisticReviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-10 text-center bg-[var(--surface)]/30 backdrop-blur-md rounded-3xl border border-white/10 border-dashed"
              >
                <p className="text-on-surface-variant font-bold">no one has spoken yet... suspicious 👀</p>
              </motion.div>
            ) : (
              optimisticReviews.map((rev, i) => (
                <motion.div
                   key={rev.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i < 10 ? i * 0.1 : 0 }}
                  className="p-6 bg-[var(--surface)]/40 backdrop-blur-xl rounded-[1.5rem] border border-white/5 shadow-md relative group hover:bg-[var(--surface-elevated)]/60 transition-colors"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className="font-bold text-xs bg-[var(--surface-highlight)]/40 px-3 py-1.5 rounded-full text-[var(--text)] tracking-widest uppercase shadow-sm">
                      Anonymous
                    </span>
                    <span className="text-xs text-on-surface-variant font-bold tracking-widest uppercase">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[var(--text-muted)] leading-relaxed font-medium break-words text-sm sm:text-base relative z-10">
                    {rev.review}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <ReviewModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          facultyId={initialFaculty.id}
          onSuccess={handleReviewSuccess}
        />

      </div>
    </div>
  );
}
