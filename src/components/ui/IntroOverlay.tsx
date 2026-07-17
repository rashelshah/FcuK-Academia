'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { useTheme } from '@/context/ThemeContext';
import { useDashboard } from '@/hooks/useDashboard';

const EXIT_EASING = [0.22, 1, 0.36, 1] as const;

// ─── DEBUG MODE ───────────────────────────────────────────────────────────────
// Set to true to show on-screen debug overlay and disable auto-dismiss.
// Deploy this to production temporarily, test on iOS, then set back to false.
const DEBUG_MODE = true;
// ─────────────────────────────────────────────────────────────────────────────

type EventLog = { name: string; ts: number };

export default function IntroOverlay() {
  const { showIntro, dismissIntro, queueCinematic, communityPopupDone } = useTheme();
  const { loading } = useDashboard();

  const hasDismissedRef    = useRef(false);
  const startTimeRef       = useRef(Date.now());
  const animationCompleteRef = useRef(false);
  const videoRef           = useRef<HTMLVideoElement>(null);

  // Debug state
  const [debugCurrentTime, setDebugCurrentTime]   = useState(0);
  const [debugReadyState, setDebugReadyState]     = useState(-1);
  const [debugPaused, setDebugPaused]             = useState(true);
  const [debugEvents, setDebugEvents]             = useState<EventLog[]>([]);
  const [debugElapsed, setDebugElapsed]           = useState(0);
  const [isPWA, setIsPWA]                         = useState(false);

  const logEvent = (name: string) => {
    const ts = +(((Date.now() - startTimeRef.current) / 1000).toFixed(2));
    console.log(`[Splash] ${name} at +${ts}s`);
    setDebugEvents(prev => [...prev.slice(-10), { name, ts }]);
  };

  // ─── Detect PWA mode ────────────────────────────────────────────────────────
  useEffect(() => {
    const standalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    setIsPWA(standalone);
    console.log('[Splash] isPWA:', standalone);
  }, []);

  // ─── Polling: currentTime / readyState / paused every 500ms ────────────────
  useEffect(() => {
    if (!showIntro) return;
    const id = setInterval(() => {
      const v = videoRef.current;
      if (!v) return;
      const ct = +v.currentTime.toFixed(3);
      const rs = v.readyState;
      const pa = v.paused;
      console.log(`[Splash] poll — currentTime=${ct}s  readyState=${rs}  paused=${pa}`);
      setDebugCurrentTime(ct);
      setDebugReadyState(rs);
      setDebugPaused(pa);
      setDebugElapsed(+((Date.now() - startTimeRef.current) / 1000).toFixed(1));
    }, 500);
    return () => clearInterval(id);
  }, [showIntro]);

  // ─── Dismissal loop (extended to 30s in DEBUG_MODE) ────────────────────────
  useEffect(() => {
    if (!showIntro || hasDismissedRef.current) return;

    const checkAndDismiss = () => {
      if (hasDismissedRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const videoDone = animationCompleteRef.current;
      // In DEBUG_MODE use 30s timeout so we can observe full behaviour
      const timeoutMs = DEBUG_MODE ? 30000 : 10000;
      const timedOut  = elapsed >= timeoutMs;
      const dataReady = !loading;

      if ((videoDone && dataReady) || timedOut) {
        hasDismissedRef.current = true;
        console.log(`[Splash] dismiss — videoDone=${videoDone} dataReady=${dataReady} timedOut=${timedOut}`);
        dismissIntro();
      }
    };

    const interval = setInterval(checkAndDismiss, 100);
    checkAndDismiss();
    return () => clearInterval(interval);
  }, [dismissIntro, showIntro, loading]);

  // ─── Video event handlers ───────────────────────────────────────────────────
  const handleLoadStart      = () => logEvent('onLoadStart');
  const handleLoadedMetadata = () => logEvent('onLoadedMetadata');
  const handleLoadedData     = () => logEvent('onLoadedData');
  const handleCanPlay        = () => {
    logEvent('onCanPlay → play()');
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    (video as any).defaultMuted = true;
    video.play()
      .then(() => logEvent('play() resolved ✅'))
      .catch((e) => { logEvent('play() rejected ❌'); console.error('[Splash] play() error:', e); });
  };
  const handleCanPlayThrough = () => logEvent('onCanPlayThrough');
  const handlePlay           = () => { logEvent('onPlay'); setDebugPaused(false); };
  const handleEnded          = () => {
    logEvent('onEnded ✅');
    animationCompleteRef.current = true;
  };
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const err = (e.target as HTMLVideoElement).error;
    logEvent(`onError ❌ code=${err?.code}`);
    console.error('[Splash] video error:', err);
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
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black px-6"
          aria-label="Splash screen"
          onAnimationComplete={(definition) => {
            if (definition && (definition as any).y === '-100%') {
              if (communityPopupDone) queueCinematic();
            }
          }}
        >
          {/* VIDEO — scale via wrapper div, NOT directly on <video> (iOS GPU clip bug) */}
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
                onLoadedMetadata={handleLoadedMetadata}
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

          {/* ─── DEBUG OVERLAY (visible on-screen for iOS testing) ─────────── */}
          {DEBUG_MODE && (
            <div
              style={{
                position: 'fixed',
                top: 8,
                left: 8,
                right: 8,
                background: 'rgba(0,0,0,0.85)',
                border: '1px solid #0f0',
                borderRadius: 6,
                padding: '6px 8px',
                fontFamily: 'monospace',
                fontSize: 11,
                color: '#0f0',
                zIndex: 9999,
                pointerEvents: 'none',
              }}
            >
              <div style={{ color: '#ff0', fontWeight: 'bold', marginBottom: 4 }}>
                🎬 SPLASH DEBUG {isPWA ? '[PWA]' : '[BROWSER]'}
              </div>
              <div>elapsed:     {debugElapsed}s</div>
              <div style={{ color: debugCurrentTime > 0 ? '#0f0' : '#f44' }}>
                currentTime: {debugCurrentTime.toFixed(3)}s
                {debugCurrentTime > 0 ? ' ▶ ADVANCING ✅' : ' ■ STUCK at 0 ❌'}
              </div>
              <div>readyState:  {debugReadyState} ({
                ['HAVE_NOTHING','HAVE_METADATA','HAVE_CURRENT_DATA','HAVE_FUTURE_DATA','HAVE_ENOUGH_DATA'][debugReadyState] ?? '?'
              })</div>
              <div style={{ color: debugPaused ? '#f44' : '#0f0' }}>
                paused:      {debugPaused ? 'YES ❌' : 'NO ✅'}
              </div>
              <div style={{ marginTop: 4, borderTop: '1px solid #333', paddingTop: 4 }}>
                {debugEvents.length === 0 ? 'no events yet...' : debugEvents.map((e, i) => (
                  <div key={i}>+{e.ts}s {e.name}</div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
