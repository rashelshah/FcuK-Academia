"use client";

import type { PanInfo } from "framer-motion";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { FloatingDecorations } from "@/components/wrapped/floating-decorations";

type WrappedSlideProps = {
  direction: number;
  children: ReactNode;
  decorationVariant: "intro" | "city" | "outro";
  onPrev: () => void;
  onNext: () => void;
  onDragStart: () => void;
  onDragEnd: (info: PanInfo) => void;
};

const variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? 56 : -56,
    scale: 0.985,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? -42 : 42,
    scale: 0.992,
  })
};

export function WrappedSlide({
  direction,
  children,
  decorationVariant,
  onPrev,
  onNext,
  onDragStart,
  onDragEnd
}: WrappedSlideProps) {
  return (
    <motion.section
      key={decorationVariant}
      className="absolute inset-0 overflow-hidden"
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        duration: 0.68,
        ease: [0.22, 1, 0.36, 1]
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      onDragStart={onDragStart}
      onDragEnd={(_, info) => onDragEnd(info)}
    >

      <FloatingDecorations variant={decorationVariant} />

      <button
        aria-label="Previous slide area"
        className="absolute inset-y-0 left-0 z-20 w-[32%]"
        onClick={onPrev}
        type="button"
      />
      <button
        aria-label="Next slide area"
        className="absolute inset-y-0 right-0 z-20 w-[32%]"
        onClick={onNext}
        type="button"
      />

      <div className="relative z-10 flex h-full flex-col px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        {children}
      </div>
    </motion.section>
  );
}
