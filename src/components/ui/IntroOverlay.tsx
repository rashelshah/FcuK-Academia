'use client';

import Lottie from 'lottie-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

import animationData from '@/assets/Scene-2.json';
import { useTheme } from '@/context/ThemeContext';

const SPLASH_DURATION_MS = 2000;
const EXIT_EASING = [0.22, 1, 0.36, 1] as const;

/**
 * Handles the Lottie logo splash only.
 * Cinematic is now triggered by CommunityPopup close → queueCinematic().
 */
export default function IntroOverlay() {
  const { showIntro, dismissIntro } = useTheme();
  const hasDismissedRef = useRef(false);

  useEffect(() => {
    if (!showIntro) {
      hasDismissedRef.current = false;
      return;
    }

    const dismissTimer = window.setTimeout(() => {
      if (hasDismissedRef.current) return;
      hasDismissedRef.current = true;
      dismissIntro();
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(dismissTimer);
  }, [dismissIntro, showIntro]);

  const handleFinish = () => {
    if (hasDismissedRef.current) return;
    hasDismissedRef.current = true;
    dismissIntro();
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
