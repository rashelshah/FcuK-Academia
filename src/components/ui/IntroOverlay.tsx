'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { useTheme } from '@/context/ThemeContext';
import { useDashboard } from '@/hooks/useDashboard';

const EXIT_EASING = [0.22, 1, 0.36, 1] as const;

/**
 * Video splash screen overlay.
 *
 * Video file: /assets/videos/splash-ios-final.mp4
 *   ✅ H.264 Constrained Baseline, Level 3.1   (iOS-required profile)
 *   ✅ 30 fps                                    (iOS blocks autoplay >30fps)
 *   ✅ No audio track                            (required for iOS autoplay)
 *   ✅ moov atom at front (faststart)            (required for streaming)
 *   ✅ yuv420p                                   (required pixel format)
 *
 * iOS autoplay rules satisfied:
 *   ✅ muted attribute + video.muted = true (programmatic)
 *   ✅ playsInline attribute
 *   ✅ autoPlay attribute as fallback hint
 *   ✅ play() called explicitly on canplay event (not in setTimeout/effect)
 *   ✅ No opacity or visibility hiding (hides error signals)
 */
export default function IntroOverlay() {
  const { showIntro, dismissIntro, queueCinematic, communityPopupDone } = useTheme();
  const { loading } = useDashboard();

  const hasDismissedRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const animationCompleteRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ─── Dismissal loop ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showIntro || hasDismissedRef.current) return;

    const checkAndDismiss = () => {
      if (hasDismissedRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      // Primary exit: video ended naturally
      const videoDone = animationCompleteRef.current;
      // Safety exit: video didn't play within 10 seconds
      const timedOut = elapsed >= 10000;
      const dataReady = !loading;

      if ((videoDone && dataReady) || timedOut) {
        hasDismissedRef.current = true;
        dismissIntro();
      }
    };

    const interval = setInterval(checkAndDismiss, 100);
    checkAndDismiss();
    return () => clearInterval(interval);
  }, [dismissIntro, showIntro, loading]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleEnded = () => {
    console.log('[Splash] onEnded — video finished');
    animationCompleteRef.current = true;
  };

  // ─── Debug event handlers (logs help diagnose iOS issues) ───────────────────
  const handleLoadStart    = () => console.log('[Splash] onLoadStart');
  const handleLoadedMeta   = () => console.log('[Splash] onLoadedMetadata');
  const handleLoadedData   = () => console.log('[Splash] onLoadedData');
  const handleCanPlay      = () => {
    console.log('[Splash] onCanPlay — calling play()');
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    (video as any).defaultMuted = true;
    video.play().then(() => {
      console.log('[Splash] play() resolved — video is playing');
    }).catch((e) => {
      console.warn('[Splash] play() rejected:', e);
    });
  };
  const handleCanPlayThrough = () => console.log('[Splash] onCanPlayThrough');
  const handlePlay           = () => console.log('[Splash] onPlay');
  const handleError          = (e: React.SyntheticEvent<HTMLVideoElement>) =>
    console.error('[Splash] onError:', (e.target as HTMLVideoElement).error);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence mode="wait">
      {showIntro ? (
        <motion.div
          key="intro-overlay"
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{
            y: '-100%',
            opacity: 1,
            transition: { duration: 0.82, ease: EXIT_EASING },
          }}
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black px-6"
          aria-label="Splash screen"
          onAnimationComplete={(definition) => {
            if (definition && (definition as any).y === '-100%') {
              if (communityPopupDone) queueCinematic();
            }
          }}
        >
          {/*
            ROOT CAUSE FIX:
            overflow-hidden on a parent + scale() on a child video = video clipped to 0px on iOS Safari.
            Fix: overflow-hidden removed from container. Scale is now on a wrapper <div>,
            NOT directly on the <video> element (which also clips video on iOS).
          */}
          <div className="flex min-h-[16rem] w-full max-w-[18rem] items-center justify-center sm:max-w-[20rem]">
            <div className="scale-125">
              <video
                ref={videoRef}
                src="/assets/videos/splash-ios-final.mp4"
                autoPlay
                muted
                playsInline
                preload="auto"
                {...{ 'webkit-playsinline': 'true' } as any}
                onLoadStart={handleLoadStart}
                onLoadedMetadata={handleLoadedMeta}
                onLoadedData={handleLoadedData}
                onCanPlay={handleCanPlay}
                onCanPlayThrough={handleCanPlayThrough}
                onPlay={handlePlay}
                onEnded={handleEnded}
                onError={handleError}
                className="h-auto w-full max-w-[16rem] sm:max-w-[18rem] object-contain"
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
