'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowLeft, Loader2, MessageSquare, Send } from 'lucide-react';

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

  useEffect(() => {
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

export default function FacultyDetailPage() {
  const { facultyId } = useParams();
  const router = useRouter();

  const [data, setData] = useState<{ faculty: FacultyDetail; reviews: Review[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formParams, setFormParams] = useState({
    teachingClarity: 3,
    approachability: 3,
    gradingFairness: 3,
    punctuality: 3,
    partiality: 3,
    behaviour: 3,
    review: '',
  });

  useEffect(() => {
    if (!facultyId) return;
    fetch(`/api/rmf/faculty/${facultyId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.error) throw new Error(res.error);
        setData(res);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [facultyId]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/rmf/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId,
          ...formParams,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      // Reload on success
      setIsModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
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
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="h-full rounded-full bg-gradient-to-r from-[var(--primary)]/30 to-[var(--primary)] shadow-sm relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
          </motion.div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-[var(--primary)]" size={40} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center p-8 bg-[var(--surface-elevated)] border border-red-500/20 rounded-2xl">
          <p className="text-red-400 font-medium mb-4">{error || 'Faculty not found'}</p>
          <button onClick={() => router.back()} className="text-[var(--text)] underline">Go back</button>
        </div>
      </div>
    );
  }

  const { faculty, reviews } = data;

  return (
    <div className="min-h-screen relative pb-32 text-[var(--text)] font-[var(--font-body)] overflow-x-hidden">

      {/* Global Background Fix */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-[var(--background)]" />
        <div className="absolute top-[10%] left-[-20%] w-[70%] h-[70%] rounded-full opacity-[0.03] blur-[130px] bg-[var(--primary)]" />
        <div className="absolute bottom-[0%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.02] blur-[120px] bg-[var(--primary)]" />
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: noiseSvg }}></div>
      </div>

      {/* Header Back Button - Seamless Integration */}
      <motion.div
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 px-4 sm:px-6 py-4 flex items-center justify-between pointer-events-none"
      >
        <div className="pointer-events-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex justify-center items-center p-2 rounded-full hover:bg-white/10 transition-colors bg-white/5 backdrop-blur-md border border-white/5 shadow-lg"
          >
            <ArrowLeft size={18} className="text-[var(--text)]" />
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
          <span className="font-[var(--font-headline)] font-bold tracking-tight text-base text-[var(--text)] drop-shadow-sm opacity-80 uppercase tracking-widest">
            Faculty Detailing
          </span>
        </div>

        <div className="w-10" />
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">

        {/* Profile Card (Stronger glassmorphism depth, glow edge) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="relative bg-[var(--surface)]/60 border border-white/10 rounded-[2rem] p-6 sm:p-8 mb-8 overflow-hidden shadow-xl backdrop-blur-2xl ring-1 ring-white/5"
        >

          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 md:items-center">
            <div className="flex-1 min-w-0 pr-4">
              <h1 className="text-3xl sm:text-5xl font-black font-[var(--font-headline)] tracking-tighter mb-2 text-[var(--text)] drop-shadow-sm capitalize">
                {faculty.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="inline-block bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase text-[var(--primary)]">
                  {faculty.designation || 'Faculty'}
                </p>
                {faculty.department && (
                  <p className="inline-block bg-white/5 border border-white/10 px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase text-on-surface-variant">
                    {faculty.department}
                  </p>
                )}
              </div>
            </div>

            {/* Minimal Badge for Rate */}
            <div className="flex items-center justify-center gap-3 bg-[var(--surface-highlight)]/40 border border-white/10 px-6 py-4 rounded-[2rem] flex-shrink-0 shadow-lg backdrop-blur-md">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-[var(--primary)] mb-1">
                  <span className="text-3xl sm:text-4xl">{getMoodEmoji(faculty.overallRating)}</span>
                  <span className="text-5xl font-black tabular-nums leading-none tracking-tighter">
                    {faculty.overallRating > 0 ? <CountUp value={faculty.overallRating} duration={1.5} /> : 'N/A'}
                  </span>
                </div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  {faculty.reviewCount} Reviews
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Breakdown Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid gap-x-10 sm:grid-cols-2 bg-[var(--surface)]/30 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/5 mb-10 shadow-lg relative overflow-hidden"
        >
          {/* Subtle decoration inside stats */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent" />

          <div className="col-span-full mb-8">
            <h3 className="text-xl font-black font-[var(--font-headline)] flex items-center gap-2">
              <Star size={20} className="text-[var(--primary)] fill-[var(--primary)] drop-shadow-[0_0_8px_var(--primary)]" />
              Rating Breakdown
            </h3>
          </div>
          <div>
            <MetricBar label="Teaching Clarity" value={faculty.stats?.teachingClarity} />
            <MetricBar label="Approachability" value={faculty.stats?.approachability} />
            <MetricBar label="Grading Fairness" value={faculty.stats?.gradingFairness} />
          </div>
          <div>
            <MetricBar label="Punctuality" value={faculty.stats?.punctuality} />
            <MetricBar label="Partiality" value={faculty.stats?.partiality} />
            <MetricBar label="Behaviour" value={faculty.stats?.behaviour} />
          </div>
        </motion.div>

        {/* CTA Button */}
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

        {/* Student Receipts */}
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-black font-[var(--font-headline)] mb-6 tracking-tight flex items-center gap-2">
            student reviews
          </h3>
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-10 text-center bg-[var(--surface)]/30 backdrop-blur-md rounded-3xl border border-white/10 border-dashed"
              >
                <p className="text-on-surface-variant font-bold">no one has spoken yet... suspicious 👀</p>
              </motion.div>
            ) : (
              reviews.map((rev, i) => (
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

        {/* Modal form */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Strong glass blur background */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => !submitting && setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              />

              {/* Smooth spring animated modal body */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-[var(--surface-elevated)] border border-white/10 rounded-[2rem] p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-6 ring-1 ring-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
              >
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <h3 className="text-2xl font-black font-[var(--font-headline)]">Expose honestly 🤫</h3>
                  <button onClick={() => !submitting && setIsModalOpen(false)} className="w-10 h-10 flex justify-center items-center rounded-full bg-white/5 hover:bg-white/10 font-bold text-lg transition-colors">&times;</button>
                </div>

                {submitError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm font-semibold">
                    {submitError}
                  </motion.div>
                )}

                <div className="space-y-6">
                  {(['teachingClarity', 'approachability', 'gradingFairness', 'punctuality', 'partiality', 'behaviour'] as const).map((param) => {
                    const val = formParams[param] as number;
                    const percentage = ((val - 1) / 4) * 100;
                    return (
                      <div key={param} className="relative">
                        <div className="flex justify-between text-xs sm:text-sm mb-3 font-bold tracking-wide uppercase text-on-surface-variant">
                          <span>{param.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-[var(--primary)] tabular-nums">{val}/5</span>
                        </div>
                        {/* Custom Slider with glowing thumb & track fill */}
                        <div className="relative w-full h-2 bg-white/10 rounded-full">
                          <div className="absolute left-0 top-0 bottom-0 bg-[var(--primary)] rounded-full transition-all duration-200" style={{ width: `${percentage}%` }} />
                          <input
                            type="range" min="1" max="5" step="1"
                            value={val}
                            disabled={submitting}
                            onChange={(e) => setFormParams({ ...formParams, [param]: parseInt(e.target.value) })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                          {/* Glowing thumb visuals */}
                          <div
                            className="absolute top-1/2 -mt-2.5 -ml-2.5 w-5 h-5 bg-white rounded-full shadow-[0_0_15px_var(--primary)] pointer-events-none transition-all duration-200 z-10"
                            style={{ left: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}

                  <div className="pt-4">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-on-surface-variant">Spill the tea (Review)</label>
                    <textarea
                      rows={4}
                      placeholder="e.g. strict grading but teaches well..."
                      value={formParams.review}
                      disabled={submitting}
                      onChange={(e) => setFormParams({ ...formParams, review: e.target.value })}
                      className="w-full bg-[var(--surface-highlight)]/20 border border-white/10 rounded-2xl p-4 text-sm focus:border-[var(--primary)] focus:ring-1 ring-[var(--primary)]/50 outline-none resize-none transition-all placeholder:text-on-surface-variant/40 text-[var(--text)] font-medium"
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={!submitting ? { scale: 0.95 } : {}}
                  onClick={submitReview}
                  disabled={submitting}
                  className="w-full mt-4 py-4 rounded-full bg-[var(--primary)] text-[#1a1a1a] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_40%,transparent)]"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send size={20} className="fill-[#1a1a1a]/20" />
                      Post Review
                    </>
                  )}
                </motion.button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
