'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  facultyId: string;
  onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, facultyId, onSuccess }: ReviewModalProps) {
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

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    // No longer mandatory

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

      onSuccess();
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to post review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !submitting && onClose()}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-[var(--surface-elevated)] border border-white/10 rounded-[2rem] p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-6 z-10"
          >
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h3 className="text-2xl font-black font-[var(--font-headline)]">Expose honestly 🤫</h3>
              <button 
                onClick={() => !submitting && onClose()} 
                className="w-10 h-10 flex justify-center items-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {submitError && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm font-semibold">
                {submitError}
              </div>
            )}

            <div className="space-y-6">
              {(['teachingClarity', 'approachability', 'gradingFairness', 'punctuality', 'partiality', 'behaviour'] as const).map((param) => {
                const val = formParams[param];
                const percentage = ((val - 1) / 4) * 100;
                return (
                  <div key={param} className="relative">
                    <div className="flex justify-between text-xs sm:text-sm mb-3 font-bold tracking-wide uppercase text-on-surface-variant">
                      <span>{param.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-[var(--primary)] tabular-nums">{val}/5</span>
                    </div>
                    <div className="relative w-full h-2 bg-white/10 rounded-full">
                      <div className="absolute left-0 top-0 bottom-0 bg-[var(--primary)] rounded-full" style={{ width: `${percentage}%` }} />
                      <input
                        type="range" min="1" max="5" step="1"
                        value={val}
                        disabled={submitting}
                        onChange={(e) => setFormParams({ ...formParams, [param]: parseInt(e.target.value) })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div
                        className="absolute top-1/2 -mt-2.5 -ml-2.5 w-5 h-5 bg-white rounded-full shadow-[0_0_15px_var(--primary)] pointer-events-none transition-all duration-200 z-10"
                        style={{ left: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}

              <div className="pt-4">
                <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-on-surface-variant">Spill the tea (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="e.g. strict grading but teaches well..."
                  value={formParams.review}
                  disabled={submitting}
                  onChange={(e) => setFormParams({ ...formParams, review: e.target.value })}
                  className="w-full bg-[var(--surface-highlight)]/20 border border-white/10 rounded-2xl p-4 text-sm focus:border-[var(--primary)] focus:ring-1 ring-[var(--primary)]/50 outline-none resize-none transition-all text-[var(--text)] font-medium"
                />
              </div>
            </div>

            <button
              onClick={submitReview}
              disabled={submitting}
              className="w-full mt-4 py-4 rounded-full bg-[var(--primary)] text-[#1a1a1a] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
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
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
