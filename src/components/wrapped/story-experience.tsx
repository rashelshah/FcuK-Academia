"use client";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { GroupIcon, MobileCheckIcon, MoodIcon, TwinkleStarIcon } from "@/components/wrapped/icons";
import { NavigationButtons } from "@/components/wrapped/navigation-buttons";
import { StatCard } from "@/components/wrapped/stat-card";
import { StoryProgressBar } from "@/components/wrapped/story-progress-bar";
import { WrappedSlide } from "@/components/wrapped/wrapped-slide";
import vendharSquare from "@/components/wrapped/images/vendhar-square.png";
import ub from "@/components/wrapped/images/ub.png";
import tp from "@/components/wrapped/images/tp.png";
import tp2 from "@/components/wrapped/images/tp2.png";
import logo from "@/components/wrapped/images/logo.png";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";

const STORY_DURATION = 7.8;
const EASE = [0.22, 1, 0.36, 1] as const;

function BrandHeader() {
  return (
    <motion.div
      className="relative z-30 mb-5 w-full pt-2"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <div className="flex items-center justify-between px-2">
        <div className="rounded-full bg-[#0b0809] shadow-[0_8px_20px_rgba(0,0,0,0.25)] flex items-center justify-center overflow-hidden w-16 h-16 flex-shrink-0">
          <Image
            alt="FcuK Logo"
            className="h-full w-full object-cover scale-[1.05] translate-y-[2px]"
            style={{ imageRendering: "-webkit-optimize-contrast" }}
            src={logo}
            priority
          />
        </div>
        <div className="flex items-center gap-3 text-center text-white drop-shadow-md">
          <div className="leading-none text-right">
            <div className="font-[var(--font-kelly)] text-[1.2rem] tracking-[0.16em]">
              Rashel
            </div>
            <div className="font-[var(--font-keania)] text-[1.2rem] tracking-[0.1em] text-white/90">
              Shah
            </div>
          </div>
          <div className="font-[var(--font-kelly)] text-xl text-white/60">x</div>
          <div className="leading-none text-left">
            <div className="font-[var(--font-kelly)] text-[1.2rem] tracking-[0.16em]">
              Biswajit
            </div>
            <div className="font-[var(--font-keania)] text-[1.2rem] tracking-[0.1em] text-white/90">
              Sahu
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function IntroSlide() {
  return (
    <>
      <BrandHeader />
      <div className="relative flex flex-1 flex-col">
        <div className="absolute inset-x-[-1rem] bottom-0 z-0 h-[63%] rounded-t-[2.4rem] bg-[#090608] shadow-[0_-28px_100px_rgba(0,0,0,0.42)]" />
        <div className="absolute inset-x-0 top-[33.5%] z-10 h-20 bg-[linear-gradient(180deg,rgba(255,122,199,0.3),rgba(18,11,18,0.92)_68%,rgba(9,6,8,0))] blur-xl" />

        <motion.div
          className="absolute left-[-11%] top-[8%] z-10 w-[82%]"
          initial={{ opacity: 0, x: -24, y: 24 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.76, delay: 0.08, ease: EASE }}
        >
          <Image
            alt="Illustrated campus building"
            className="block h-auto w-full object-contain opacity-90"
            src={vendharSquare}
            priority
          />
        </motion.div>

        <motion.div
          className="absolute right-[-11%] top-[0%] z-0 w-[82%]"
          initial={{ opacity: 0, x: 20, y: 24 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.74, delay: 0.12, ease: EASE }}
        >
          <Image
            alt="Illustrated high rise"
            className="block h-auto w-full object-contain opacity-90"
            src={tp2}
            priority
          />
        </motion.div>

        <div className="relative z-20 pt-4">
          <motion.h1
            className="max-w-[13rem] text-balance font-[var(--font-madimi)] text-[2.5rem] leading-[0.88] tracking-[-0.06em] text-white text-shadow-glow"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
          >
            PYQ
            <span className="block font-[var(--font-imfell)] text-[2rem] tracking-wide text-[#fceaff]">
              Took Over
            </span>
          </motion.h1>
        </div>

        <motion.div
          className="absolute left-[0.5%] top-[51.8%] z-20"
          initial={{ opacity: 0, y: 32, rotate: -12 }}
          animate={{ opacity: 1, y: 0, rotate: -9 }}
          transition={{ duration: 0.85, delay: 0.22, ease: EASE }}
        >
          <StatCard
            className="max-w-[12.6rem]"
            title="PYQs Opened"
            value="2000+"
            icon={<GroupIcon />}
            tone="light"
          />
        </motion.div>

        <motion.div
          className="absolute right-[-0.5%] top-[65.8%] z-20"
          initial={{ opacity: 0, y: 38, rotate: 10 }}
          animate={{ opacity: 1, y: 0, rotate: 8 }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
        >
          <StatCard
            className="max-w-[12.5rem]"
            title="Most Visited Section"
            value="Lock In"
            icon={<MoodIcon />}
          />
        </motion.div>

      </div>
    </>
  );
}

function CitySlide() {
  return (
    <>
      <BrandHeader />
      <div className="relative flex flex-1 flex-col">
        <div className="absolute inset-x-0 top-0 h-[43%] bg-[linear-gradient(180deg,transparent_0%,transparent_28%,rgba(9,6,8,0.08)_100%)]" />

        <motion.div
          className="absolute left-[-11%] top-[16.4%] z-10 w-[88%]"
          initial={{ opacity: 0, x: -24, y: 24 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
        >
          <Image
            alt="Illustrated campus building"
            className="block h-auto w-full object-contain"
            src={ub}
            priority
          />
        </motion.div>

        <motion.div
          className="absolute right-[-19%] top-[8.2%] z-0 w-[80%]"
          initial={{ opacity: 0, x: 20, y: 24 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
        >
          <Image
            alt="Illustrated high rise"
            className="block h-auto w-full object-contain"
            src={tp}
            priority
          />
        </motion.div>

        <div className="absolute inset-x-[-1rem] bottom-0 z-0 h-[39%] rounded-t-[2.3rem] bg-[#090608] shadow-[0_-24px_90px_rgba(0,0,0,0.44)]" />
        <div className="absolute bottom-[7.4rem] right-[15%] z-10 h-24 w-36 rotate-[-13deg] bg-[linear-gradient(140deg,#ff78cd,#ed48b7)] opacity-95 [clip-path:polygon(48%_0%,58%_38%,100%_20%,68%_49%,100%_57%,60%_61%,74%_100%,48%_70%,26%_100%,39%_61%,0%_60%,31%_49%,0%_21%,41%_38%)]" />
        <div className="absolute left-8 top-[73.8%] z-10 text-[2rem] leading-none text-[#ff6dca]">*</div>
        <motion.div
          className="absolute left-4 bottom-[9.35rem] z-10 max-w-[12rem] rounded-[1.7rem] border border-white/10 bg-[rgba(20,16,22,0.82)] px-4 py-3 shadow-[0_18px_30px_rgba(0,0,0,0.35)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: EASE }}
        >
          <div className="font-[var(--font-imfell)] text-[1.25rem] leading-none text-white">
            Campus Pulse
          </div>
          <p className="mt-2 text-sm leading-6 text-white/68">
            Whole skyline looked like a revision montage.
          </p>
        </motion.div>

        <motion.div
          className="absolute left-[0.5%] top-[52.2%] z-20"
          initial={{ opacity: 0, y: 34, rotate: -10 }}
          animate={{ opacity: 1, y: 0, rotate: -8 }}
          transition={{ duration: 0.6, delay: 0.26, ease: EASE }}
        >
          <StatCard
            className="max-w-[12.6rem]"
            title="Number of Users"
            value="10K+"
            icon={<GroupIcon />}
            tone="light"
          />
        </motion.div>

        <motion.div
          className="absolute right-[-0.5%] top-[64.5%] z-20"
          initial={{ opacity: 0, y: 34, rotate: 13 }}
          animate={{ opacity: 1, y: 0, rotate: 12 }}
          transition={{ duration: 0.6, delay: 0.34, ease: EASE }}
        >
          <StatCard
            className="max-w-[12.5rem]"
            title="Page Views"
            value="60K+"
            icon={<MobileCheckIcon />}
          />
        </motion.div>
      </div>
    </>
  );
}

function OutroSlide() {
  return (
    <>
      <BrandHeader />
      <div className="relative flex flex-1 flex-col">
        <motion.div
          className="relative z-20 mt-10"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
        >
          <p className="mb-3 text-[0.76rem] uppercase tracking-[0.34em] text-white/65">
            See You Guys
          </p>
          <h2 className="max-w-[13rem] text-balance font-[var(--font-imfell)] text-[4rem] leading-[0.88] text-white text-shadow-soft">
            Semester
            <span className="block font-[var(--font-madimi)] text-[3.5rem] tracking-[-0.05em] text-[#ffd6f0]">
              Over.
            </span>
          </h2>
          <p className="mt-5 max-w-[15rem] text-pretty text-base leading-7 text-white/74">
            We are pulling up next semester louder, sharper, and still doing
            impossible comebacks five minutes before the deadline.
          </p>
        </motion.div>

        <motion.div
          className="relative z-20 mt-auto pb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22, ease: EASE }}
        >
          <div className="rounded-[2.25rem] border border-white/12 bg-[rgba(20,16,22,0.82)] p-5 shadow-[0_24px_46px_rgba(0,0,0,0.34)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-[var(--font-imfell)] text-[2rem] leading-none text-white">
                  See You Soon
                </div>
                <p className="mt-3 max-w-[12rem] text-sm leading-6 text-white/70">
                  Screenshots saved. Memories locked in. Semester officially wrapped.
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/12 bg-[#f169bf] text-[#0b0809]">
                <TwinkleStarIcon className="h-7 w-7" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

function StoryBackground() {
  return (
    <>
      {/* Base gradient — static, no animation needed */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,#70258c_0%,#9d36a2_10%,#dd5fbe_20%,#ff88cb_28%,#ff6ec2_33%,#201120_35%,#090608_100%)]"
      />
      {/* Overlay shimmer — opacity-only, GPU composited */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,170,225,0.2),rgba(255,105,201,0.02)_30%,rgba(138,53,170,0.18)_60%,rgba(255,149,219,0.08)_86%)] animate-wrapped-shimmer"
      />
      {/* Blob 1 — top center */}
      <div
        aria-hidden
        className="absolute inset-x-[-24%] top-[-16%] h-[44%] rounded-full bg-[radial-gradient(circle,_rgba(255,171,224,0.92),_rgba(250,92,182,0.62)_34%,_rgba(181,56,190,0.26)_64%,_transparent_78%)] blur-3xl animate-blob-drift-1"
      />
      {/* Blob 2 — top right */}
      <div
        aria-hidden
        className="absolute right-[-18%] top-[8%] h-[28%] w-[62%] rounded-full bg-[radial-gradient(circle,_rgba(255,203,233,0.7),_rgba(255,111,198,0.32)_50%,_transparent_78%)] blur-2xl animate-blob-drift-2"
      />
      {/* Blob 3 — top left */}
      <div
        aria-hidden
        className="absolute left-[-12%] top-[12%] h-[18%] w-[54%] rounded-full bg-[radial-gradient(circle,_rgba(255,122,199,0.45),_rgba(255,122,199,0.12)_55%,_transparent_80%)] blur-2xl animate-blob-drift-3"
      />
      {/* Blob 4 — upper mid */}
      <div
        aria-hidden
        className="absolute left-[14%] top-[2%] h-[16%] w-[72%] rounded-full bg-[radial-gradient(circle,_rgba(183,76,219,0.42),_rgba(183,76,219,0.08)_58%,_transparent_80%)] blur-2xl animate-blob-fade"
      />
      {/* Static radial overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.16),transparent_22%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_52%,rgba(255,105,201,0.18),transparent_26%)]" />
      <div className="absolute inset-x-0 top-[32.4%] h-16 bg-[linear-gradient(180deg,rgba(255,163,221,0.14),rgba(255,108,196,0.12)_32%,rgba(18,11,18,0.56)_72%,transparent)] blur-lg" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_24%,transparent_78%,rgba(255,255,255,0.03))]" />
    </>
  );
}

const slides = [
  {
    key: "intro",
    label: "Start Story",
    decoration: "intro" as const,
    render: () => <IntroSlide />
  },
  {
    key: "city",
    label: "Watch Next",
    decoration: "city" as const,
    render: () => <CitySlide />
  },
  {
    key: "outro",
    label: "The End",
    decoration: "outro" as const,
    render: () => <OutroSlide />
  }
];

const LAST_SLIDE_INDEX = slides.length - 1;

function clampIndex(index: number) {
  return Math.max(0, Math.min(LAST_SLIDE_INDEX, index));
}

export function StoryExperience() {
  const reducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const loopTokenRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);

  const { showIntro } = useTheme();
  const safeCurrentIndex = clampIndex(currentIndex);
  const activeSlide = useMemo(
    () => slides[safeCurrentIndex] ?? slides[0],
    [safeCurrentIndex]
  );
  const isPaused = reducedMotion || isHolding || isDocumentHidden || isCompleted || showIntro;

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const sources = [vendharSquare.src, tp2.src];
    const images = sources.map((src) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = src;
      return image;
    });

    const audio = new Audio("/music/background-track.mp3");
    audio.loop = false;
    audio.preload = "auto";
    audio.volume = 0.4;
    const handleAudioError = () => {
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
    audio.addEventListener("error", handleAudioError);
    audioRef.current = audio;

    return () => {
      images.forEach((image) => {
        image.src = "";
      });

      audio.removeEventListener("error", handleAudioError);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const goToSlide = (index: number) => {
    const nextIndex = clampIndex(index);
    if (nextIndex === safeCurrentIndex) {
      return;
    }

    setDirection(nextIndex > safeCurrentIndex ? 1 : -1);
    setCurrentIndex(nextIndex);
    setIsCompleted(false);
    setProgress(0);
    progressRef.current = 0;
    lastFrameRef.current = null;
  };

  const goNext = () => {
    if (safeCurrentIndex >= LAST_SLIDE_INDEX) {
      progressRef.current = 1;
      setProgress(1);
      setIsCompleted(true);
      return;
    }

    setIsHolding(false);
    goToSlide(safeCurrentIndex + 1);
  };

  const goPrev = () => {
    setIsHolding(false);
    goToSlide(safeCurrentIndex - 1);
  };

  useEffect(() => {
    const handleVisibility = () => {
      setIsDocumentHidden(document.hidden);
      if (!document.hidden) {
        lastFrameRef.current = null;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        goNext();
      }

      if (event.key === "ArrowLeft") {
        goPrev();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [safeCurrentIndex]);

  useEffect(() => {
    if (isPaused) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      return;
    }

    const loopToken = loopTokenRef.current + 1;
    loopTokenRef.current = loopToken;
    const durationMs = STORY_DURATION * 1000;

    const step = (timestamp: number) => {
      if (loopTokenRef.current !== loopToken) {
        return;
      }

      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }

      const delta = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;

      const next = progressRef.current + delta / durationMs;

      if (next >= 1) {
        if (safeCurrentIndex < LAST_SLIDE_INDEX) {
          progressRef.current = 0;
          setProgress(0);
          setDirection(1);
          setCurrentIndex((value) => clampIndex(value + 1));
          setIsCompleted(false);
          lastFrameRef.current = null;
          rafRef.current = null;
          return;
        }

        progressRef.current = 1;
        setProgress(1);
        setIsCompleted(true);
        rafRef.current = null;
        return;
      }

      progressRef.current = next;
      setProgress(next);
      rafRef.current = requestAnimationFrame(step);
    };

    lastFrameRef.current = null;
    rafRef.current = requestAnimationFrame(step);

    return () => {
      loopTokenRef.current += 1;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPaused, safeCurrentIndex]);

  useEffect(() => {
    if (!isHolding) {
      return;
    }

    const handlePointerRelease = () => {
      setIsHolding(false);
      lastFrameRef.current = null;

      if (!isCompleted && !isDocumentHidden && audioRef.current) {
        audioUnlockedRef.current = true;
        void audioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener("pointerup", handlePointerRelease);
    window.addEventListener("pointercancel", handlePointerRelease);

    return () => {
      window.removeEventListener("pointerup", handlePointerRelease);
      window.removeEventListener("pointercancel", handlePointerRelease);
    };
  }, [isCompleted, isDocumentHidden, isHolding]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPaused) {
      audio.pause();
      return;
    }

    if (!audioUnlockedRef.current) {
      return;
    }

    void audio.play().catch(() => {});
  }, [isPaused, safeCurrentIndex]);

  const handleDragStart = () => {
    setIsHolding(true);
  };

  const handleDragEnd = (info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const thresholdReached = Math.abs(offset) > 80 || Math.abs(velocity) > 500;

    if (thresholdReached) {
      if (offset < 0 || velocity < -500) {
        goNext();
      } else {
        goPrev();
      }
    } else {
      setIsHolding(false);
      lastFrameRef.current = null;
    }
  };

  const handlePressStart = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    setIsHolding(true);
    lastFrameRef.current = null;
  };

  return (
    <main
      className="story-no-scrollbar relative mx-auto h-[100svh] w-full max-w-screen-sm overflow-hidden bg-[#090608] text-white"
      style={{
        isolation: "isolate",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
      }}
      onPointerDownCapture={handlePressStart}
    >
      <StoryBackground />
      <StoryProgressBar
        currentIndex={safeCurrentIndex}
        progress={progress}
        total={slides.length}
      />

      <AnimatePresence initial={false} mode="sync" custom={direction}>
        <WrappedSlide
          key={activeSlide.key}
          decorationVariant={activeSlide.decoration}
          direction={direction}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          onNext={goNext}
          onPrev={goPrev}
        >
          {activeSlide.render()}
          <NavigationButtons
            disableNext={safeCurrentIndex === LAST_SLIDE_INDEX}
            disablePrev={safeCurrentIndex === 0}
            hideNext={safeCurrentIndex === LAST_SLIDE_INDEX}
            hidePrev={safeCurrentIndex === 0}
            label={activeSlide.label}
            onNext={goNext}
            onPrev={goPrev}
          />
        </WrappedSlide>
      </AnimatePresence>
    </main>
  );
}
