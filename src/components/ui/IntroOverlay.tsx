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
 * iOS Safari notes:
 * - The <video> is always mounted (not conditionally rendered) so the browser
 *   starts downloading it as early as possible. We just keep it opacity-0 until
 *   canplay fires so there's no black frame visible.
 * - We call play() inside the canplay handler, not in a setTimeout, so iOS is
 *   guaranteed to have buffered at least one frame before we ask it to play.
 * - onError is deliberately NOT wired to handleFinish so a transient network
 *   hiccup never causes an instant black-screen skip.
 */
export default function IntroOverlay() {
  const { showIntro, dismissIntro, queueCinematic, communityPopupDone } = useTheme();
  const { loading } = useDashboard();
  const [videoReady, setVideoReady] = useState(false);
  const hasDismissedRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const animationCompleteRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Start playback as soon as iOS says the video is playable.
  // This runs once when showIntro becomes true (component mounts with showIntro=true).
  useEffect(() => {
    if (!showIntro || !videoRef.current) return;

    const video = videoRef.current;
    // Must set these programmatically for iOS to allow autoplay
    video.defaultMuted = true;
    video.muted = true;

    const onCanPlay = () => {
      setVideoReady(true);
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch((err) => {
          // Log only — do NOT dismiss here. The 10s timeout handles fallback.
          console.warn('[IntroOverlay] iOS autoplay blocked:', err);
        });
      }
    };

    // readyState >= 3 means HAVE_FUTURE_DATA — enough to play without immediately stalling
    if (video.readyState >= 3) {
      onCanPlay();
    } else {
      // canplay fires earlier than loadeddata and is the right signal for iOS
      video.addEventListener('canplay', onCanPlay, { once: true });
      return () => video.removeEventListener('canplay', onCanPlay);
    }
  }, [showIntro]);

  // Synchronize dismissal with data loading
  useEffect(() => {
    if (!showIntro || hasDismissedRef.current) return;

    const checkAndDismiss = () => {
      if (hasDismissedRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      // Wait for the video to finish playing naturally (or fallback after 10s)
      const animationDone = animationCompleteRef.current || elapsed >= 10000;
      const dataReady = !loading;
      // Hard timeout so user is never permanently stuck on black screen
      const timedOut = elapsed >= 12000;

      if (animationDone && (dataReady || timedOut)) {
        hasDismissedRef.current = true;
        dismissIntro();
      }
    };

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
            if (definition && (definition as any).y === '-100%') {
              if (communityPopupDone) {
                queueCinematic();
              }
            }
          }}
        >
          <div className="flex min-h-[16rem] w-full max-w-[18rem] items-center justify-center sm:max-w-[20rem]">
            {/*
              The video is always in the DOM (not conditionally rendered) so iOS
              begins buffering it immediately. We fade it in once canplay fires.
            */}
            <video
              ref={videoRef}
              src="/assets/videos/new-splash-animation.mp4"
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={handleFinish}
              className={`h-auto w-full max-w-[16rem] sm:max-w-[18rem] object-contain scale-125 transition-opacity duration-300 ${
                videoReady ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
