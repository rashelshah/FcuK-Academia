'use client';

import React, { useMemo, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlowCard from '@/components/ui/GlowCard';
import { useTimetableEdit } from '@/context/TimetableEditContext';

interface TimetableCardProps {
  item: {
    time: string;
    courseTitle?: string;
    courseRoomNo?: string;
    faculty?: string;
    courseCode?: string;
    slot?: string;
  };
  index: number;
  isPrimary: boolean;
  glowColor: 'primary' | 'secondary' | 'error';
  lectureId: string;
  isHidden?: boolean;
}

const getDeterministicDelay = (seedString: string) => {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 100) / 100; // 0.0 to 1.0
};

export default function TimetableCard({ item, index, isPrimary, glowColor, lectureId, isHidden }: TimetableCardProps) {
  const { isEditMode, hideLecture, restoreLecture } = useTimetableEdit();
  const prefersReducedMotion = useReducedMotion();
  const [showConfirm, setShowConfirm] = useState(false);

  // Deterministic delay for the jiggle so it looks random but is stable
  const jiggleDelay = useMemo(() => {
    return getDeterministicDelay(lectureId) * 0.3; // 0 to 0.3s
  }, [lectureId]);

  const jiggleAnimation = {
    rotate: prefersReducedMotion ? 0 : [-0.75, 0.75, -0.75],
    x: prefersReducedMotion ? 0 : [-1, 1, -1],
    transition: {
      duration: 0.35,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
      delay: jiggleDelay,
    },
  };

  const handleHideClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const confirmHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
    hideLecture(lectureId, item.courseTitle || 'Unknown Class');
  };

  const cancelHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  const handleRestoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    restoreLecture(lectureId);
  };

  const cardContent = (
    <>
      <div className={cn("mb-2 font-headline text-[14px] font-bold tracking-widest", 
        isPrimary 
          ? "inline-block rounded-full px-3 py-1 bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)]" 
          : glowColor === 'primary' ? 'text-primary' : glowColor === 'secondary' ? 'text-secondary' : 'text-error'
      )}>
        {item.time}
      </div>
      <h3 className="mb-6 pr-4 font-headline text-[26px] md:text-[28px] font-bold lowercase leading-[1.1] text-on-surface">
        {item.courseTitle?.toLowerCase()}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <InfoColumn label="room" value={item.courseRoomNo || 'TBA'} />
        <InfoColumn label="faculty" value={item.faculty || 'Faculty TBA'} />
      </div>

    </>
  );

  return (
    <motion.div 
      layout
      initial={false}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
      }}
      exit={{ opacity: 0, scale: 0.8, height: 0, marginBottom: 0, transition: { duration: 0.3 } }}
      className="relative flex gap-6 w-full"
    >
      <div className="relative mt-6 shrink-0">
        <div
          className={cn('relative z-10 h-2.5 w-2.5 rounded-full', glowColor === 'primary' ? 'bg-primary' : glowColor === 'secondary' ? 'bg-secondary' : 'bg-error')}
          style={{ boxShadow: glowColor === 'primary' ? 'var(--glow-primary)' : glowColor === 'secondary' ? 'var(--glow-secondary)' : 'var(--glow-error)' }}
        />
      </div>
      
      <div className="relative flex-1">
        <motion.div
          animate={isEditMode && !showConfirm ? jiggleAnimation as any : { rotate: 0, x: 0 }}
          whileTap={isEditMode ? { scale: 0.96 } : {}}
          className={cn("h-full w-full transition-[opacity,filter] duration-300", isHidden && "opacity-50 blur-[2px] grayscale-[0.5]")}
        >
          {isPrimary ? (
            <div
              className="theme-card relative h-full w-full p-7 md:p-8 overflow-visible"
              style={{
                background: 'linear-gradient(180deg, color-mix(in srgb, var(--primary) 9%, var(--surface)) 0%, color-mix(in srgb, var(--surface) 96%, transparent) 100%)',
                borderColor: 'color-mix(in srgb, var(--primary) 20%, var(--border))',
                '--card-edge-color': `var(--${glowColor})`,
              } as React.CSSProperties}
            >
              {cardContent}
            </div>
          ) : (
            <GlowCard glowColor={glowColor} className="h-full w-full border-l-2 bg-transparent relative overflow-visible" style={{ '--card-edge-color': `var(--${glowColor})` } as React.CSSProperties}>
              {cardContent}
            </GlowCard>
          )}
        </motion.div>

        {/* iOS style Action Button - OUTSIDE the jiggling motion.div but INSIDE the wrapper! */}
        <AnimatePresence>
          {isEditMode && !showConfirm && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { type: 'spring', bounce: 0.5, delay: 0.1 } }}
              exit={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 0.8 }}
              onClick={isHidden ? handleRestoreClick : handleHideClick}
              className={cn("absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900 z-20 cursor-pointer",
                isHidden ? "bg-green-500" : "bg-red-500"
              )}
            >
              {isHidden ? <Plus strokeWidth={3} className="text-white w-4 h-4" /> : <Minus strokeWidth={3} className="text-white w-4 h-4" />}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Confirmation Overlay - OUTSIDE the jiggling motion.div */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 rounded-3xl p-4 text-center"
            >
              <p className="text-white font-medium mb-1">Hide this lecture?</p>
              <p className="text-white/70 text-sm mb-4 line-clamp-1">{item.courseTitle}</p>
              <div className="flex gap-3 w-full max-w-[200px]">
                <button 
                  onClick={cancelHide}
                  className="flex-1 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmHide}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Hide
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function InfoColumn({
  label,
  value,
  inverse,
}: {
  label: string;
  value: string;
  inverse?: boolean;
}) {
  return (
    <div>
      <span className={cn('mb-1 block font-label text-[9px] font-bold uppercase tracking-[0.2em]', inverse ? 'text-[rgba(0,0,0,0.55)]' : 'text-on-surface-variant')}>
        {label}
      </span>
      <span className={cn('block font-headline text-lg font-bold leading-tight', inverse ? 'text-[var(--text-inverse)]' : 'text-on-surface')}>
        {value}
      </span>
    </div>
  );
}
