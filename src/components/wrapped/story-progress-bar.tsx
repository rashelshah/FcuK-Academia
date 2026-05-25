"use client";

import { motion, useReducedMotion } from "framer-motion";

type StoryProgressBarProps = {
  total: number;
  currentIndex: number;
  progress: number;
};

export function StoryProgressBar({
  total,
  currentIndex,
  progress
}: StoryProgressBarProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 px-4 pt-[calc(env(safe-area-inset-top)+0.7rem)]">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, index) => {
          const fill = index < currentIndex ? 1 : index === currentIndex ? progress : 0;

          return (
            <div
              key={index}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/18 backdrop-blur"
            >
              <motion.div
                aria-hidden
                className="h-full origin-left rounded-full bg-white"
                animate={{ scaleX: fill }}
                initial={false}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: 0.12, ease: "linear" }
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
