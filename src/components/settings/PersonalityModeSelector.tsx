'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Play, X } from 'lucide-react';
import { usePersonalityMode } from '@/context/PersonalityContext';
import { PersonalityMode } from '@/config/personality';
import { useTheme } from '@/context/ThemeContext';
import { getInteractiveMotion } from '@/lib/motion';
import { FEATURES } from '@/lib/features';
import GlassCard from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const PERSONALITIES: {
  id: PersonalityMode;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  views: string;
}[] = [
  {
    id: 'fcuk_academia',
    name: 'FcuK Academia',
    description: 'The classic experience. Brutally honest, slightly toxic, perfectly chaotic.',
    icon: '🔥',
    gradient: 'linear-gradient(145deg, #0f172a 0%, #7f1d1d 100%)',
    views: '18L',
  },
  {
    id: 'girlie_pop',
    name: 'Girlie Pop',
    description: 'Slaying the semester. Pure aesthetic ✨, 100% romanticizing the academic struggle 💅.',
    icon: '✨',
    gradient: 'linear-gradient(145deg, #831843 0%, #f472b6 100%)',
    views: '12L',
  },
  {
    id: 'sigma',
    name: 'Sigma',
    description: 'Cold, calculated, and optimized. Pure discipline. Zero distractions.',
    icon: '🗿',
    gradient: 'linear-gradient(145deg, #171717 0%, #404040 100%)',
    views: '8L',
  },
  {
    id: 'delulu',
    name: 'Delulu',
    description: 'Manifesting distinction. Believing in the curve. Everything is fine ✨.',
    icon: '🧘',
    gradient: 'linear-gradient(145deg, #312e81 0%, #a855f7 100%)',
    views: '24L',
  },
  {
    id: 'academic_victim',
    name: 'Academic Victim',
    description: 'Barely scraping by. Fueled by caffeine, panic, and desperate prayers.',
    icon: '😭',
    gradient: 'linear-gradient(145deg, #450a0a 0%, #ea580c 100%)',
    views: '42L',
  },
  {
    id: 'corporate_hustler',
    name: 'Corporate Hustler',
    description: 'Treating college like a B2B SaaS startup. Optimizing synergies and avoiding academic layoffs.',
    icon: '🤝',
    gradient: 'linear-gradient(145deg, #0c4a6e 0%, #0284c7 100%)',
    views: '5L',
  },
  {
    id: 'brain_rot',
    name: 'Brain Rot',
    description: 'Chronically online. Skibidi rizz and negative aura for when you definitely did not cook.',
    icon: '🧠',
    gradient: 'linear-gradient(145deg, #14532d 0%, #22c55e 100%)',
    views: '99L',
  },
];

export default function PersonalityModeSelector() {
  const { mode } = usePersonalityMode();
  const { themeConfig } = useTheme();
  const motionProps = getInteractiveMotion(themeConfig.motion);

  if (!FEATURES.ENABLE_PERSONALITY_MODES) {
    return null;
  }

  const activePersonality = PERSONALITIES.find(p => p.id === mode) || PERSONALITIES[0];

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div>
            <p className="theme-kicker mb-0.5">tone & language</p>
            <h2 className="font-headline text-3xl font-bold lowercase tracking-tight text-on-surface">personality mode</h2>
          </div>
        </div>

        <GlassCard className="space-y-6 px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="theme-kicker">active mode</p>
              <h3 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
                {activePersonality.name} <span className="text-xl">{activePersonality.icon}</span>
              </h3>
            </div>
            <div className="flex gap-1.5">
              {PERSONALITIES.slice(0, 3).map((p) => (
                <span 
                  key={p.id} 
                  className={cn(
                    "h-6 w-6 flex items-center justify-center rounded-full text-[10px] transition-all",
                    mode === p.id ? "bg-primary/20 opacity-100 ring-1 ring-primary" : "opacity-40 grayscale"
                  )}
                >
                  {p.icon}
                </span>
              ))}
            </div>
          </div>

          <Link href="/settings/personality" className="block w-full">
            <motion.div
              whileHover={motionProps.whileHover}
              whileTap={motionProps.whileTap}
              transition={motionProps.transition}
              className="theme-panel flex w-full items-center justify-between gap-4 p-4 text-left"
            >
              <div>
                <h4 className="font-headline text-xl font-bold text-on-surface">select mode</h4>
              </div>
              <ChevronRight size={18} className="shrink-0 text-on-surface-variant" />
            </motion.div>
          </Link>
        </GlassCard>
      </section>
    </>
  );
}
