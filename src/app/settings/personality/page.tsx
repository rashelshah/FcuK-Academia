'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { Check, Play } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

import AppHeader from '@/components/layout/AppHeader';
import { PageReveal } from '@/components/ui/PageReveal';
import { usePersonalityMode } from '@/context/PersonalityContext';
import { PersonalityMode } from '@/config/personality';
import { useTheme } from '@/context/ThemeContext';
import { getInteractiveMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

const PERSONALITIES: {
  id: PersonalityMode;
  name: string;
  description: string;
  image: string;
  badges: string[];
}[] = [
    {
      id: 'fcuk_academia',
      name: 'FcuK Academia',
      description: 'The classic experience. Brutally honest, slightly toxic, perfectly chaotic.',
      image: '/images/personalities/fcuk_academia_user.png',
      badges: ['0% Attendance', 'Due Today', 'Help'],
    },
    {
      id: 'girlie_pop',
      name: 'Girlie Pop',
      description: 'Slaying the semester. Pure aesthetic ✨, 100% romanticizing the academic struggle 💅.',
      image: '/images/personalities/girlie_pop_user2.png',
      badges: ['Matcha Powered', 'Aesthetic Notes', 'Manifesting A+'],
    },
    {
      id: 'sigma',
      name: 'Sigma',
      description: 'Cold, calculated, and optimized. Pure discipline. Zero distractions.',
      image: '/images/personalities/sigma_user.png',
      badges: ['Deep Work', 'Do Not Disturb', '25:5 Pomodoro'],
    },
    {
      id: 'delulu',
      name: 'Delulu',
      description: 'Manifesting distinction. Believing in the curve. Everything is fine ✨.',
      image: '/images/personalities/delulu_user2.png',
      badges: ['A+ Vibes', 'It Is What It Is', 'Trust The Curve'],
    },
    {
      id: 'academic_victim',
      name: 'Academic Victim',
      description: 'Barely scraping by. Fueled by caffeine, panic, and desperate prayers.',
      image: '/images/personalities/academic_victim_user.png',
      badges: ['3AM Crew', 'Need Coffee', 'Send Help'],
    },
    {
      id: 'corporate_hustler',
      name: 'Corporate Hustler',
      description: 'Treating college like a B2B SaaS startup. Optimizing synergies and avoiding academic layoffs.',
      image: '/images/personalities/corporate_hustler_user2.png',
      badges: ['Networking', "Let's Connect", 'Synergy'],
    },
    {
      id: 'brain_rot',
      name: 'Brain Rot',
      description: 'Chronically online. Skibidi rizz and negative aura for when you definitely did not cook.',
      image: '/images/personalities/brain_rot_user2.png',
      badges: ['Chronically Online', '-1000 Aura', 'Doomscrolling'],
    },
  ];

export default function PersonalitySelectionPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const { mode, setMode } = usePersonalityMode();

  const [activeIndex, setActiveIndex] = useState(() => {
    const idx = PERSONALITIES.findIndex(p => p.id === mode);
    return idx === -1 ? 0 : idx;
  });
  const [isDragging, setIsDragging] = useState(false);

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const swipeThreshold = 30;
    const velocityThreshold = 400;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      setActiveIndex((prev) => (prev + 1) % PERSONALITIES.length);
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      setActiveIndex((prev) => (prev - 1 + PERSONALITIES.length) % PERSONALITIES.length);
    }
  };

  useEffect(() => {
    if (isDragging) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PERSONALITIES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [activeIndex, isDragging]);

  const handleModeSelect = (selectedId: PersonalityMode) => {
    if (selectedId === mode) {
      router.back();
      return;
    }

    setMode(selectedId);

    // Snappy production-level sequence matching theme exit
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        router.back();
      }, 250);
    }, 200);
  };

  return (
    <AnimatePresence mode="wait">
      {!isExiting && (
        <motion.div
          key="personality-content"
          initial={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 0.92,
            y: 20,
            transition: {
              duration: 0.25,
              ease: [0.32, 0, 0.67, 0]
            }
          }}
          className="flex min-h-[calc(100dvh-10rem)] flex-col gap-6 pb-36 pt-4"
        >
          <PageReveal className="flex flex-col gap-6">
            <AppHeader backHref="/settings" showBell={false} title="Select Tone" />

            <section className="space-y-3">
              <p className="theme-kicker">swipe to explore</p>
              <h1 className="font-headline text-[clamp(2.6rem,12vw,4.1rem)] font-bold leading-[0.92] text-on-surface">
                personality modes
              </h1>
            </section>

            {/* Stacked Hero Carousel */}
            <div className="relative flex h-[62vh] w-full items-start justify-center pt-2">
              {PERSONALITIES.map((personality, index) => {
                const isActiveMode = mode === personality.id;
                const length = PERSONALITIES.length;
                let offset = index - activeIndex;
                if (offset > Math.floor(length / 2)) {
                  offset -= length;
                } else if (offset < -Math.floor(length / 2)) {
                  offset += length;
                }
                const isZero = offset === 0;
                const isOne = Math.abs(offset) === 1;

                let scale = 0.85;
                let opacity = 0;
                let zIndex = 0;
                let x = "0%";
                let y = 48;

                if (isZero) {
                  scale = 1;
                  opacity = 1;
                  zIndex = 3;
                  x = "0%";
                  y = 0;
                } else if (isOne) {
                  scale = 0.92;
                  opacity = 0.8;
                  zIndex = 2;
                  x = offset > 0 ? "18%" : "-18%";
                  y = 24;
                } else {
                  scale = 0.85;
                  opacity = 0.5;
                  zIndex = 1;
                  x = offset > 0 ? "32%" : "-32%";
                  y = 48;
                }

                return (
                  <motion.div
                    key={personality.id}
                    className="absolute flex h-[56vh] w-[76vw] max-w-[320px] shrink-0 flex-col overflow-hidden rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.25)] touch-pan-y bg-surface-card"
                    style={{
                      WebkitMaskImage: '-webkit-radial-gradient(white, black)'
                    }}
                    animate={{
                      scale,
                      opacity,
                      zIndex,
                      x,
                      y,
                    }}
                    transition={{
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                  >
                    <Image
                      src={personality.image}
                      alt={personality.name}
                      fill
                      sizes="(max-width: 768px) 80vw, 320px"
                      className="object-cover pointer-events-none"
                      priority={isZero || isOne}
                    />

                    <div
                      className="absolute inset-0 pointer-events-none z-10"
                      style={{
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.95) 100%)',
                        borderRadius: 'inherit'
                      }}
                    />

                    <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-4 p-6 pb-7">
                      <h3 className="font-headline text-[2.8rem] font-black leading-[0.9] tracking-tighter text-white uppercase drop-shadow-lg">
                        {personality.name}
                      </h3>

                      <p className="text-sm font-medium leading-relaxed text-white/90 pr-6 drop-shadow">
                        {personality.description}
                      </p>

                      <div className="mt-5 flex items-center gap-4">
                        <button
                          disabled={isExiting}
                          onClick={() => {
                            if (!isZero) {
                              setActiveIndex(index);
                              return;
                            }
                            handleModeSelect(personality.id);
                          }}
                          className={cn(
                            "flex items-center justify-center h-16 w-16 rounded-full transition-transform active:scale-90 shadow-xl pointer-events-auto shrink-0",
                            isActiveMode ? "bg-white text-black" : "bg-white/20 text-white backdrop-blur-xl border border-white/20"
                          )}
                        >
                          {isActiveMode ? <Check size={32} strokeWidth={3} /> : <Play size={32} className="ml-1" fill="currentColor" />}
                        </button>
                        <span className="text-[13px] font-bold text-white/90 uppercase tracking-[0.2em] drop-shadow-md">
                          {isActiveMode ? 'Current Mode' : 'Apply Now'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </PageReveal>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
