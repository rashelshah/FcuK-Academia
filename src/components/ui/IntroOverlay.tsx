'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { useTheme } from '@/context/ThemeContext';
import { useDashboard } from '@/hooks/useDashboard';

const EXIT_EASING = [0.22, 1, 0.36, 1] as const;

/**
 * Handles the video logo splash only.
 * Cinematic is now triggered by CommunityPopup close → queueCinematic().
 */
export default function IntroOverlay() {
  const { showIntro, dismissIntro, queueCinematic, communityPopupDone } = useTheme();
  const { loading } = useDashboard();
  const [canRenderVideo, setCanRenderVideo] = useState(false);
  const hasDismissedRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const animationCompleteRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Delay video rendering until after initial mount and a brief buffer
  useEffect(() => {
    if (!showIntro) return;

    // 150ms is usually enough to clear the hydration/initial-paint CPU spike
    const timer = setTimeout(() => {
      setCanRenderVideo(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [showIntro]);

  // iOS-safe explicit play: wait for the video to be loaded before calling play().
  // Calling play() before loadeddata fires is the #1 cause of black screens on iOS Safari.
  useEffect(() => {
    if (!canRenderVideo || !videoRef.current) return;

    const video = videoRef.current;
    // These must be set programmatically for iOS to accept autoplay
    video.defaultMuted = true;
    video.muted = true;

    const attemptPlay = () => {
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch((err) => {
          // Log but do NOT call handleFinish here.
          // Let the 10-second timeout in the dismiss loop handle the fallback
          // so the user doesn't see a blank black screen immediately.
          console.warn('[IntroOverlay] Autoplay blocked (possibly Low Power Mode):', err);
        });
      }
    };

    // readyState >= 2 means HAVE_CURRENT_DATA — enough data to play at least one frame
    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      // Wait until iOS has buffered enough data before trying to play
      video.addEventListener('loadeddata', attemptPlay, { once: true });
      return () => video.removeEventListener('loadeddata', attemptPlay);
    }
  }, [canRenderVideo]);

  // Synchronize dismissal with data loading
  useEffect(() => {
    if (!showIntro || hasDismissedRef.current) return;

    const checkAndDismiss = () => {
      if (hasDismissedRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      // Wait for the video to finish playing naturally (or fallback after 10s if it fails to play)
      const animationDone = animationCompleteRef.current || elapsed >= 10000;
      const dataReady = !loading;
      // Hard timeout so user is never permanently stuck
      const timedOut = elapsed >= 12000;

      if (animationDone && (dataReady || timedOut)) {
        hasDismissedRef.current = true;
        dismissIntro();
      }
    };

    // Check periodically or whenever loading changes
    const interval = setInterval(checkAndDismiss, 100);
    checkAndDismiss(); // Initial check

    return () => clearInterval(interval);
  }, [dismissIntro, showIntro, loading]);

  const handleFinish = () => {
    animationCompleteRef.current = true;
    // The useEffect will handle actual dismissal
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
            // Signal that we are fully exited so Cinematic or Community can take over
            if (definition && (definition as any).y === '-100%') {
              // If community popup is already done (seen/skipped), start cinematic now.
              // Otherwise, CommunityPopup will take over and call queueCinematic later.
              if (communityPopupDone) {
                queueCinematic();
              }
            }
          }}
        >
          <div className="flex min-h-[16rem] w-full max-w-[18rem] items-center justify-center sm:max-w-[20rem]">
            {canRenderVideo && (
              <video
                ref={videoRef}
                src="/assets/videos/new-splash-animation.mp4"
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={handleFinish}
                // NOTE: onError is intentionally omitted — we let the 10s timeout
                // handle fallback so a transient load error doesn't skip the splash instantly.
                className="h-auto w-full max-w-[16rem] sm:max-w-[18rem] object-contain scale-125"
              />
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
