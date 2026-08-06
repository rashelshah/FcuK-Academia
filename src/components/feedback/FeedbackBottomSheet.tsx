'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, ChevronRight, X } from 'lucide-react';

import { FeedbackTypeSelector } from './FeedbackTypeSelector';
import { FeedbackForm } from './FeedbackForm';
import { FeedbackPreview } from './FeedbackPreview';
import { FeedbackSuccess } from './FeedbackSuccess';
import { collectDiagnostics } from './FeedbackDiagnostics';
import { submitFeedback } from './FeedbackAPI';
import { clearDraft, hasMeaningfulDraft, loadDraft } from './FeedbackDraft';

import type { FeedbackDraft, FeedbackType } from '@/lib/feedback/types';
import { cn } from '@/lib/utils';

// ─── Haptic ────────────────────────────────────────────────────────────────────
function triggerHaptic(type: 'selection' | 'impact' = 'selection') {
  if (typeof navigator === 'undefined') return;
  if (!/android/i.test(navigator.userAgent)) return;
  if (!('vibrate' in navigator)) return;
  try { navigator.vibrate(type === 'selection' ? 12 : [12, 40, 18]); } catch { /* ignore */ }
}

// ─── Step Machine ─────────────────────────────────────────────────────────────
type Step = 'type' | 'form' | 'preview' | 'success';

const STEP_LABELS: Record<Step, string> = {
  type: 'Type',
  form: 'Details',
  preview: 'Review',
  success: '',
};

const STEP_ORDER: Step[] = ['type', 'form', 'preview', 'success'];

interface FeedbackBottomSheetProps {
  open: boolean;
  onClose: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function FeedbackBottomSheet({ open, onClose }: FeedbackBottomSheetProps) {
  const shouldReduceMotion = useReducedMotion();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('type');
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string>('');

  // ── Draft recovery state ────────────────────────────────────────────────────
  const [pendingDraft, setPendingDraft] = useState<FeedbackDraft | null>(null);
  const [draftBannerVisible, setDraftBannerVisible] = useState(false);

  // ── Sheet drag refs ─────────────────────────────────────────────────────────
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollPosition = useRef<number>(0);
  const scrollLockYRef = useRef<number>(0);
  const [isEntering, setIsEntering] = useState(false);

  const dragState = useRef<{
    active: boolean;
    startY: number;
    currentY: number;
    startTime: number;
  }>({ active: false, startY: 0, currentY: 0, startTime: 0 });

  // ── Body scroll lock ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setIsEntering(false);
      return;
    }

    setIsEntering(true);

    // Check for draft
    const draft = loadDraft();
    if (hasMeaningfulDraft(draft)) {
      setPendingDraft(draft);
      setDraftBannerVisible(true);
    }

