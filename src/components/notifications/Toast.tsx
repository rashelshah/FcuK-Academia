'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BellRing, BookOpen, CircleAlert, Megaphone, Sparkles, TriangleAlert, X } from 'lucide-react';

import type { NotificationToastItem } from '@/lib/notifications/types';

const ICON_MAP = {
  good: Sparkles,
  bad: TriangleAlert,
  warning: CircleAlert,
  class: BookOpen,
  broadcast: Megaphone,
  system: BellRing,
} as const;

const TONE_STYLES = {
  good: {
    accent: 'var(--primary)',
    background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 94%, transparent) 0%, color-mix(in srgb, var(--primary) 16%, var(--surface-elevated)) 100%)',
  },
  bad: {
    accent: 'var(--error)',
    background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 94%, transparent) 0%, color-mix(in srgb, var(--error) 16%, var(--surface-elevated)) 100%)',
  },
  warning: {
    accent: 'var(--warning)',
    background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 94%, transparent) 0%, color-mix(in srgb, var(--warning) 16%, var(--surface-elevated)) 100%)',
  },
  class: {
    accent: 'var(--secondary)',
    background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 94%, transparent) 0%, color-mix(in srgb, var(--secondary) 16%, var(--surface-elevated)) 100%)',
  },
  broadcast: {
    accent: 'var(--accent)',
    background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 94%, transparent) 0%, color-mix(in srgb, var(--accent) 16%, var(--surface-elevated)) 100%)',
  },
  system: {
    accent: 'var(--secondary)',
    background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 94%, transparent) 0%, color-mix(in srgb, var(--secondary) 12%, var(--surface-elevated)) 100%)',
  },
} as const;

interface ToastProps {
  item: NotificationToastItem;
  onDismiss: (id: string) => void;
}

export default function Toast({ item, onDismiss }: ToastProps) {
  const router = useRouter();
  const Icon = ICON_MAP[item.type] ?? BellRing;
  const tone = TONE_STYLES[item.type] ?? TONE_STYLES.system;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onDismiss(item.id);
    }, item.durationMs ?? 5200);

    return () => window.clearTimeout(timeoutId);
  }, [item.durationMs, item.id, onDismiss]);

  const handleClick = () => {
    if (item.deepLink) {
      if (/^https?:\/\//i.test(item.deepLink)) {
        window.location.href = item.deepLink;
      } else {
        router.push(item.deepLink);
      }
    }
    onDismiss(item.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto"
    >
      <button
        type="button"
        onClick={handleClick}
        className="w-full overflow-hidden rounded-[28px] border p-4 text-left"
        style={{
          borderColor: `color-mix(in srgb, ${tone.accent} 28%, var(--card-border))`,
          background: tone.background,
          boxShadow: 'var(--elevation-floating)',
        }}
      >
        <div className="flex items-start gap-3.5">
          <div
            className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border"
            style={{
              color: tone.accent,
              borderColor: `color-mix(in srgb, ${tone.accent} 28%, transparent)`,
              background: `color-mix(in srgb, ${tone.accent} 12%, transparent)`,
            }}
          >
            <Icon size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="theme-kicker" style={{ color: tone.accent }}>
              {item.source ?? 'notification'}
            </p>
            <h3 className="mt-1 font-headline text-[1.08rem] font-bold text-on-surface">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-5 text-on-surface-variant">
              {item.message}
            </p>
          </div>

          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant/80"
            onClick={(event) => {
              event.stopPropagation();
              onDismiss(item.id);
            }}
          >
            <X size={16} />
          </span>
        </div>
      </button>
    </motion.div>
  );
}
