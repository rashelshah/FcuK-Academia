"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Maximize2, Minimize2, Play } from "lucide-react";
import { usePathname } from "next/navigation";
import { activeAnnouncement } from "@/config/announcements";

export default function FloatingAnnouncement() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // default true to prevent hydration mismatch
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    // Feature flag check
    if (process.env.NEXT_PUBLIC_ENABLE_FLOATING_ANNOUNCEMENT_VIDEO !== 'true') return;
    if (!activeAnnouncement) return;

    // Check localStorage (bypass in development so we can always test it)
    const isDev = process.env.NODE_ENV === 'development';
    const seenVersion = localStorage.getItem('fcuk_seenAnnouncement');
    if (seenVersion === activeAnnouncement.version && !isDev) {
       return;
    }

    setIsDismissed(false);

    // Initial delay so it doesn't fight loading screens (1200 - 1800ms)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Pause playback when tab hidden or app backgrounded
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!videoRef.current) return;
      if (document.hidden) {
        videoRef.current.pause();
      } else if (activeAnnouncement?.autoPlay && !isDismissed) {
        // Only resume if autoPlay is enabled and it hasn't been dismissed
        videoRef.current.play().catch(() => setHasError(true));
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isDismissed]);
  
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  if (!isMounted) return null;
  if (!activeAnnouncement) return null;
  if (pathname?.startsWith('/login') || pathname?.startsWith('/onboarding') || pathname?.startsWith('/wrap')) return null;
  if (isDismissed && !isVisible) return null;

  const handleDismiss = () => {
    if (activeAnnouncement) {
      localStorage.setItem('fcuk_seenAnnouncement', activeAnnouncement.version);
    }
    setIsVisible(false);
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  const springConfig = {
    type: "spring" as const,
    stiffness: 280,
    damping: 28,
    mass: 0.8
  };

  // Entry / Exit motion
  const floatingVariants = {
    hidden: { 
      y: '120%', 
      x: '30%', 
      opacity: 0, 
      scale: 0.9 
    },
    visible: { 
      y: 0, 
      x: 0, 
      opacity: 1, 
      scale: 1,
      transition: shouldReduceMotion ? { duration: 0.3 } : springConfig
    },
    exit: { 
      y: '120%', 
      x: '30%', 
      opacity: 0, 
      scale: 0.96,
      transition: shouldReduceMotion ? { duration: 0.3 } : springConfig
    }
  };
  
  // Breathing animation when idle
  const idleAnimation = isExpanded || shouldReduceMotion ? {} : {
    scale: [1, 1.015, 1],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: "loop" as const,
      ease: "easeInOut" as const,
      delay: 2 // Start after entry
    }
  };

  return (
    <AnimatePresence onExitComplete={() => setIsDismissed(true)}>
      {isVisible && (
        <>
          {/* Backdrop for expanded state */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-sm"
                onClick={() => setIsExpanded(false)}
              />
            )}
          </AnimatePresence>

          <div 
            className={`fixed z-[9999] pointer-events-none ${
              isExpanded ? 'inset-0 flex items-center justify-center md:p-4' : 'bottom-6 right-6 md:bottom-8 md:right-8'
            }`}
          >
            <motion.div
              layout // Shared layout animation magic
              initial="hidden"
              animate={["visible", "idle"]}
              exit="exit"
              variants={{...floatingVariants, idle: idleAnimation}}
              whileHover={!isExpanded && !shouldReduceMotion ? { y: -4, scale: 1.02 } : {}}
              whileTap={!isExpanded && !shouldReduceMotion ? { scale: 0.98 } : {}}
              className={`
                relative overflow-hidden group pointer-events-auto cursor-pointer
                bg-[#141414e0] backdrop-blur-[20px] 
                border border-white/10 
                shadow-[0_20px_80px_rgba(0,0,0,0.35)]
                ${isExpanded 
                  ? 'w-full h-[100dvh] rounded-none md:w-[80vw] md:max-w-[700px] md:h-[85vh] md:rounded-[24px]' 
                  : 'w-[220px] md:w-[320px] aspect-[4/5] rounded-[24px]'}
              `}
              onClick={() => !isExpanded && setIsExpanded(true)}
            >
              {/* Video Element */}
              <div className="absolute inset-0 w-full h-full bg-black pointer-events-none">
                 {/* Video fallback to thumbnail */}
                 {!hasError ? (
                    <video
                      ref={videoRef}
                      src={activeAnnouncement.video}
                      poster={activeAnnouncement.thumbnail}
                      autoPlay={activeAnnouncement.autoPlay}
                      muted
                      loop
                      playsInline
                      className={`w-full h-full transition-all duration-300 ${isExpanded ? 'object-contain' : 'object-cover'}`}
                      onError={() => setHasError(true)}
                    />
                 ) : (
                    <div className="w-full h-full relative">
                      <img 
                        src={activeAnnouncement.thumbnail} 
                        alt={activeAnnouncement.title}
                        className={`w-full h-full transition-all duration-300 ${isExpanded ? 'object-contain' : 'object-cover'}`}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                         <Play className="w-12 h-12 text-white/80" />
                      </div>
                    </div>
                 )}
              </div>

              {/* Controls */}
              <div className="absolute top-3 right-3 flex gap-2 z-20">
                {activeAnnouncement.dismissible && (
                  <button
                    onClick={handleDismiss}
                    className="p-1.5 md:p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 backdrop-blur-md transition-all md:opacity-0 md:group-hover:opacity-100 shadow-sm"
                    aria-label="Close announcement"
                  >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                )}
              </div>

              <div className="absolute bottom-3 right-3 flex gap-2 z-20">
                  <button
                    onClick={toggleExpand}
                    className="p-1.5 md:p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 backdrop-blur-md transition-all md:opacity-0 md:group-hover:opacity-100 shadow-sm"
                    aria-label={isExpanded ? "Minimize announcement" : "Expand announcement"}
                  >
                    {isExpanded ? <Minimize2 className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />}
                  </button>
              </div>
              
              {/* Content overlay */}
              <motion.div 
                layout
                className={`absolute right-12 text-white z-10 pointer-events-none flex flex-col justify-end ${
                  isExpanded ? 'bottom-8 left-6 md:bottom-6 md:left-6' : 'bottom-4 left-4'
                }`}
              >
                <h3 className={`font-bold leading-tight drop-shadow-md ${
                  isExpanded ? 'text-lg md:text-2xl mb-2' : 'text-sm md:text-base mb-1'
                }`}>
                  {activeAnnouncement.title}
                </h3>
                {isExpanded && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className="text-xs md:text-sm text-white/90 line-clamp-3 md:line-clamp-4 max-w-[95%] drop-shadow-sm mt-1"
                  >
                    {activeAnnouncement.description}
                  </motion.p>
                )}
              </motion.div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