    const scrollY = window.scrollY || 0;
    scrollLockYRef.current = scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
      htmlOverflow: document.documentElement.style.overflow,
    };
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.width = prev.width;
      document.body.style.overflow = prev.overflow;
      document.body.style.paddingRight = prev.paddingRight;
      document.documentElement.style.overflow = prev.htmlOverflow;
      window.scrollTo(0, scrollLockYRef.current);
    };
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      // Small delay so exit animation plays before reset
      const t = setTimeout(() => {
        setStep('type');
        setFeedbackType(null);
        setSelectedPresets([]);
        setMessage('');
        setError(null);
        setSubmitting(false);
        setSuccessId('');
        setPendingDraft(null);
        setDraftBannerVisible(false);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      lastScrollPosition.current = scrollContainerRef.current.scrollTop;
    }
  }, []);

  // ── Drag handle ─────────────────────────────────────────────────────────────
  const applySheetTranslation = useCallback((y: number) => {
    const el = sheetRef.current;
    if (!el) return;
    el.style.transform = `translateY(${Math.max(0, y)}px)`;
  }, []);

  const handleDragPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { active: true, startY: e.clientY, currentY: e.clientY, startTime: Date.now() };
    e.stopPropagation();
  }, []);

  const handleDragPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.active) return;
    dragState.current.currentY = e.clientY;
    applySheetTranslation(e.clientY - dragState.current.startY);
    e.stopPropagation();
  }, [applySheetTranslation]);

  const handleDragPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.active) return;
    dragState.current.active = false;
    const deltaY = e.clientY - dragState.current.startY;
    const elapsed = Date.now() - dragState.current.startTime;
    const velocity = elapsed > 0 ? deltaY / elapsed : 0;

    if (deltaY > 100 || velocity > 0.4) {
      triggerHaptic('impact');
      onClose();
    } else {
      const el = sheetRef.current;
      if (el) {
        el.style.transition = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.transform = 'translateY(0px)';
        const cleanup = () => { el.style.transition = ''; el.style.transform = ''; el.removeEventListener('transitionend', cleanup); };
        el.addEventListener('transitionend', cleanup, { once: true });
      }
    }
    e.stopPropagation();
  }, [onClose]);

  const handleDragPointerCancel = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.active) return;
    dragState.current.active = false;
    const el = sheetRef.current;
    if (el) {
      el.style.transition = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = 'translateY(0px)';
      const cleanup = () => { el.style.transition = ''; el.style.transform = ''; el.removeEventListener('transitionend', cleanup); };
      el.addEventListener('transitionend', cleanup, { once: true });
    }
    e.stopPropagation();
  }, []);

  // ── Draft recovery ──────────────────────────────────────────────────────────
  function acceptDraft() {
    if (!pendingDraft) return;
    if (pendingDraft.type) setFeedbackType(pendingDraft.type);
    setSelectedPresets(pendingDraft.presets);
    setMessage(pendingDraft.message);
    // Go to form step if type is set, else stay on type
    if (pendingDraft.type) setStep('form');
    setDraftBannerVisible(false);
    setPendingDraft(null);
  }

  function discardDraft() {
    clearDraft();
    setDraftBannerVisible(false);
    setPendingDraft(null);
  }

  // ── Navigation ───────────────────────────────────────────────────────────────
  function goBack() {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1] as Step);
  }

  function canAdvanceToForm(): boolean {
    return feedbackType !== null;
  }

  function canAdvanceToPreview(): boolean {
    return selectedPresets.length > 0 || message.trim().length > 0;
  }

  function handleTypeNext() {
    if (!canAdvanceToForm()) return;
    triggerHaptic('selection');
    setStep('form');
  }

  function handleFormNext() {
    if (!canAdvanceToPreview()) return;
    triggerHaptic('selection');
    setStep('preview');
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!feedbackType) return;
    setSubmitting(true);
    setError(null);

    try {
      const diagnostics = collectDiagnostics();
      const result = await submitFeedback({
        feedbackType,
        selectedPresets,
        customMessage: message,
        diagnostics,
        honeypot: '',
      });

      if (result.success) {
        clearDraft();
        setSuccessId(result.feedbackId ?? 'FB-0000');
        setStep('success');
      } else {
        setError(result.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step header ─────────────────────────────────────────────────────────────
  const showBackButton = step !== 'type' && step !== 'success';
  const showStepIndicator = step !== 'success';

  const stepTitle = useMemo(() => {
    if (step === 'type') return 'What would you like to share?';
    if (step === 'form') return 'Tell us more';
    if (step === 'preview') return 'Review before sending';
    return '';
  }, [step]);

  const currentStepIdx = STEP_ORDER.indexOf(step);

  // ── Step content ─────────────────────────────────────────────────────────────
  const stepContent = useMemo(() => {
    if (step === 'type') {
      return (
        <FeedbackTypeSelector
          selected={feedbackType}
          onChange={(type) => {
            setFeedbackType(type);
            // Auto-clear presets when type changes
            setSelectedPresets([]);
          }}
        />
      );
    }
    if (step === 'form' && feedbackType) {
      return (
        <FeedbackForm
          feedbackType={feedbackType}
          selectedPresets={selectedPresets}
          message={message}
          onPresetsChange={setSelectedPresets}
          onMessageChange={setMessage}
        />
      );
    }
    if (step === 'preview' && feedbackType) {
      return (
        <FeedbackPreview
          feedbackType={feedbackType}
          selectedPresets={selectedPresets}
          message={message}
          submitting={submitting}
          onEdit={goBack}
          onSubmit={() => { void handleSubmit(); }}
        />
      );
    }
    if (step === 'success' && feedbackType) {
      return (
        <FeedbackSuccess
          feedbackType={feedbackType}
          feedbackId={successId}
          onClose={onClose}
        />
      );
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, feedbackType, selectedPresets, message, submitting, successId]);

  // ── Next button ─────────────────────────────────────────────────────────────
  const nextButton = useMemo(() => {
    if (step === 'type') {
      return (
        <motion.button
          type="button"
          onClick={handleTypeNext}
          disabled={!canAdvanceToForm()}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-bold disabled:opacity-40 transition-opacity"
          style={{
            background: canAdvanceToForm() ? 'var(--primary)' : 'color-mix(in srgb, var(--surface-elevated) 80%, transparent)',
            color: canAdvanceToForm() ? 'var(--text-inverse)' : 'var(--text-muted)',
          }}
        >
          Next
          <ChevronRight size={16} />
        </motion.button>
      );
    }
    if (step === 'form') {
      return (
        <motion.button
          type="button"
          onClick={handleFormNext}
          disabled={!canAdvanceToPreview()}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-bold disabled:opacity-40 transition-opacity"
          style={{
            background: canAdvanceToPreview() ? 'var(--primary)' : 'color-mix(in srgb, var(--surface-elevated) 80%, transparent)',
            color: canAdvanceToPreview() ? 'var(--text-inverse)' : 'var(--text-muted)',
          }}
        >
          Preview
          <ChevronRight size={16} />
        </motion.button>
      );
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, feedbackType, selectedPresets, message]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {open ? (
        <div key="fb-portal" className="fixed inset-0 z-[999] flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            key="fb-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.08 : 0.18, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/65"
            // No onClick — no accidental dismiss
          />
          <motion.div
            key="fb-backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: isEntering ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed inset-0 backdrop-blur-sm pointer-events-none"
          />

          {/* Sheet */}
          <motion.div
            key="fb-sheet"
            ref={sheetRef}
            initial={{ y: shouldReduceMotion ? 0 : '100%', opacity: shouldReduceMotion ? 0 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: shouldReduceMotion ? 0 : '100%', opacity: shouldReduceMotion ? 0 : 1 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => setIsEntering(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Send Feedback"
            className="relative z-10 mx-auto flex max-h-[88dvh] w-full max-w-[28rem] flex-col overflow-hidden rounded-t-[32px] sm:max-w-[34rem] lg:max-w-[44rem] xl:max-w-[52rem]"
            style={{
              background: 'var(--surface)',
              borderTop: '1px solid color-mix(in srgb, var(--primary) 40%, var(--border-strong))',
              borderLeft: '1px solid color-mix(in srgb, var(--border-strong) 60%, transparent)',
              borderRight: '1px solid color-mix(in srgb, var(--border-strong) 60%, transparent)',
              boxShadow: isEntering
                ? '0 -4px 20px rgba(0,0,0,0.5)'
                : '0 -8px 40px rgba(0,0,0,0.5), 0 0 60px color-mix(in srgb, var(--primary) 12%, transparent)',
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
              willChange: isEntering ? 'transform' : 'auto',
            }}
          >
            {/* Drag handle */}
            <div
              className="flex shrink-0 items-center justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none select-none"
              onPointerDown={shouldReduceMotion ? undefined : handleDragPointerDown}
              onPointerMove={shouldReduceMotion ? undefined : handleDragPointerMove}
              onPointerUp={shouldReduceMotion ? undefined : handleDragPointerUp}
              onPointerCancel={shouldReduceMotion ? undefined : handleDragPointerCancel}
            >
              <div
                className="h-1 w-9 rounded-full"
                style={{ background: 'color-mix(in srgb, var(--primary) 70%, transparent)' }}
              />
            </div>

            {/* Header */}
            {step !== 'success' && (
              <div className="flex shrink-0 items-start justify-between px-5 pt-2 pb-3">
                <div className="flex items-center gap-3 min-w-0">
                  {showBackButton && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
                      style={{
                        borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)',
                        background: 'color-mix(in srgb, var(--surface-elevated) 70%, transparent)',
                        color: 'var(--text-muted)',
                      }}
                      aria-label="Go back"
                    >
                      <ArrowLeft size={16} />
                    </button>
                  )}
                  <div className="min-w-0">
                    <h2 className="font-headline text-[1.3rem] font-bold leading-tight" style={{ color: 'var(--text)' }}>
                      {stepTitle}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { triggerHaptic('selection'); onClose(); }}
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)',
                    background: 'color-mix(in srgb, var(--surface-elevated) 70%, transparent)',
                    color: 'var(--text-muted)',
                  }}
                  aria-label="Close feedback"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Step indicator dots */}
            {showStepIndicator && (
              <div className="flex shrink-0 items-center justify-center gap-1.5 pb-3">
                {STEP_ORDER.slice(0, 3).map((s, i) => (
                  <div
                    key={s}
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: i === currentStepIdx ? 20 : 6,
                      height: 6,
                      background: i === currentStepIdx
                        ? 'var(--primary)'
                        : i < currentStepIdx
                          ? 'color-mix(in srgb, var(--primary) 45%, transparent)'
                          : 'color-mix(in srgb, var(--surface-elevated) 80%, transparent)',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Draft recovery banner */}
            <AnimatePresence>
              {draftBannerVisible && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="shrink-0 overflow-hidden"
                >
                  <div
                    className="mx-5 mb-3 flex items-center justify-between gap-3 rounded-2xl border p-3"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--secondary) 30%, transparent)',
                      background: 'color-mix(in srgb, var(--secondary) 10%, var(--surface-soft))',
                    }}
                  >
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold" style={{ color: 'var(--secondary)' }}>
                        Unfinished feedback
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Looks like you had something to say. Continue?
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={discardDraft}
                        className="rounded-xl px-2.5 py-1 text-[11px] font-semibold"
                        style={{ color: 'var(--text-subtle)', background: 'color-mix(in srgb, var(--surface-elevated) 70%, transparent)' }}
                      >
                        Discard
                      </button>
                      <button
                        type="button"
                        onClick={acceptDraft}
                        className="rounded-xl px-2.5 py-1 text-[11px] font-bold"
                        style={{ background: 'var(--secondary)', color: 'var(--text-inverse)' }}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="shrink-0 overflow-hidden"
                >
                  <div
                    className="mx-5 mb-3 flex items-center gap-2 rounded-2xl border p-3"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--error) 30%, transparent)',
                      background: 'color-mix(in srgb, var(--error) 10%, var(--surface-soft))',
                    }}
                  >
                    <AlertTriangle size={14} style={{ color: 'var(--error)', flexShrink: 0 }} />
                    <p className="text-[12px] font-medium" style={{ color: 'var(--error)' }}>
                      {error}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scroll content */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-5 pb-4 pt-1 scrollbar-hide"
              style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
            >
              {/* Step content with fade + 8px translate transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  {stepContent}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom next/action button */}
            {nextButton && (
              <div className="shrink-0 px-5 pt-2">
                {nextButton}
              </div>
            )}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
