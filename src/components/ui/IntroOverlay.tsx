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

  /**
   * Called by the video element's onCanPlay synthetic event.
   * This is the ONLY reliable point on iOS to call play().
   * Calling play() from useEffect, setTimeout, or autoPlay alone is unreliable on iOS.
   */
  const handleCanPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    // Must be set programmatically — iOS ignores the HTML attribute alone
    video.muted = true;
    (video as any).defaultMuted = true;
    video.play().catch(() => {
      // If play() is rejected (e.g. aggressive policy), fall through to timeout
    });
  };

  const handleEnded = () => {
    animationCompleteRef.current = true;
  };

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
          className="fixed inset-0 z-[140] flex items-center justify-center overflow-hidden bg-black px-6"
          aria-label="Splash screen"
          onAnimationComplete={(definition) => {
            if (definition && (definition as any).y === '-100%') {
              if (communityPopupDone) queueCinematic();
            }
          }}
        >
          <div className="flex min-h-[16rem] w-full max-w-[18rem] items-center justify-center sm:max-w-[20rem]">
            {/*
              IMPORTANT — do NOT conditionally render or hide this element.
              The video must be in the DOM immediately so iOS begins buffering.
              Hiding via opacity/visibility masks iOS error signals and prevents canplay from firing.
            */}
            <video
              ref={videoRef}
              src="/assets/videos/splash-ios-final.mp4"
              autoPlay          // hint to browser; actual play() is triggered via onCanPlay
              muted             // required HTML attribute
              playsInline       // required for iOS — prevents fullscreen takeover
              preload="auto"    // tell the browser to start buffering immediately
              disablePictureInPicture
              onCanPlay={handleCanPlay}   // explicit play() call — most reliable iOS trigger
              onEnded={handleEnded}
              className="h-auto w-full max-w-[16rem] sm:max-w-[18rem] object-contain scale-125"
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
