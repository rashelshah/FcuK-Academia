'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

// Simple Ember particle component
const EmberParticle = ({ delay, duration, startX, startY }: any) => {
  return (
    <motion.div
      className="absolute h-1 w-1 rounded-full bg-orange-500"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        boxShadow: '0 0 4px 2px rgba(255, 100, 0, 0.6)',
      }}
      animate={{
        y: ['0vh', '-100vh'],
        x: ['0vw', `${(Math.random() - 0.5) * 20}vw`],
        opacity: [0, 0.8, 0],
        scale: [0.5, 1.5, 0.5],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: 'linear',
      }}
    />
  );
};

export default function TekkenBackground() {
  const { theme, themeConfig } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Parallax setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const rotateX = useTransform(springY, [-1, 1], [3, -3]);
  const rotateY = useTransform(springX, [-1, 1], [-3, 3]);
  const moveX = useTransform(springX, [-1, 1], [-15, 15]);
  const moveY = useTransform(springY, [-1, 1], [-15, 15]);

  const isTekken = theme === 'tekken';
  const tekkenConfig = themeConfig?.config;
  const effectsEnabled = tekkenConfig?.effectsEnabled !== false;

  useEffect(() => {
    if (!isTekken) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to -1 to 1 range
      const xPct = (e.clientX / window.innerWidth) * 2 - 1;
      const yPct = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(xPct);
      mouseY.set(yPct);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false);
        videoRef.current?.pause();
      } else {
        setIsVisible(true);
        videoRef.current?.play().catch(e => console.error("Playback failed", e));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTekken]);

  if (!isTekken) return null;

  // Generate embers
  const embers = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 5,
    startX: Math.random() * 100,
    startY: 100 + Math.random() * 20,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none tekken-background" style={{ zIndex: 0, perspective: 1000 }}>
      {/* Parallax Container */}
      <motion.div 
        className="absolute inset-[-5%] w-[110%] h-[110%]"
        style={{ 
          rotateX, 
          rotateY, 
          x: moveX, 
          y: moveY,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Video layer */}
        {effectsEnabled && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: 1, // Full opacity for HUD mode
              filter: 'saturate(1.3) contrast(1.15)', // Removed blur, increased punch
              willChange: 'transform',
            }}
            autoPlay
            muted
            loop
            playsInline
            src="/assets/videos/tekken-loop.mp4"
          />
        )}

        {/* Embers Layer */}
        {effectsEnabled && (
          <div className="absolute inset-0 z-10 mix-blend-screen opacity-70">
            {embers.map((ember) => (
              <EmberParticle key={ember.id} {...ember} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Static Overlays (CRT/Smoke) remain screen-fixed so they don't move with parallax */}
      {effectsEnabled && (
        <div className="absolute inset-0 pointer-events-none z-20 crt-flicker-overlay">
          {/* CRT Scanlines with rolling animation */}
          <div 
            className="absolute inset-0 scanline-anim"
            style={{
              opacity: tekkenConfig?.scanlineOpacity || 0.12,
              background: 'repeating-linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
              backgroundSize: '100% 4px',
            }}
          />
          {/* Subtle smoke drift (CSS only) */}
          <div 
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,217,255,0.08)_0%,_transparent_70%)] opacity-30 mix-blend-screen drift-animation"
          />
        </div>
      )}
      
      <style jsx>{`
        .drift-animation {
          animation: drift 20s linear infinite;
        }
        .scanline-anim {
          animation: scanlines 10s linear infinite;
        }
        @keyframes drift {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5%) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes scanlines {
          0% { background-position: 0 0; }
          100% { background-position: 0 100vh; }
        }
      `}</style>
    </div>
  );
}
