"use client";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { GroupIcon, MobileCheckIcon, MoodIcon, TwinkleStarIcon } from "@/components/wrapped/icons";
import { NavigationButtons } from "@/components/wrapped/navigation-buttons";
import { StatCard } from "@/components/wrapped/stat-card";
import { StoryProgressBar } from "@/components/wrapped/story-progress-bar";
import { WrappedSlide } from "@/components/wrapped/wrapped-slide";
import vendharSquare from "@/components/wrapped/images/vendhar-square.png";
import tp2 from "@/components/wrapped/images/tp2.png";
import logo from "@/components/wrapped/images/logo.png";

const STORY_DURATION = 7.8;
const EASE = [0.22, 1, 0.36, 1] as const;

const FIGMA_ASSETS = {
  leftBuilding: "/images/building-left.png",
  rightTower:
    "https://www.figma.com/api/mcp/asset/dcb4da29-33bd-497b-ab61-1c0d4e4e4ae5"
};

function BrandHeader() {
  return (
    <motion.div
      className="relative z-30 mb-5"
      initial={{ opacity: 0, y: -18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className="rounded-b-[1.7rem] rounded-t-[0.9rem] border border-white/16 bg-[linear-gradient(90deg,rgba(116,43,151,0.82),rgba(39,6,60,0.75))] px-3 py-3 shadow-[0_18px_32px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="grid grid-cols-[auto_1fr] items-center gap-4">
          <div className="rounded-[1rem] border border-white/14 bg-[#0b0809] shadow-[0_8px_20px_rgba(0,0,0,0.25)] flex items-center justify-center overflow-hidden w-12 h-12 flex-shrink-0">
            <img
              alt="FcuK Logo"
              className="h-18 w-18 object-cover flex-shrink-0"
              style={{ imageRendering: "-webkit-optimize-contrast" }}
              src={logo.src}
            />
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-[#0b0809]">
            <div className="leading-none">
              <div className="font-[var(--font-kelly)] text-[1.15rem] tracking-[0.16em]">
                Rashel
              </div>
              <div className="font-[var(--font-keania)] text-[1.15rem] tracking-[0.1em]">
                Shah
              </div>
            </div>
            <div className="font-[var(--font-kelly)] text-xl text-black/85">x</div>
            <div className="leading-none">
              <div className="font-[var(--font-kelly)] text-[1.15rem] tracking-[0.16em]">
                Biswajit
              </div>
              <div className="font-[var(--font-keania)] text-[1.15rem] tracking-[0.1em]">
                Sahu
              </div>
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
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="absolute inset-x-[-1rem] bottom-0 z-0 h-[63%] rounded-t-[2.4rem] bg-[#090608] shadow-[0_-28px_100px_rgba(0,0,0,0.42)]" />
        <div className="absolute inset-x-0 top-[33.5%] z-10 h-20 bg-[linear-gradient(180deg,rgba(255,122,199,0.3),rgba(18,11,18,0.92)_68%,rgba(9,6,8,0))] blur-xl" />

        <motion.div
          className="absolute left-[-5.5%] top-[8%] z-10 w-[75%]"
          initial={{ opacity: 0, x: -24, y: 24 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.76, delay: 0.08, ease: EASE }}
        >
          <img
            alt="Illustrated campus building"
            className="block h-auto w-full object-contain opacity-90"
            height={560}
            src={vendharSquare.src}
            width={447}
          />
        </motion.div>

        <motion.div
          className="absolute right-[0%] top-[0%] z-0 w-[75%]"
          initial={{ opacity: 0, x: 20, y: 24 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.74, delay: 0.12, ease: EASE }}
        >
          <img
            alt="Illustrated high rise"
            className="block h-auto w-full object-contain opacity-90"
            height={558}
            src={tp2.src}
            width={447}
          />
        </motion.div>

        <div className="relative z-20 pt-4">
          <motion.h1
            className="max-w-[13rem] text-balance font-[var(--font-madimi)] text-[2.5rem] leading-[0.88] tracking-[-0.06em] text-white text-shadow-glow"
            initial={{ opacity: 0, y: 22, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, delay: 0.08, ease: EASE }}
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
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[43%] bg-[linear-gradient(180deg,transparent_0%,transparent_28%,rgba(9,6,8,0.08)_100%)]" />

        <motion.div
          className="absolute left-[-5.5%] top-[16.4%] z-10 w-[83%]"
          initial={{ opacity: 0, x: -24, y: 24 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.76, delay: 0.08, ease: EASE }}
        >
          <img
            alt="Illustrated campus building"
            className="block h-auto w-full object-contain"
            height={560}
            src={FIGMA_ASSETS.leftBuilding}
            width={447}
          />
        </motion.div>

        <motion.div
          className="absolute right-[-19%] top-[8.2%] z-0 w-[74%]"
          initial={{ opacity: 0, x: 20, y: 24 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.74, delay: 0.12, ease: EASE }}
        >
          <img
            alt="Illustrated high rise"
            className="block h-auto w-full object-contain"
            height={558}
            src={FIGMA_ASSETS.rightTower}
            width={447}
          />
        </motion.div>

        <div className="absolute inset-x-[-1rem] bottom-0 z-0 h-[39%] rounded-t-[2.3rem] bg-[#090608] shadow-[0_-24px_90px_rgba(0,0,0,0.44)]" />
        <div className="absolute bottom-[7.4rem] right-[15%] z-10 h-24 w-36 rotate-[-13deg] bg-[linear-gradient(140deg,#ff78cd,#ed48b7)] opacity-95 [clip-path:polygon(48%_0%,58%_38%,100%_20%,68%_49%,100%_57%,60%_61%,74%_100%,48%_70%,26%_100%,39%_61%,0%_60%,31%_49%,0%_21%,41%_38%)]" />
        <div className="absolute left-8 top-[73.8%] z-10 text-[2rem] leading-none text-[#ff6dca]">*</div>
        <motion.div
          className="absolute left-4 bottom-[9.35rem] z-10 max-w-[12rem] rounded-[1.7rem] border border-white/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-4 py-3 shadow-[0_18px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.72, delay: 0.18, ease: EASE }}
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
          transition={{ duration: 0.85, delay: 0.26, ease: EASE }}
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
          transition={{ duration: 0.88, delay: 0.34, ease: EASE }}
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
          initial={{ opacity: 0, y: 22, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.05, ease: EASE }}
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
          transition={{ duration: 0.8, delay: 0.22, ease: EASE }}
        >
          <div className="rounded-[2.25rem] border border-white/12 bg-[linear-gradient(140deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_46px_rgba(0,0,0,0.34)] backdrop-blur-xl">
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

  const safeCurrentIndex = clampIndex(currentIndex);
  const activeSlide = useMemo(
    () => slides[safeCurrentIndex] ?? slides[0],
    [safeCurrentIndex]
  );
  const isPaused = reducedMotion || isHolding || isDocumentHidden || isCompleted;

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const sources = [FIGMA_ASSETS.leftBuilding, FIGMA_ASSETS.rightTower];
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
      onPointerDownCapture={handlePressStart}
    >
      <StoryProgressBar
        currentIndex={safeCurrentIndex}
        progress={progress}
        total={slides.length}
      />

      <AnimatePresence initial={false} mode="wait" custom={direction}>
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
