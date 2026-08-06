'use client';

import React, { useEffect, useCallback } from 'react';
import { ImageIcon } from 'lucide-react';
import { PresetSelector } from './PresetSelector';
import { saveDraft } from './FeedbackDraft';
import { FEEDBACK_PLACEHOLDERS } from '@/lib/feedback/presets';
import type { FeedbackType } from '@/lib/feedback/types';

const MAX_CHARS = 500;

interface FeedbackFormProps {
  feedbackType: FeedbackType;
  selectedPresets: string[];
  message: string;
  onPresetsChange: (presets: string[]) => void;
  onMessageChange: (msg: string) => void;
}

export function FeedbackForm({
  feedbackType,
  selectedPresets,
  message,
  onPresetsChange,
  onMessageChange,
}: FeedbackFormProps) {
  const placeholder = FEEDBACK_PLACEHOLDERS[feedbackType];

  // Autosave draft every 500ms via the saveDraft debounce
  useEffect(() => {
    saveDraft({
      type: feedbackType,
      presets: selectedPresets,
      message,
      savedAt: Date.now(),
    });
  }, [feedbackType, selectedPresets, message]);

  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.value.length <= MAX_CHARS) {
        onMessageChange(e.target.value);
      }
    },
    [onMessageChange]
  );

  const charCount = message.length;
  const nearLimit = charCount > MAX_CHARS * 0.8;

  return (
    <div className="flex flex-col gap-5">
      {/* Preset chips */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-subtle)' }}>
          Quick select
        </p>
        <PresetSelector
          feedbackType={feedbackType}
          selected={selectedPresets}
          onChange={onPresetsChange}
        />
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-subtle)' }}>
          Description{' '}
          <span style={{ color: 'var(--text-subtle)', opacity: 0.6 }}>(optional)</span>
        </p>
        <div
          className="relative rounded-2xl border"
          style={{
            borderColor: 'var(--card-border)',
            background: 'color-mix(in srgb, var(--surface-elevated) 60%, transparent)',
          }}
        >
          <textarea
            id="feedback-message"
            value={message}
            onChange={handleMessageChange}
            placeholder={placeholder}
            rows={4}
            className="w-full resize-none rounded-2xl bg-transparent px-4 py-3.5 text-[14px] leading-6 outline-none placeholder:text-[13px] placeholder:opacity-50"
            style={{ color: 'var(--text)', caretColor: 'var(--primary)' }}
            aria-label="Additional description"
            aria-describedby="feedback-char-counter"
          />
          <div
            id="feedback-char-counter"
            className="absolute bottom-3 right-4 text-[11px] font-medium tabular-nums"
            style={{
              color: nearLimit
                ? charCount >= MAX_CHARS
                  ? 'var(--error)'
                  : 'var(--warning)'
                : 'var(--text-subtle)',
            }}
          >
            {charCount} / {MAX_CHARS}
          </div>
        </div>
      </div>

      {/* Screenshot placeholder */}
      <div
        className="flex items-center gap-3 rounded-2xl border p-4"
        style={{
          borderColor: 'color-mix(in srgb, var(--border) 60%, transparent)',
          borderStyle: 'dashed',
          background: 'color-mix(in srgb, var(--surface-soft) 40%, transparent)',
        }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: 'color-mix(in srgb, var(--surface-elevated) 80%, transparent)',
            color: 'var(--text-subtle)',
          }}
        >
          <ImageIcon size={16} />
        </div>
        <div>
          <p className="text-[12px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            Screenshot
          </p>
          <p className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>
            Available in a future update
          </p>
        </div>
      </div>
    </div>
  );
}
