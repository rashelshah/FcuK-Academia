'use client';

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FEEDBACK_PRESETS } from '@/lib/feedback/presets';
import type { FeedbackType } from '@/lib/feedback/types';

interface PresetSelectorProps {
  feedbackType: FeedbackType;
  selected: string[];
  onChange: (presets: string[]) => void;
}

export const PresetSelector = memo(function PresetSelector({
  feedbackType,
  selected,
  onChange,
}: PresetSelectorProps) {
  const presets = useMemo(() => FEEDBACK_PRESETS[feedbackType] ?? [], [feedbackType]);

  function toggle(preset: string) {
    if (selected.includes(preset)) {
      onChange(selected.filter((p) => p !== preset));
    } else {
      onChange([...selected, preset]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset, i) => {
        const isSelected = selected.includes(preset);
        return (
          <motion.button
            key={preset}
            type="button"
            id={`preset-${feedbackType}-${i}`}
            aria-pressed={isSelected}
            aria-label={preset}
            onClick={() => toggle(preset)}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.16, delay: i * 0.025, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors"
            style={{
              background: isSelected
                ? 'color-mix(in srgb, var(--primary) 20%, var(--surface-elevated))'
                : 'color-mix(in srgb, var(--surface-elevated) 80%, transparent)',
              color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
              border: `1px solid ${
                isSelected
                  ? 'color-mix(in srgb, var(--primary) 45%, transparent)'
                  : 'var(--card-border)'
              }`,
            }}
          >
            {preset}
          </motion.button>
        );
      })}
    </div>
  );
});
