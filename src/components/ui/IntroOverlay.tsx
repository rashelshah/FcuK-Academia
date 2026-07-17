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
 * iOS Safari compatibility strategy:
 * - We do NOT use the `autoPlay` attribute. Instead we call `video.play()`
 *   manually inside the `onCanPlay` React handler. This guarantees play() is
 *   called only after the browser has buffered the first frame (critical on iOS).
 * - `muted` + `playsInline` + no audio track = iOS autoplay allowed.
 * - The video uses `opacity-0 → opacity-100` so the black background is never
 *   visible while the video is buffering.
 * - The video file has been processed with `-movflags faststart` so iOS can
 *   begin playback before the full file is downloaded.
 */
export default function IntroOverlay() {
  const { showIntro, dismissIntro, queueCinematic, communityPopupDone } = useTheme();
  const { loading } = useDashboard();
  const [videoVisible, setVideoVisible] = useState(false);
  const hasDismissedRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const animationCompleteRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Called by the React onCanPlay handler — the safest, earliest point to play on iOS
  const handleCanPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    // Must be set programmatically (not just via attribute) for iOS to trust it
    video.muted = true;
    (video as any).defaultMuted = true;

    const promise = video.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          // Video is actually playing — show it
          setVideoVisible(true);
        })
        .catch((err) => {
          console.warn('[IntroOverlay] play() rejected:', err);
          // Still show the video element (it may show a poster/first frame)
          setVideoVisible(true);
          // Do NOT call handleFinish here — let the timeout dismiss gracefully
        });
    } else {
      // Older browsers — play() returned undefined (synchronous, already playing)
      setVideoVisible(true);
    }
  };

  // Synchronize dismissal with data loading
  useEffect(() => {
    if (!showIntro || hasDismissedRef.current) return;

    const checkAndDismiss = () => {
      if (hasDismissedRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      // Wait for the video to finish playing naturally (fallback after 10s)
      const animationDone = animationCompleteRef.current || elapsed >= 10000;
      const dataReady = !loading;
      // Hard timeout — user is never stuck
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
              Video is always mounted so iOS starts buffering immediately.
              opacity-0 hides the black frame until the video has actually started playing.
              We do NOT use autoPlay — we call play() manually in onCanPlay.
            */}
            <video
              ref={videoRef}
              src="/assets/videos/new-splash-animation.mp4"
              muted
              playsInline
              preload="auto"
              onCanPlay={handleCanPlay}
              onEnded={handleFinish}
              className={`h-auto w-full max-w-[16rem] sm:max-w-[18rem] object-contain scale-125 transition-opacity duration-300 ${
                videoVisible ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
