'use client';

import React, { useMemo, useState } from 'react';

import AppHeader from '@/components/layout/AppHeader';
import DayOrderPills from '@/components/ui/DayOrderPills';
import { PageReveal, RevealItem, RevealText } from '@/components/ui/PageReveal';
import { useAppState } from '@/context/AppStateContext';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useTimetable } from '@/hooks/useTimetable';
import { getClassesForDay, getCurrentClassIndex, getDayOrders } from '@/lib/academia-ui';
import { cn } from '@/lib/utils';
import { Download, SlidersHorizontal, Plus } from 'lucide-react';
import TimetableDownloadModal from '@/components/timetable/TimetableDownloadModal';
import TimetableCard from '@/components/timetable/TimetableCard';
import { TimetableEditProvider, useTimetableEdit, generateLectureId } from '@/context/TimetableEditContext';
import { motion, AnimatePresence } from 'framer-motion';

function TimetableContent() {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const { timetableRaw, loading, error } = useTimetable();
  const {
    activeDayOrder,
    availableDayOrders,
    setActiveDayOrder,
  } = useAppState();
  
  const { 
    isEditMode, 
    toggleEditMode, 
    hiddenLectureIds, 
    hiddenLectures, 
    restoreLecture, 
    restoreAll 
  } = useTimetableEdit();

  const timetableDayOrders = useMemo(() => getDayOrders(timetableRaw), [timetableRaw]);
  const dayOrders = useMemo(
    () => [...new Set([...availableDayOrders, ...timetableDayOrders])].sort((left, right) => left - right),
    [availableDayOrders, timetableDayOrders],
  );
  const dayOrder = activeDayOrder && dayOrders.includes(activeDayOrder)
    ? activeDayOrder
    : dayOrders[0] || activeDayOrder || 1;
  const classes = getClassesForDay(timetableRaw, dayOrder);
  const currentTime = useCurrentTime();
  const highlightedClassIndex = useMemo(
    () => getCurrentClassIndex(classes, currentTime),
    [classes, currentTime],
  );

  const visibleClasses = useMemo(() => {
    return classes.map((item, index) => ({ item, index })).filter(({ item, index }) => {
      if (isEditMode) return true;
      const lectureId = generateLectureId(dayOrder, item, index);
      return !hiddenLectureIds.includes(lectureId);
    });
  }, [classes, dayOrder, hiddenLectureIds, isEditMode]);

  return (
    <>
      <PageReveal className="flex flex-col gap-8 pb-32 pt-4 print:hidden transition-all duration-300 relative z-10">
        <div className={cn("transition-opacity duration-300", isEditMode && "opacity-50")}>
          <AppHeader />
        </div>

        <RevealText className="relative z-10 mt-4 flex items-center justify-between gap-3 sm:gap-5 pr-2 sm:pr-4">
          <div className="flex items-center gap-3 sm:gap-5 transition-opacity duration-300" style={{ opacity: isEditMode ? 0.5 : 1 }}>
            <span className="theme-kicker hidden sm:inline">day order</span>
            <DayOrderPills
              days={dayOrders.length ? dayOrders : [1, 2, 3, 4]}
              activeDayOrder={dayOrder}
              onSelect={setActiveDayOrder}
            />
          </div>
          
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className={cn("flex h-9 w-9 sm:h-11 sm:w-auto sm:px-5 items-center justify-center gap-2 rounded-full font-headline text-sm font-bold shadow-[var(--glow-primary)] transition-all", 
                isEditMode ? "bg-surface-variant text-on-surface-variant opacity-50" : "bg-primary text-on-primary hover:opacity-90"
              )}
              disabled={isEditMode}
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download</span>
            </button>
            
            <button
              onClick={toggleEditMode}
              className={cn("flex h-9 sm:h-11 px-4 sm:px-5 items-center justify-center gap-2 rounded-full font-headline text-sm font-bold transition-all", 
                isEditMode 
                  ? "bg-primary text-on-primary shadow-[var(--glow-primary)] scale-105" 
                  : "bg-surface text-primary border-2 border-primary/20 hover:border-primary/50"
              )}
            >
              {isEditMode ? (
                <>Done</>
              ) : (
                <><SlidersHorizontal size={16} /><span className="hidden sm:inline">Customize</span></>
              )}
            </button>
          </div>
        </RevealText>

        <AnimatePresence>
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="sticky top-4 z-40 mx-auto bg-surface/90 backdrop-blur-md border border-border/50 shadow-xl rounded-2xl p-4 text-center max-w-sm w-full"
            >
              <p className="font-headline font-bold text-on-surface text-lg mb-1">Customize your timetable</p>
              <p className="text-sm text-on-surface-variant">Hide the lectures you don&apos;t attend. Tap Done when you&apos;re finished.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="relative mt-2">
          <div
            className="absolute bottom-0 left-3 top-4 z-0 w-px"
            style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--border-strong) 80%, transparent), transparent)' }}
          />

            <div className="relative z-10 flex flex-col gap-8">
            {loading ? (
              [1, 2, 3].map((item) => <div key={item} className="ml-8 h-36 rounded-[28px] bg-surface animate-pulse" />)
            ) : classes.length ? (
              <>
                {visibleClasses.map(({ item, index: originalIndex }, mappedIndex) => {
                  const isPrimary = originalIndex === highlightedClassIndex;
                  const glowColors: ('primary' | 'secondary' | 'error')[] = ['primary', 'secondary', 'error'];
                  const glow = glowColors[originalIndex % glowColors.length];
                  const lectureId = generateLectureId(dayOrder, item, originalIndex);
                  const isHidden = hiddenLectureIds.includes(lectureId);

                  return (
                    <RevealItem key={mappedIndex} className="w-full">
                      <TimetableCard 
                        item={item}
                        index={originalIndex}
                        isPrimary={isPrimary}
                        glowColor={glow}
                        lectureId={lectureId}
                        isHidden={isHidden}
                      />
                    </RevealItem>
                  );
                })}
              </>
            ) : (
              <RevealItem className="theme-card ml-8 p-8 text-on-surface-variant">No classes found for this day order.</RevealItem>
            )}
          </div>
        </section>
      </PageReveal>

      <TimetableDownloadModal 
        isOpen={isDownloadModalOpen} 
        onClose={() => setIsDownloadModalOpen(false)} 
        timetable={timetableRaw} 
      />
    </>
  );
}

export default function TimetablePage() {
  return (
    <TimetableEditProvider>
      <TimetableContent />
    </TimetableEditProvider>
  );
}
