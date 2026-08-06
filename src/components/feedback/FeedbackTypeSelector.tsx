'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { FEEDBACK_TYPES } from '@/lib/feedback/presets';
import type { FeedbackType } from '@/lib/feedback/types';

interface FeedbackTypeSelectorProps {
  selected: FeedbackType | null;
  onChange: (type: FeedbackType) => void;
}

export const FeedbackTypeSelector = memo(function FeedbackTypeSelector({
  selected,
  onChange,
}: FeedbackTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      {FEEDBACK_TYPES.map((type, i) => {
        const isSelected = selected === type.id;
        return (
          <motion.button
            key={type.id}
            type="button"
            id={`feedback-type-${type.id}`}
            aria-pressed={isSelected}
            aria-label={`${type.title}: ${type.description}`}
            onClick={() => onChange(type.id)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.98 }}
            className="relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-shadow"
            style={{
              borderColor: isSelected
                ? 'color-mix(in srgb, var(--primary) 60%, transparent)'
                : 'var(--card-border)',
              background: isSelected
                ? 'color-mix(in srgb, var(--primary) 9%, var(--surface-soft))'
                : 'color-mix(in srgb, var(--surface-soft) 90%, transparent)',
              boxShadow: isSelected
                ? '0 0 0 1.5px color-mix(in srgb, var(--primary) 40%, transparent)'
                : 'none',
            }}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
              style={{
                background: isSelected
                  ? 'color-mix(in srgb, var(--primary) 14%, var(--surface-elevated))'
                  : 'color-mix(in srgb, var(--surface-elevated) 80%, transparent)',
              }}
            >
              {type.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="font-headline text-base font-bold"
                style={{ color: isSelected ? 'var(--primary)' : 'var(--text)' }}
              >
                {type.title}
              </p>
              <p className="mt-0.5 text-[12px] leading-5" style={{ color: 'var(--text-muted)' }}>
                {type.description}
              </p>
            </div>
            {isSelected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'var(--primary)' }}
              >
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="var(--text-inverse)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
});
