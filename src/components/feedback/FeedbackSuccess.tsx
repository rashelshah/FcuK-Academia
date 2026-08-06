'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FeedbackType } from '@/lib/feedback/types';

const SUCCESS_CONTENT: Record<FeedbackType, { heading: string; body: string }> = {
  bug: {
    heading: "Thanks for helping us squash bugs.",
    body: "Every report makes FcuK Academia more reliable.",
  },
  feature: {
    heading: "Great ideas build great products.",
    body: "Thanks for helping shape the future of FcuK Academia.",
  },
  incorrect_data: {
    heading: "Thanks for pointing this out.",
    body: "We'll verify the information and fix it as soon as possible.",
  },
  general: {
    heading: "Reading messages like this keeps us motivated.",
    body: "Thanks for taking the time to share your thoughts.",
  },
};

interface FeedbackSuccessProps {
  feedbackType: FeedbackType;
  feedbackId: string;
  onClose: () => void;
}

type Stage = 'ring' | 'check' | 'delivered' | 'message';

export function FeedbackSuccess({ feedbackType, feedbackId, onClose }: FeedbackSuccessProps) {
  const [stage, setStage] = useState<Stage>('ring');
  const content = SUCCESS_CONTENT[feedbackType];

  useEffect(() => {
    const t1 = setTimeout(() => setStage('check'), 200);
    const t2 = setTimeout(() => setStage('delivered'), 850);
    const t3 = setTimeout(() => setStage('message'), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      {/* Animated checkmark */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing outer ring */}
        <AnimatePresence>
          {stage === 'ring' && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
              exit={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute h-24 w-24 rounded-full"
              style={{ background: 'color-mix(in srgb, var(--primary) 18%, transparent)' }}
            />
          )}
        </AnimatePresence>

        {/* Secondary ring */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={stage !== 'ring' ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute h-20 w-20 rounded-full"
          style={{
            border: '2px solid color-mix(in srgb, var(--primary) 28%, transparent)',
          }}
        />

        {/* Main circle */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'color-mix(in srgb, var(--primary) 16%, var(--surface-elevated))' }}
        >
          {/* SVG checkmark with stroke animation */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <motion.path
              d="M7 16.5L13 22.5L25 10"
              stroke="var(--primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                stage === 'check' || stage === 'delivered' || stage === 'message'
                  ? { pathLength: 1, opacity: 1 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Delivered label */}
      <AnimatePresence>
        {(stage === 'delivered' || stage === 'message') && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2"
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--primary)' }}>
              ✓ Delivered
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appreciation message */}
      <AnimatePresence>
        {stage === 'message' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-2"
          >
            <h3 className="font-headline text-xl font-bold leading-snug" style={{ color: 'var(--text)' }}>
              {content.heading}
            </h3>
            <p className="max-w-[260px] text-[13px] leading-6" style={{ color: 'var(--text-muted)' }}>
              {content.body}
            </p>

            {/* Feedback ID badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.24 }}
              className="mt-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{
                background: 'color-mix(in srgb, var(--secondary) 14%, transparent)',
                color: 'var(--secondary)',
                border: '1px solid color-mix(in srgb, var(--secondary) 28%, transparent)',
              }}
            >
              #{feedbackId}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Done button */}
      <AnimatePresence>
        {stage === 'message' && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.28 }}
            type="button"
            onClick={onClose}
            className="mt-2 rounded-2xl px-8 py-3 text-[13px] font-bold"
            style={{
              background: 'color-mix(in srgb, var(--primary) 14%, var(--surface-elevated))',
              color: 'var(--primary)',
              border: '1px solid color-mix(in srgb, var(--primary) 28%, transparent)',
            }}
          >
            Done
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
