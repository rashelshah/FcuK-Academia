'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Edit2 } from 'lucide-react';
import { FEEDBACK_TYPES } from '@/lib/feedback/presets';
import type { FeedbackType } from '@/lib/feedback/types';

interface FeedbackPreviewProps {
  feedbackType: FeedbackType;
  selectedPresets: string[];
  message: string;
  submitting: boolean;
  onEdit: () => void;
  onSubmit: () => void;
}

export function FeedbackPreview({
  feedbackType,
  selectedPresets,
  message,
  submitting,
  onEdit,
  onSubmit,
}: FeedbackPreviewProps) {
  const typeMeta = FEEDBACK_TYPES.find((t) => t.id === feedbackType);

  return (
    <div className="flex flex-col gap-5">
      <div
        className="rounded-2xl border p-5 space-y-4"
        style={{
          borderColor: 'color-mix(in srgb, var(--primary) 25%, transparent)',
          background: 'color-mix(in srgb, var(--primary) 5%, var(--surface-soft))',
        }}
      >
        {/* Type header */}
        <div className="flex items-center gap-3">
          <span className="text-xl">{typeMeta?.icon}</span>
          <div>
            <p className="font-headline text-base font-bold" style={{ color: 'var(--primary)' }}>
              {typeMeta?.title}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full" style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }} />

        {/* Presets */}
        {selectedPresets.length > 0 && (
          <>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-subtle)' }}>
                Preset
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedPresets.map((preset) => (
                  <span
                    key={preset}
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                      color: 'var(--primary)',
                    }}
                  >
                    {preset}
                  </span>
                ))}
              </div>
            </div>
            <div className="h-px w-full" style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }} />
          </>
        )}

        {/* Message */}
        {message.trim() && (
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-subtle)' }}>
              Description
            </p>
            <p className="text-[13px] leading-6 italic" style={{ color: 'var(--text-muted)' }}>
              &ldquo;{message.trim()}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Diagnostics note */}
      <p className="text-center text-[11px]" style={{ color: 'var(--text-subtle)' }}>
        Your Voice. Our Next Update.
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onEdit}
          disabled={submitting}
          className="flex items-center gap-2 rounded-2xl border px-4 py-3 text-[13px] font-semibold transition-colors disabled:opacity-50"
          style={{
            borderColor: 'var(--card-border)',
            background: 'color-mix(in srgb, var(--surface-elevated) 60%, transparent)',
            color: 'var(--text-muted)',
          }}
        >
          <Edit2 size={14} />
          Edit
        </button>

        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          animate={submitting ? { scale: 0.96 } : { scale: 1 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[13px] font-bold transition-opacity disabled:cursor-not-allowed"
          style={{
            background: submitting
              ? 'color-mix(in srgb, var(--primary) 70%, transparent)'
              : 'var(--primary)',
            color: 'var(--text-inverse)',
          }}
        >
          {submitting ? (
            <>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                ⏳
              </motion.span>
              Submitting...
            </>
          ) : (
            <>Send Feedback</>
          )}
        </motion.button>
      </div>
    </div>
  );
}
