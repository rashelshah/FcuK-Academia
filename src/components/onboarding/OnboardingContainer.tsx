'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { OnboardingThemeConfig } from '@/components/onboarding/types';
import { trackEvent } from '@/lib/analytics';

interface OnboardingContainerProps {
  theme: OnboardingThemeConfig;
  onFinish: () => void;
}

const DIRECTION_LOCK_RATIO = 1.1;
const ONBOARDING_SCREEN_NAMES = [
  'onboarding_1',
  'onboarding_2',
  'onboarding_3',
  'onboarding_4',
  'onboarding_5',
] as const;

const slidesData = [
  {
    title: 'welcome to survival mode.',
    description: 'We removed the pain from academia. What\'s left is just... results.',
    buttonText: 'Ok, so what?',
    bgColor: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', // Blue gradient
    image: '/illustrations/illustration1.svg',
  },
  {
    title: 'speed unlocked.',
    description: 'no spinning loaders. no portal suffering. just your data, instantly.',
    buttonText: 'Yeah, curious',
    bgColor: 'linear-gradient(135deg, #27272A 0%, #09090B 100%)', // Black gradient
    image: '/illustrations/illustration2.svg',
    imageClassName: 'scale-[1.1] origin-bottom',
  },
  {
    title: 'the contingency plan.',
    description: 'for every “oh no” moment in your academic journey.',
    buttonText: 'Wait, really?',
    bgColor: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', // Red gradient
    image: '/illustrations/illustration3.svg',
    imageClassName: '-translate-y-12',
  },
  {
    title: 'no creepy stuff.',
    description: 'no selling data. no tracking drama. just the features you actually came for.',
    buttonText: 'Sounds safe',
    bgColor: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)', // Green gradient
    image: '/illustrations/illustration4.svg',
  },
  {
    title: 'welcome to the better academia.',
    description: 'you’ve seen the features. now go make this semester your best one yet.',
    buttonText: 'Let\'s gooo!',
    bgColor: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)', // Amber gradient
    image: '/illustrations/illustration5.svg',
  },
];

export default function OnboardingContainer({ theme, onFinish }: OnboardingContainerProps) {
  const activeIndexRef = useRef(0);
  const stepNavigationSourceRef = useRef<'initial' | 'button' | 'swipe'>('initial');
  const previousTrackedIndexRef = useRef<number | null>(null);
  
  const [activeIndex, setActiveIndex] = useState(0);

  const totalSlides = slidesData.length;


  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const screenName = ONBOARDING_SCREEN_NAMES[activeIndex] ?? `onboarding_${activeIndex + 1}`;
    const previousIndex = previousTrackedIndexRef.current;

    trackEvent('onboarding_step_viewed', {
      step_name: screenName,
      step_number: activeIndex + 1,
      total_steps: totalSlides,
      navigation_source: stepNavigationSourceRef.current,
    });

    if (previousIndex !== null && stepNavigationSourceRef.current === 'swipe' && previousIndex !== activeIndex) {
      trackEvent('screen_swipe', {
        from: ONBOARDING_SCREEN_NAMES[previousIndex] ?? `onboarding_${previousIndex + 1}`,
        to: screenName,
        navigation_surface: 'onboarding',
      });
    }

    previousTrackedIndexRef.current = activeIndex;
    stepNavigationSourceRef.current = 'initial';
  }, [activeIndex, totalSlides]);

  const goToSlide = (index: number) => {
    stepNavigationSourceRef.current = 'button';
    setActiveIndex(Math.max(0, Math.min(totalSlides - 1, index)));
  };

  const goNext = () => {
    if (activeIndex === totalSlides - 1) {
      onFinish();
      return;
    }
    goToSlide(activeIndex + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-[130] mx-auto w-full max-w-[28rem] sm:max-w-[34rem] lg:max-w-[44rem] xl:max-w-[52rem] overflow-hidden bg-black"
    >
      <div className="relative h-full w-full overflow-hidden">
        {slidesData.map((slide, index) => {
          const isLast = index === totalSlides - 1;
          return (
            <motion.section
              key={index}
              className="absolute inset-0 flex flex-col"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset }) => {
                const swipe = offset.x;
                if (swipe < -50 && activeIndex < totalSlides - 1) {
                  goNext();
                } else if (swipe > 50 && activeIndex > 0) {
                  goToSlide(activeIndex - 1);
                }
              }}
              style={{ 
                background: slide.bgColor,
                pointerEvents: activeIndex === index ? 'auto' : 'none'
              }}
              initial={false}
              animate={{ 
                opacity: activeIndex === index ? 1 : 0,
                zIndex: activeIndex === index ? 10 : 0
              }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              aria-hidden={activeIndex !== index}
              aria-label={`Onboarding slide ${index + 1}`}
            >
              {/* Illustration Area */}
              <div className="flex-1 flex justify-center items-center relative overflow-visible px-8 z-20">
                {slide.image ? (
                  <div className="absolute inset-x-[-2rem] top-[-4rem] bottom-[-4.5rem] flex justify-center items-end pointer-events-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <motion.img 
                      src={slide.image} 
                      alt={slide.title} 
                      className={`w-full max-w-[600px] h-full max-h-[130%] object-contain object-bottom drop-shadow-2xl ${slide.imageClassName || ''}`} 
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={activeIndex === index ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex justify-center items-end pb-8 pt-10">
                    <div className="w-full max-w-[280px] h-[300px] border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center text-white/60 bg-white/5">
                      <span className="text-sm font-semibold mb-2">Illustration Slot</span>
                      <span className="text-xs text-center px-4 opacity-70">Add your GIF here to replace characters</span>
                    </div>
                  </div>
                )}
              </div>

              {/* White Card Content */}
              <div className="bg-white rounded-t-[2.5rem] px-8 pt-6 pb-24 flex flex-col min-h-[38%] z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] relative">
                <h2 className="text-black font-sans text-[2.25rem] font-black leading-none mb-3 tracking-tight">
                  {slide.title}
                </h2>
                <p className="text-gray-500 text-[0.95rem] mb-6 leading-relaxed font-medium">
                  {slide.description}
                </p>

                <div className="mt-auto flex justify-between items-center">
                  {/* Pagination Dots */}
                  <div className="flex gap-2.5">
                    {slidesData.map((_, dotIndex) => (
                      <div
                        key={dotIndex}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          dotIndex === index ? 'w-2 bg-black' : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={goNext}
                    className="text-white px-7 py-3.5 rounded-[2rem] font-bold text-[0.9rem] tracking-wide transition-transform hover:scale-105 active:scale-95 shadow-md"
                    style={{ background: slide.bgColor }}
                  >
                    {slide.buttonText}
                  </button>
                </div>
              </div>
            </motion.section>
          );
        })}
      </div>
    </motion.div>
  );
}
