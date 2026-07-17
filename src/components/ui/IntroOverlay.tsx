'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { useTheme } from '@/context/ThemeContext';
import { useDashboard } from '@/hooks/useDashboard';

const EXIT_EASING = [0.22, 1, 0.36, 1] as const;

/**
 * Handles the video logo splash only.
 * Cinematic is now triggered by CommunityPopup close → queueCinematic().
 *
 * iOS video compatibility requirements met by splash-ios-final.mp4:
 *  - H.264 Constrained Baseline profile, Level 3.1  ← required for all iOS versions
 *  - 30 fps                                          ← required (60fps rejected on iOS)
 *  - No audio track                                  ← required for autoplay
 *  - moov atom at start (faststart)                  ← required for streaming
 *  - yuv420p pixel format                            ← required
 */
export default function IntroOverlay() {
  const { showIntro, dismissIntro, queueCinematic, communityPopupDone } = useTheme();
  const { loading } = useDashboard();
  const hasDismissedRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const animationCompleteRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);

  // Small mount delay so the video element gets a fully-painted DOM before play()
  useEffect(() => {
    if (!showIntro) return;
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, [showIntro]);

  // As soon as the video element is in the DOM, try to play
  useEffect(() => {
    if (!mounted || !videoRef.current) return;

    const video = videoRef.current;

    // These must be set programmatically for iOS to trust the muted state
    video.muted = true;
    (video as any).defaultMuted = true;

    // Directly attempt play — video element already has muted + playsInline + no audio
    const tryPlay = () => {
      const p = video.play();
      if (p) {
        p.catch(() => {
          // Autoplay fully blocked (e.g. strict browser policy) — dismiss after a short pause
          setTimeout(() => { animationCompleteRef.current = true; }, 500);
        });
      }
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('loadeddata', tryPlay, { once: true });
      return () => video.removeEventListener('loadeddata', tryPlay);
    }
  }, [mounted]);

  // Synchronize dismissal with data loading
  useEffect(() => {
    if (!showIntro || hasDismissedRef.current) return;

    const checkAndDismiss = () => {
      if (hasDismissedRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const animationDone = animationCompleteRef.current || elapsed >= 10000;
      const dataReady = !loading;
      const timedOut = elapsed >= 12000;

      if (animationDone && (dataReady || timedOut)) {
        hasDismissedRef.current = true;
        dismissIntro();
      }
    };

    const interval = setInterval(checkAndDismiss, 100);
    checkAndDismiss();
    return () => clearInterval(interval);
  }, [dismissIntro, showIntro, loading]);

  const handleFinish = () => {
    animationCompleteRef.current = true;
  };

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
              if (communityPopupDone) {
                queueCinematic();
              }
            }
          }}
        >
          <div className="flex min-h-[16rem] w-full max-w-[18rem] items-center justify-center sm:max-w-[20rem]">
            {mounted && (
              <video
                ref={videoRef}
                src="/assets/videos/splash-ios-final.mp4"
                muted
                playsInline
                autoPlay
                preload="auto"
                onEnded={handleFinish}
                className="h-auto w-full max-w-[16rem] sm:max-w-[18rem] object-contain scale-125"
              />
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
