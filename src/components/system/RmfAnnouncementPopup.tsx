'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Star, MessageCircle, Pencil, Smile } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { featureFlags } from '@/config/features';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

const LOCAL_STORAGE_KEY = 'rmf_announcement_last_seen';
const RMF_LOGOS_PATH = '/images/rmf';

// Configurable timing
const INITIAL_DELAY_MS = 2500; // Wait 2.5s before showing popup to not block initial render

export default function RmfAnnouncementPopup() {
  const { isAnnouncementActive, setIsAnnouncementActive } = useAppState();
  const { themeConfig } = useTheme();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // 1. Feature Flag Check
    if (!featureFlags.rmfAnnouncement.enabled) return;

    // 2. Cooldown Check (Bypassed in development)
    const checkCooldown = () => {
      if (process.env.NODE_ENV === 'development') return true;
      try {
        const lastSeenStr = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!lastSeenStr) return true;
        const lastSeen = parseInt(lastSeenStr, 10);
        const cooldownMs = featureFlags.rmfAnnouncement.cooldownHours * 60 * 60 * 1000;
        return Date.now() - lastSeen > cooldownMs;
      } catch (e) {
        return true; // Fallback if localStorage is inaccessible
      }
    };

    if (!checkCooldown()) return;

    // 3. Trigger Timing
    const timer = setTimeout(() => {
      setShouldRender(true);
      setIsAnnouncementActive(true);
    }, INITIAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [setIsAnnouncementActive]);

  const handleDismiss = () => {
    setIsAnnouncementActive(false); // Clear world state immediately
    setIsClosing(true);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, Date.now().toString());
    } catch (e) {
      // Ignore localStorage errors
    }

    // Give animation time to complete before unmounting
    setTimeout(() => {
      setShouldRender(false);
    }, 300);
  };

  const handleExplore = () => {
    setIsAnnouncementActive(false); // Update global state immediately
    setIsClosing(true); // Trigger exit animation
    
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, Date.now().toString());
    } catch (e) {}

    // Brief delay to allow the exit animation to start before the page transition
    setTimeout(() => {
      router.push('/rate-my-faculty');
    }, 150);
  };

  if (!shouldRender) return null;

  // Variants for staggered animations
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const popVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', damping: 20, stiffness: 200 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  const floatVariants: Variants = {
    animate: {
      y: [0, -10, 0],
      rotate: [-5, 5, -5],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // We are using simulated 3D elements since raw 3D assets weren't provided in repo
  return (
    <AnimatePresence mode="wait">
      {!isClosing && (
        <motion.div
          key="rmf-announcement-backdrop"
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[55] flex flex-col items-center justify-center p-4 sm:p-6 shadow-2xl"
        >
          {/* 
              Standard Backdrop:
              Dimmed background without the spotlight mask as requested.
          */}
          <div
            className="absolute inset-0 z-0 pointer-events-none bg-black/80 backdrop-blur-md"
          />

          {/* Main Content Container */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 flex flex-col items-center justify-center w-full max-w-[340px] sm:max-w-[400px] gap-6"
          >

            {/* The Main Card */}
            <motion.div
              variants={popVariants}
              className="relative w-full overflow-hidden rounded-[24px] border sm:rounded-[32px] isolate"
              style={{
                background: 'linear-gradient(145deg, color-mix(in srgb, var(--surface) 80%, transparent) 0%, color-mix(in srgb, var(--surface-highlight) 60%, transparent) 100%)',
                borderColor: 'color-mix(in srgb, var(--border-strong) 40%, rgba(255,255,255,0.1))',
                boxShadow: `0 24px 60px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1), ${themeConfig.glow.primary}`,
                backdropFilter: 'blur(20px)'
              }}
            >
              {/* Background ambient glow inside card */}
              <div
                className="absolute inset-0 z-0 opacity-40 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 50% -20%, var(--primary-soft) 0%, transparent 60%)',
                }}
              />
              <div
                className="absolute w-[200%] aspect-square -top-[50%] -left-[50%] z-0 opacity-10 pointer-events-none mix-blend-overlay animate-[spin_60s_linear_infinite]"
                style={{
                  backgroundImage: 'radial-gradient(circle at center, transparent 30%, var(--text) 30.5%, var(--text) 31%, transparent 31.5%)',
                  backgroundSize: '10px 10px'
                }}
              />

              {/* Floating Pill Header: Compact Universal Obsidian Glass */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2 sm:gap-4 px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-full overflow-hidden border backdrop-blur-3xl shrink-0"
                style={{
                  background: 'rgba(10, 10, 10, 0.75)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 0 1px 1px rgba(255,255,255,0.05)',
                  maxWidth: 'calc(100% - 32px)', // Prevents pill from cutting out of card
                  width: 'max-content'
                }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_infinite]" />

                {/* Fcuk Academia Logo Container - Dramatically scaled visually without expanding pill layout */}
                <div className="relative w-[110px] h-[32px] sm:w-[130px] sm:h-[40px] flex items-center justify-center shrink-0">
                  <Image
                    src={`${RMF_LOGOS_PATH}/fcuk-logo.png`}
                    alt="Fcuk Academia"
                    fill
                    className="object-contain scale-[1.7]" 
                    priority
                    unoptimized
                  />
                </div>

                <X size={10} className="text-white/20 shrink-0 mx-0.5" />

                {/* RateMyFaculty Logo Container */}
                <div className="relative w-[110px] h-[32px] sm:w-[130px] sm:h-[40px] flex items-center justify-center shrink-0">
                  <Image
                    src={`${RMF_LOGOS_PATH}/rmf-logo.png`}
                    alt="RateMyFaculty"
                    fill
                    className="object-contain"
                    priority
                    unoptimized
                  />
                </div>
              </motion.div>

              <div className="relative z-10 flex flex-col items-center justify-center pt-20 px-6 pb-8 sm:pt-24 sm:px-8 sm:pb-10 min-h-[360px] sm:min-h-[420px] text-center">

                {/* 3D Representation Avatar Context */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-8 z-10">
                  {/* Central Avatar Focus Circle */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                    className="absolute inset-0 rounded-full border border-white/10 shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center backdrop-blur-sm overflow-hidden"
                  >
                    <div className="relative w-full h-full">
                      <Image 
                        src={`${RMF_LOGOS_PATH}/hero.png`} 
                        alt="Faculty Collaboration" 
                        fill 
                        className="object-cover" 
                        priority
                      />
                    </div>
                  </motion.div>

                  {/* Floating elements mimicking the stitched design - Spread out to clear the avatar and header */}
                  <motion.div variants={floatVariants} animate="animate" className="absolute -left-12 top-2 bg-[var(--surface-highlight)] border border-white/10 rounded-xl px-2 py-1 flex shadow-lg backdrop-blur-md z-20 tooltip-bubble">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <Star size={12} className="text-yellow-400/30" />
                  </motion.div>

                  <motion.div variants={floatVariants} animate="animate" transition={{ delay: 0.5 }} className="absolute -right-16 top-12 bg-[var(--surface-highlight)] border border-white/10 rounded-2xl px-3 py-2 shadow-lg backdrop-blur-md z-20 max-w-[120px]">
                    <p className="text-[9px] sm:text-[10px] font-bold text-left text-[var(--text)]">Helpful insights.</p>
                    <div className="absolute top-1/2 -left-1 w-2 h-2 bg-[var(--surface-highlight)] rotate-45 border-l border-b border-white/10" />
                  </motion.div>

                  <motion.div variants={floatVariants} animate="animate" transition={{ delay: 1 }} className="absolute -left-16 bottom-10 bg-[var(--surface-highlight)] border border-white/10 rounded-2xl px-3 py-2 shadow-lg backdrop-blur-md z-20 max-w-[120px]">
                    <p className="text-[9px] sm:text-[10px] font-bold text-left text-[var(--text)]">Great feedback!</p>
                    <div className="mt-1 flex gap-1"><div className="h-1 w-8 bg-white/20 rounded-full" /><div className="h-1 w-4 bg-white/20 rounded-full" /></div>
                    <div className="absolute top-1/2 -right-1 w-2 h-2 bg-[var(--surface-highlight)] rotate-45 border-t border-r border-white/10" />
                  </motion.div>

                  {/* Aesthetic Floating Bubbles */}
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 10, delay: 0.8 }}
                    className="absolute -right-8 -bottom-4 w-8 h-8 rounded-full bg-orange-500/20 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-xl"
                  >
                    <Pencil size={12} className="text-orange-300" />
                  </motion.div>
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 10, delay: 1 }}
                    className="absolute left-4 -bottom-10 w-6 h-6 rounded-full bg-yellow-500/20 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-xl"
                  >
                    <Smile size={10} className="text-yellow-300" />
                  </motion.div>

                </div>

                {/* Typography */}
                <motion.div variants={popVariants}>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-serif mb-2 text-[var(--text)]">
                    Rate. Reveal. Repeat.
                  </h2>
                  <p className="text-xs sm:text-sm text-on-surface-variant font-medium opacity-80 mb-8 max-w-[240px] mx-auto">
                    Anonymous reviews. Real insights.
                  </p>
                </motion.div>

                {/* Main CTA */}
                <motion.button
                  variants={popVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExplore}
                  className="relative group w-full py-3 sm:py-3.5 rounded-full font-bold text-[var(--background)] bg-[var(--primary)] overflow-hidden isolate"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out z-0" />
                  <span className="relative z-10 text-sm tracking-wide">Explore Now</span>

                  {/* Outer pulse effect rings matching the Stitch design */}
                  <div className="absolute inset-0 rounded-full border-[1.5px] border-[var(--primary)] scale-110 opacity-30 animate-ping !duration-[3s]" />
                  <div className="absolute inset-0 rounded-full border border-[var(--primary)] scale-125 opacity-10 animate-ping !duration-[3s] !delay-500" />
                </motion.button>

              </div>
            </motion.div>

            {/* Bottom Floating Elements - Background Stars */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.4 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="absolute top-1/4 -left-12 sm:-left-20 w-12 h-12 blur-[2px] opacity-40 z-0 select-none pointer-events-none"
            >
              <Star className="w-full h-full text-yellow-300 fill-yellow-300" />
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="absolute bottom-1/4 -right-10 sm:-right-16 w-16 h-16 blur-[3px] opacity-30 z-0 select-none pointer-events-none"
            >
              <Star className="w-full h-full text-[var(--primary)] fill-[var(--primary)]" />
            </motion.div>

            {/* Close Button Minimalist Circle outside the card */}
            <motion.button
              variants={popVariants}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDismiss}
              className="relative z-10 w-10 h-10 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white mt-4 transition-colors"
            >
              <X size={16} />
            </motion.button>
          </motion.div>

          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes shimmer {
                100% {
                  transform: translateX(100%);
                }
              }
            `
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
