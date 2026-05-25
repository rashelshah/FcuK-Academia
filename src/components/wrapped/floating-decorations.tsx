"use client";

import { motion } from "framer-motion";

type FloatingDecorationsProps = {
  variant: "intro" | "city" | "outro";
};

const floatTransition = {
  duration: 6.8,
  ease: [0.22, 1, 0.36, 1] as const,
  repeat: Number.POSITIVE_INFINITY,
  repeatType: "mirror" as const
};

export function FloatingDecorations({ variant }: FloatingDecorationsProps) {
  if (variant === "intro") {
    return (
      <>
        <motion.div
          aria-hidden
          className="absolute -left-16 top-18 h-44 w-44 rounded-full bg-[radial-gradient(circle,_rgba(255,102,200,0.72),_rgba(255,102,200,0.08)_58%,_transparent_75%)] blur-2xl"
          animate={{ x: [0, 20, -10], y: [0, -14, 10] }}
          transition={floatTransition}
        />
        <motion.div
          aria-hidden
          className="absolute right-[-2.5rem] top-32 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(124,49,151,0.85),_rgba(124,49,151,0.12)_60%,_transparent_78%)] blur-3xl"
          animate={{ x: [0, -18, 8], y: [0, 18, -12] }}
          transition={{ ...floatTransition, duration: 7.4 }}
        />

        <div aria-hidden className="absolute left-8 top-[41%] text-4xl text-[#ff70ce]">
          *
        </div>
        <div
          aria-hidden
          className="absolute right-10 top-[54%] h-16 w-16 rounded-full border border-white/15"
        />
        <div
          aria-hidden
          className="absolute bottom-40 right-[-3rem] h-36 w-36 rounded-full border-[18px] border-[#ff5dc7]/85 opacity-75"
        />
      </>
    );
  }

  if (variant === "city") {
    return (
      <>
        <motion.div
          aria-hidden
          className="absolute -bottom-12 left-1/2 h-48 w-72 -translate-x-1/2 bg-[radial-gradient(circle,_rgba(255,105,201,0.95),_rgba(255,105,201,0.26)_36%,_transparent_70%)] blur-2xl"
          animate={{ scale: [0.94, 1.06, 0.96], opacity: [0.66, 0.92, 0.76] }}
          transition={{ ...floatTransition, duration: 5.8 }}
        />
        <motion.div
          aria-hidden
          className="absolute right-2 top-[68%] h-28 w-28 rounded-full border border-white/10"
          animate={{ y: [0, 10, -6], rotate: [0, 3, -2] }}
          transition={{ ...floatTransition, duration: 7.2 }}
        />
        <div aria-hidden className="absolute left-7 top-[75%] text-[2.1rem] text-[#ff63c8]">
          *
        </div>
        <div
          aria-hidden
          className="absolute bottom-[9.5rem] right-[-1.5rem] h-28 w-56 rotate-[-13deg] bg-[radial-gradient(circle,_rgba(255,255,255,0.16),_rgba(255,255,255,0.03)_48%,_transparent_74%)] blur-lg"
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-[18%] h-72 w-72 -translate-x-1/2 rounded-full border border-white/10"
        animate={{ scale: [0.96, 1.04, 0.98], opacity: [0.3, 0.54, 0.4] }}
        transition={{ ...floatTransition, duration: 8.2 }}
      />
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-[18%] h-96 w-96 -translate-x-1/2 rounded-full border border-[#ff68ca]/18"
        animate={{ scale: [0.94, 1.02, 0.96], opacity: [0.2, 0.34, 0.24] }}
        transition={{ ...floatTransition, duration: 9.4 }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-x-10 bottom-30 h-44 rounded-full bg-[radial-gradient(circle,_rgba(255,102,200,0.52),_rgba(255,102,200,0.08)_55%,_transparent_75%)] blur-3xl"
        animate={{ y: [0, -12, 8], scaleX: [0.95, 1.03, 0.98] }}
        transition={{ ...floatTransition, duration: 6.4 }}
      />
      <div aria-hidden className="absolute left-9 top-[24%] text-[1.85rem] text-[#ff62c8]">
        *
      </div>
      <div aria-hidden className="absolute right-11 top-[29%] text-2xl text-white/75">
        *
      </div>
      <div
        aria-hidden
        className="absolute bottom-24 left-6 h-20 w-20 rounded-full border border-white/15"
      />
      <div
        aria-hidden
        className="absolute right-[-1.25rem] top-[58%] h-44 w-44 rounded-full border-[14px] border-[#7c3197]/45"
      />
    </>
  );
}
