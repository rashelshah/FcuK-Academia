'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

interface Spark {
  id: number;
  x: number;
  y: number;
  rotation: number;
  text?: string;
  color: string;
}

const HIT_TEXTS = ['GREAT!', 'PERFECT!', 'COUNTER!', 'COMBO!', 'KO!', 'FIGHT!'];
const COLORS = ['#00d9ff', '#ff1a1a', '#ff9d00', '#00ff3c'];

export default function TekkenHitSparks() {
  const { theme, themeConfig } = useTheme();
  const [sparks, setSparks] = useState<Spark[]>([]);

  const isTekken = theme === 'tekken';
  const effectsEnabled = themeConfig?.config?.effectsEnabled !== false;

  useEffect(() => {
    if (!isTekken || !effectsEnabled) return;

    let sparkId = 0;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      // Randomize properties for the impact
      const rotation = Math.random() * 360;
      const isText = Math.random() > 0.7; // 30% chance for a text popup
      const text = isText ? HIT_TEXTS[Math.floor(Math.random() * HIT_TEXTS.length)] : undefined;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      const newSpark: Spark = {
        id: sparkId++,
        x: clientX,
        y: clientY,
        rotation,
        text,
        color,
      };

      setSparks((prev) => [...prev, newSpark]);

      // Remove spark after animation completes
      setTimeout(() => {
        setSparks((prev) => prev.filter((s) => s.id !== newSpark.id));
      }, 600);
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isTekken, effectsEnabled]);

  if (!isTekken || !effectsEnabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {sparks.map((spark) => (
          <React.Fragment key={spark.id}>
            {spark.text ? (
              <motion.div
                className="absolute font-headline font-bold italic tracking-wider uppercase text-shadow-glow"
                style={{
                  left: spark.x,
                  top: spark.y,
                  color: spark.color,
                  x: '-50%',
                  y: '-50%',
                  textShadow: `0 0 10px ${spark.color}, 0 0 20px ${spark.color}, 2px 2px 0px #000`,
                  fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                }}
                initial={{ opacity: 1, scale: 0.5, rotate: spark.rotation > 180 ? 15 : -15 }}
                animate={{ opacity: 0, scale: 1.5, y: '-100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                {spark.text}
              </motion.div>
            ) : (
              <motion.div
                className="absolute flex items-center justify-center"
                style={{ left: spark.x, top: spark.y, x: '-50%', y: '-50%' }}
                initial={{ scale: 0, opacity: 1, rotate: spark.rotation }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {/* Visual Hit Spark (Cross pattern like fighting games) */}
                <div 
                  className="absolute bg-white rounded-full mix-blend-screen" 
                  style={{ 
                    width: '4px', 
                    height: '60px', 
                    boxShadow: `0 0 20px 5px ${spark.color}` 
                  }} 
                />
                <div 
                  className="absolute bg-white rounded-full mix-blend-screen" 
                  style={{ 
                    width: '60px', 
                    height: '4px', 
                    boxShadow: `0 0 20px 5px ${spark.color}` 
                  }} 
                />
                {/* Core burst */}
                <div 
                  className="absolute rounded-full bg-white mix-blend-screen" 
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    boxShadow: `0 0 30px 15px ${spark.color}` 
                  }} 
                />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
}
