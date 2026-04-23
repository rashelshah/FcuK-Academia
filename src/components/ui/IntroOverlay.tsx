'use client';

import Lottie from 'lottie-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

import animationData from '@/assets/Scene-2.json';
import { useTheme } from '@/context/ThemeContext';
import { useDashboard } from '@/hooks/useDashboard';

const SPLASH_DURATION_MS = 2000;
const MAX_EXTRA_WAIT_MS = 1500; // Max extra time to wait for data after animation
const EXIT_EASING = [0.22, 1, 0.36, 1] as const;

/**
 * Handles the Lottie logo splash only.
 * Cinematic is now triggered by CommunityPopup close → queueCinematic().
 */
export default function IntroOverlay() {
  const { showIntro, dismissIntro, queueCinematic, communityPopupDone } = useTheme();
  const { loading } = useDashboard();
  const hasDismissedRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const animationCompleteRef = useRef(false);

  // Synchronize dismissal with data loading
  useEffect(() => {
    if (!showIntro || hasDismissedRef.current) return;

    const checkAndDismiss = () => {
      if (hasDismissedRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const animationDone = elapsed >= SPLASH_DURATION_MS || animationCompleteRef.current;
      const dataReady = !loading;
      const timedOut = elapsed >= SPLASH_DURATION_MS + MAX_EXTRA_WAIT_MS;

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
          <div className="flex w-full max-w-[18rem] items-center justify-center sm:max-w-[20rem]">
            <Lottie
              animationData={animationData}
              loop={false}
              autoplay
              onComplete={handleFinish}
              className="h-auto w-full max-w-[16rem] sm:max-w-[18rem]"
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
