'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function InstallGate({ children }: { children: React.ReactNode }) {
  const [shouldShowGate, setShouldShowGate] = useState(false);
  const [os, setOs] = useState<'ios' | 'android' | 'other'>('other');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. DEVICE DETECTION (Detect mobile devices)
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileString = /iphone|ipad|ipod|android/i.test(userAgent);

    if (/iphone|ipad|ipod/i.test(userAgent)) setOs('ios');
    else if (/android/i.test(userAgent)) setOs('android');

    // 2. INSTALL DETECTION
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-ignore
      window.navigator.standalone === true;

    // 6. DEVELOPMENT SAFETY
    const isDev = window.location.hostname === "localhost";

    const forceGate = false;

    // 3. FINAL CONDITION
    // Only show gate if it is a Mobile Browser, not installed, and not dev
    const gateVisible =
      forceGate || (isMobileString && !isStandalone && !isDev);
    setShouldShowGate(gateVisible);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch

  if (!shouldShowGate) {
    return <>{children}</>;
  }

  const isIOS = os === 'ios';

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-white flex flex-col justify-between items-center overflow-hidden font-body selection:bg-[#B6FF3B] selection:text-black touch-none">

      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#B6FF3B]/10 via-black to-black opacity-80 pointer-events-none"></div>

      {/* Moving Spotlight */}
      <motion.div
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -50, 50, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#B6FF3B]/10 to-transparent blur-[120px] pointer-events-none"
      />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.1] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#B6FF3B 1px, transparent 1px), linear-gradient(90deg, #B6FF3B 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
        }}
      ></div>

      {/* Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[50]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-[0.05]"></div>
        <motion.div
          animate={{ y: ['-100%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-full h-[10vh] bg-gradient-to-b from-transparent via-[#B6FF3B]/10 to-transparent opacity-30"
        />
      </div>

      {/* Faded Background Text */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.03 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
      >
        <span className="text-[50vh] font-bold tracking-tighter leading-none" style={{ fontFamily: 'var(--font-headline)' }}>04</span>
      </motion.div>

      {/* TOP BAR */}
      <div className="w-full flex justify-between items-center px-6 py-8 z-10">
        <div className="flex items-center">
          <div className="relative">
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-x-0 bottom-0 h-[2px] bg-[#B6FF3B]/50 blur-sm"
            />
            <img
              src="/android-chrome-192x192.png"
              alt="FcuK Academia"
              className="w-28 h-auto relative overflow-visible mix-blend-screen"
            />
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[9px] font-bold tracking-[0.2em] text-[#B6FF3B] uppercase">
            system_locked
          </span>
          <span className="text-[8px] font-medium tracking-widest text-white/40 uppercase">
            limited mode
          </span>
        </div>
      </div>

      {/* CENTER CONTENT */}
      <div className="flex flex-col items-center justify-center flex-1 w-full px-6 z-10 -mt-10">

        {/* Dynamic Status Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10 flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-full pl-2 pr-4 py-1.5 backdrop-blur-xl"
        >
          <div className="bg-[#B6FF3B]/10 rounded-full px-2 py-0.5 border border-[#B6FF3B]/20">
            <span className="text-[8px] font-bold text-[#B6FF3B] tracking-wider uppercase">opt_a</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-[#B6FF3B] shadow-[0_0_8px_rgba(182,255,59,0.8)]"
            />
            <span className="text-[10px] uppercase tracking-widest text-white/60 font-medium">
              lat: 0.02ms
            </span>
          </div>
        </motion.div>

        {/* Hero Text */}
        <div className="text-center w-full mb-12" style={{ fontFamily: 'var(--font-headline)' }}>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[10.5vw] xs:text-[46px] leading-[0.9] tracking-tighter text-white/40 mb-3"
          >
            you&apos;re in<br />preview mode.
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-[12vw] xs:text-[54px] leading-[0.85] tracking-tighter text-[#B6FF3B] font-bold"
            style={{ textShadow: '0 0 40px rgba(182,255,59,0.25)' }}
          >
            unlock the real<br />app.
          </motion.h1>
        </div>

        {/* Timeline Steps */}
        <div className="relative flex flex-col gap-8 self-center w-full max-w-[210px]">
          {/* Vertical Line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-white/5 overflow-hidden">
            <motion.div
              animate={{ y: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-full h-1/2 bg-gradient-to-b from-transparent via-[#B6FF3B] to-transparent"
            />
          </div>

          {[
            { id: "1", action: isIOS ? 'open in safari' : 'open in browser', label: "action", color: "#B6FF3B" },
            { id: "2", action: isIOS ? 'tap share' : 'tap ⋮', label: "menu", color: "#34D399" }, // Mint/Green
            { id: "3", action: 'add to home', label: "final step", color: "#38BDF8" }, // Sky Blue
            { id: "4", action: "you're in 🚀", label: "status", color: "#FFFFFF" }
          ].map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.15 }}
              className="flex items-center gap-6"
            >
              <div
                className="w-8 h-8 rounded-full border bg-[#0A0D08] flex items-center justify-center font-bold text-[14px] z-10"
                style={{
                  borderColor: step.color,
                  color: step.color,
                  boxShadow: `0 0 15px ${step.color}33`
                }}
              >
                {step.id}
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#B6FF3B] font-bold opacity-70 mb-0.5">{step.label}</div>
                <div className="text-[15px] font-bold tracking-tight text-white/90">{step.action}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* BOTTOM CTA ZONE */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        className="w-full flex flex-col items-center pb-10 z-10"
      >
        <div className="h-[1px] w-12 bg-white/10 mb-8" />
        <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#B6FF3B] mb-2 px-4 py-2 bg-[#B6FF3B]/5 rounded-full border border-[#B6FF3B]/10 backdrop-blur-sm" style={{ fontFamily: 'var(--font-headline)' }}>
          {isIOS ? 'tap share → add to home' : 'tap menu → add to home'}
        </div>
        <div className="flex items-center gap-1.5 opacity-20 mt-2">
          <div className="w-1 h-1 rounded-full bg-white" />
          <div className="w-1 h-1 rounded-full bg-white" />
          <div className="w-1 h-1 rounded-full bg-white" />
        </div>
      </motion.div>

    </div>
  );
}
