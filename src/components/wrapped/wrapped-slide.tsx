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
    filter: "blur(14px)"
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)"
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? -42 : 42,
    scale: 0.992,
    filter: "blur(12px)"
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
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,#70258c_0%,#9d36a2_10%,#dd5fbe_20%,#ff88cb_28%,#ff6ec2_33%,#201120_35%,#090608_100%)]"
        animate={{ opacity: [0.96, 1, 0.97] }}
        transition={{
          duration: 7.8,
          ease: [0.22, 1, 0.36, 1],
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror"
        }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,170,225,0.2),rgba(255,105,201,0.02)_30%,rgba(138,53,170,0.18)_60%,rgba(255,149,219,0.08)_86%)]"
        animate={{
          opacity: [0.26, 0.42, 0.3],
          scale: [1, 1.02, 1]
        }}
        transition={{
          duration: 10.2,
          ease: [0.22, 1, 0.36, 1],
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror"
        }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-x-[-24%] top-[-16%] h-[44%] rounded-full bg-[radial-gradient(circle,_rgba(255,171,224,0.92),_rgba(250,92,182,0.62)_34%,_rgba(181,56,190,0.26)_64%,_transparent_78%)] blur-3xl"
        animate={{
          x: ["-4%", "5%", "-1%"],
          y: ["0%", "4%", "-2%"],
          scale: [0.98, 1.06, 1]
        }}
        transition={{
          duration: 8.6,
          ease: [0.22, 1, 0.36, 1],
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror"
        }}
      />
      <motion.div
        aria-hidden
        className="absolute right-[-18%] top-[8%] h-[28%] w-[62%] rounded-full bg-[radial-gradient(circle,_rgba(255,203,233,0.7),_rgba(255,111,198,0.32)_50%,_transparent_78%)] blur-2xl"
        animate={{
          x: ["0%", "-6%", "2%"],
          y: ["0%", "8%", "-4%"],
          scale: [1, 1.1, 0.98]
        }}
        transition={{
          duration: 7,
          ease: [0.22, 1, 0.36, 1],
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror"
        }}
      />
      <motion.div
        aria-hidden
        className="absolute left-[-12%] top-[12%] h-[18%] w-[54%] rounded-full bg-[radial-gradient(circle,_rgba(255,122,199,0.45),_rgba(255,122,199,0.12)_55%,_transparent_80%)] blur-2xl"
        animate={{
          x: ["0%", "8%", "-3%"],
          y: ["0%", "-5%", "2%"],
          scale: [0.96, 1.08, 1]
        }}
        transition={{
          duration: 6.6,
          ease: [0.22, 1, 0.36, 1],
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror"
        }}
      />
      <motion.div
        aria-hidden
        className="absolute left-[14%] top-[2%] h-[16%] w-[72%] rounded-full bg-[radial-gradient(circle,_rgba(183,76,219,0.42),_rgba(183,76,219,0.08)_58%,_transparent_80%)] blur-2xl"
        animate={{
          x: ["0%", "6%", "-4%"],
          opacity: [0.22, 0.34, 0.24]
        }}
        transition={{
          duration: 11,
          ease: [0.22, 1, 0.36, 1],
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror"
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.16),transparent_22%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_52%,rgba(255,105,201,0.18),transparent_26%)]" />
      <div className="absolute inset-x-0 top-[32.4%] h-16 bg-[linear-gradient(180deg,rgba(255,163,221,0.14),rgba(255,108,196,0.12)_32%,rgba(18,11,18,0.56)_72%,transparent)] blur-lg" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_24%,transparent_78%,rgba(255,255,255,0.03))]" />
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
