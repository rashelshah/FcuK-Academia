'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface LegalModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  content: string;
}

/**
 * Reusable legal document modal.
 *
 * Animation fix notes:
 * - Scroll unlock fires in onExitComplete, NOT in the useEffect cleanup.
 *   Restoring overflow immediately when open=false causes a scrollbar to appear
 *   mid-animation, shifting page content horizontally — the classic close jitter.
 * - Exit uses a tween (not spring) so the duration is predictable and the overlay
 *   + card finish at exactly the same time.
 * - will-change: transform on the card panel enables GPU compositing so the browser
 *   doesn't layout-thrash during the slide out.
 */
export default function LegalModal({
  open,
  onClose,
  title,
  kicker = 'legal',
  content,
}: LegalModalProps) {
  // Persist the pre-lock values so we restore to exactly what was there.
  const savedOverflow = useRef('');
  const savedTouchAction = useRef('');

  useEffect(() => {
    if (!open) return;

    // Lock body scroll when the modal opens.
    savedOverflow.current = document.body.style.overflow;
    savedTouchAction.current = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // ⚠️ DO NOT restore in this cleanup.
    // Restoring here fires the instant open=false, before the exit animation
    // starts — which causes the page scrollbar to reappear mid-animation,
    // horizontally shifting all content. That's the jitter.
    // Restoration happens in handleExitComplete below instead.
  }, [open]);

  // AnimatePresence calls this only after the exit animation fully completes.
  const handleExitComplete = useCallback(() => {
    document.body.style.overflow = savedOverflow.current;
    document.body.style.touchAction = savedTouchAction.current;
  }, []);

  // Escape key to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence onExitComplete={handleExitComplete}>
      {open ? (
        // Overlay — fades in/out in sync with the card slide.
        <motion.div
          className="fixed inset-0 z-[999] flex min-h-screen w-full items-end justify-center overflow-hidden bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Card panel */}
          <motion.div
            className="relative flex h-[100dvh] w-full max-w-[28rem] flex-col overflow-hidden border px-4 pb-6 pt-5 sm:max-w-[34rem] sm:px-6 lg:max-w-[44rem] xl:max-w-[52rem]"
            style={{
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, black 4%) 0%, color-mix(in srgb, var(--surface-soft) 94%, transparent) 100%)',
              borderColor: 'var(--border-strong)',
              boxShadow: '0 28px 80px rgba(0,0,0,0.45)',
              // GPU layer: prevents layout thrash during the transform animation.
              willChange: 'transform, opacity',
            }}
            initial={{ y: '100%', opacity: 0.92 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: { type: 'spring', stiffness: 300, damping: 30 },
            }}
            exit={{
              y: '100%',
              opacity: 0.92,
              // Tween on exit = fixed, predictable 200ms.
              // Spring exit has a long tail that causes a perceived drag/jitter.
              transition: { type: 'tween', duration: 0.2, ease: [0.4, 0, 1, 1] },
            }}
          >
            {/* Hero gradient accent */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-70"
              style={{ background: 'var(--hero-gradient)' }}
            />

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="theme-kicker">{kicker}</p>
                <h2 className="mt-2 font-headline text-[2.6rem] font-bold leading-[0.9] tracking-tight text-on-surface">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="theme-icon-button flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                aria-label={`Close ${title}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="relative z-10 mt-6 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-8 px-1 scrollbar-hide">
              <div
                className="rounded-[32px] border p-6"
                style={{
                  background:
                    'color-mix(in srgb, var(--surface-soft) 92%, transparent)',
                  borderColor:
                    'color-mix(in srgb, var(--secondary) 24%, var(--border))',
                  boxShadow: 'var(--elevation-card)',
                }}
              >
                <LegalContentRenderer content={content} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Content renderer                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Renders legal content string preserving line structure.
 *
 * Heading detection rules (apply bold):
 * - Markdown headings: lines starting with # / ## / ### (stripped of hashes)
 * - Numbered headings: lines like "1. SOME HEADING" (all-caps after number)
 * - All-caps standalone lines: e.g. "FINAL STATEMENT"
 * - Lines with "Last Updated:" prefix
 *
 * Everything else renders as normal text, blank lines add spacing.
 */
function LegalContentRenderer({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-0">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        // Blank line → spacer
        if (trimmed === '') {
          return <div key={index} className="h-3" />;
        }

        // Markdown H1 (# ...) — document title
        if (trimmed.startsWith('# ')) {
          const text = trimmed.slice(2).trim();
          return (
            <p
              key={index}
              className="font-headline text-xl font-bold text-on-surface leading-tight mb-1"
            >
              {renderInline(text)}
            </p>
          );
        }

        // Markdown H2 (## ...)
        if (trimmed.startsWith('## ')) {
          const text = trimmed.slice(3).trim();
          return (
            <p
              key={index}
              className="font-headline text-base font-bold text-on-surface mt-4 mb-1 leading-snug"
            >
              {renderInline(text)}
            </p>
          );
        }

        // Markdown H3 (### ...)
        if (trimmed.startsWith('### ')) {
          const text = trimmed.slice(4).trim();
          return (
            <p
              key={index}
              className="text-[13px] font-bold text-on-surface mt-3 mb-0.5 leading-snug"
            >
              {renderInline(text)}
            </p>
          );
        }

        // Horizontal rule
        if (trimmed === '---') {
          return (
            <div
              key={index}
              className="my-4 border-t"
              style={{ borderColor: 'color-mix(in srgb, var(--border) 60%, transparent)' }}
            />
          );
        }

        // Blockquote (> ...)
        if (trimmed.startsWith('> ')) {
          const text = trimmed.slice(2).trim();
          return (
            <div
              key={index}
              className="my-2 border-l-2 pl-3"
              style={{ borderColor: 'var(--secondary)' }}
            >
              <p className="text-[13px] leading-6 text-on-surface-variant italic">
                {renderInline(text)}
              </p>
            </div>
          );
        }

        // Bullet list item (* ... or - ...)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const text = trimmed.slice(2).trim();
          return (
            <div key={index} className="flex items-start gap-2.5 py-0.5">
              <span
                className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: 'var(--text-subtle)' }}
              />
              <p className="text-[13px] leading-6 text-on-surface-variant">
                {renderInline(text)}
              </p>
            </div>
          );
        }

        // "Last Updated:" meta line
        if (trimmed.startsWith('**Last Updated:**')) {
          return (
            <p
              key={index}
              className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/40 font-bold mb-2"
            >
              {trimmed.replace(/\*\*/g, '')}
            </p>
          );
        }

        // Numbered heading: e.g. "1. INTRODUCTION" or "13.1 Something"
        const numberedHeading = /^(\d+\.[\d.]?\s+)([A-Z\s&()/"'.-]+)$/.exec(trimmed);
        if (numberedHeading) {
          return (
            <p
              key={index}
              className="text-[13px] font-bold text-on-surface mt-3 mb-0.5 leading-snug uppercase tracking-wide"
            >
              {renderInline(trimmed)}
            </p>
          );
        }

        // All-caps standalone line (e.g. "FINAL STATEMENT")
        if (trimmed === trimmed.toUpperCase() && /[A-Z]{3,}/.test(trimmed) && trimmed.length > 3) {
          return (
            <p
              key={index}
              className="text-[13px] font-bold text-on-surface mt-3 mb-0.5 leading-snug uppercase tracking-wide"
            >
              {renderInline(trimmed)}
            </p>
          );
        }

        // Default: normal paragraph text
        return (
          <p key={index} className="text-[13px] leading-6 text-on-surface-variant">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Renders inline markdown: **bold** and [text](url) links.
 * Returns an array of React nodes.
 */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, i) => {
    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-on-surface">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Link: [label](url)
    const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline underline-offset-2"
          style={{ color: 'var(--secondary)' }}
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}
