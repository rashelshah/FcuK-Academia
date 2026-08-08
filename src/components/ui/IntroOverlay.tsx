'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

import { useTheme } from '@/context/ThemeContext';
import { useDashboard } from '@/hooks/useDashboard';

const EXIT_EASING = [0.22, 1, 0.36, 1] as const;

export default function IntroOverlay() {
  const { showIntro, dismissIntro, queueCinematic, communityPopupDone } = useTheme();
  const { loading } = useDashboard();
  const pathname = usePathname();

  const hasDismissedRef    = useRef(false);
  const startTimeRef       = useRef(Date.now());
  const animationCompleteRef = useRef(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    if (showIntro) {
      const fetchAnimation = async () => {
        const url = '/assets/videos/latest-animation.json';
        try {
          if ('caches' in window) {
            const cache = await caches.open('splash-animation-cache');
            const cachedRes = await cache.match(url);
            if (cachedRes) {
              const data = await cachedRes.json();
              setAnimationData(data);
              // Optionally trigger a background fetch to update the cache
              // fetch(url).then(res => { if (res.ok) cache.put(url, res); }).catch(() => {});
              return;
            }
            
            const res = await fetch(url);
            if (res.ok) {
              cache.put(url, res.clone());
              const data = await res.json();
              setAnimationData(data);
            } else {
              throw new Error('Network response not ok');
            }
          } else {
            // Fallback if Cache API is not supported
            const res = await fetch(url);
            const data = await res.json();
            setAnimationData(data);
          }
        } catch (err) {
          console.error('[Splash] Failed to load Lottie JSON', err);
          animationCompleteRef.current = true;
        }
      };

      fetchAnimation();
    }
  }, [showIntro]);

  // ─── Dismissal loop ────────────────────────
  useEffect(() => {
    if (!showIntro || hasDismissedRef.current) return;

    const checkAndDismiss = () => {
      if (hasDismissedRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const videoDone = animationCompleteRef.current;
      // 10s fallback timeout
      const timeoutMs = 10000;
      const timedOut  = elapsed >= timeoutMs;
      // If on login screen, we don't need to wait for dashboard data
      const dataReady = pathname === '/login' ? true : !loading;

      if ((videoDone && dataReady) || timedOut) {
        hasDismissedRef.current = true;
        dismissIntro();
      }
    };

    const interval = setInterval(checkAndDismiss, 100);
    checkAndDismiss();
    return () => clearInterval(interval);
  }, [dismissIntro, showIntro, loading, pathname]);

  const handleEnded = () => {
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
            transition: { duration: 0.5, ease: EXIT_EASING },
          }}
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black px-6"
          aria-label="Splash screen"
          onAnimationComplete={(definition) => {
            if (definition && (definition as any).y === '-100%') {
              if (communityPopupDone) queueCinematic();
            }
          }}
        >
          {/* LOTTIE — scale via wrapper div */}
          <div className="flex w-full items-center justify-center overflow-visible">
            <div className="w-full max-w-md mx-auto md:max-w-lg lg:max-w-xl">
              {animationData ? (
                <Lottie
                  lottieRef={lottieRef}
                  animationData={animationData}
                  loop={false}
                  onComplete={handleEnded}
                  className="h-auto w-full object-contain"
                />
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
