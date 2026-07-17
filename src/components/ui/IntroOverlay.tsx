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

  // Attempt to explicitly play video for iOS and handle failures (e.g. Low Power Mode)
  useEffect(() => {
    if (canRenderVideo && videoRef.current) {
      const video = videoRef.current;
      video.defaultMuted = true;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn('Autoplay prevented on iOS:', e);
          handleFinish(); // Skip splash screen so user isn't stuck
        });
      }
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
      // Allow extra time for data to load, with a max timeout
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
                src="/assets/videos/splash-animation.mp4" /* Replace this path with your actual .mp4 path */
                autoPlay
                muted
                playsInline
                preload="auto"
                onEnded={handleFinish}
                onError={handleFinish}
                className="h-auto w-full max-w-[16rem] sm:max-w-[18rem] object-contain scale-125"
              />
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
