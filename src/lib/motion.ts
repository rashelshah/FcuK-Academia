import { Transition, Variants } from 'framer-motion';

import { ThemeMotionPreset } from '@/lib/types';

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const motionPresets = {
  darkSmooth: {
    id: 'dark-smooth',
    page: {
      distance: 28,
      scale: 0.985,
      blur: 0,
      fadeDuration: 0.26,
      spring: { stiffness: 360, damping: 34, mass: 0.84 },
    },
    swipe: {
      threshold: 72,
      velocityThreshold: 0.34,
      distance: 34,
      scale: 0.985,
      spring: { stiffness: 360, damping: 34, mass: 0.84 },
      fadeDuration: 0.24,
    },
    reveal: {
      y: 18,
      blur: 0,
      scale: 0.986,
      stagger: 0.055,
      delay: 0.03,
      duration: 0.32,
      ease: easeOut,
    },
    micro: {
      tapScale: 0.96,
      hoverScale: 1.012,
      hoverY: -1,
      duration: 0.22,
    },
    route: {
      panelTravel: 118,
      panelScale: 0.94,
      panelOpacity: 0.26,
      duration: 0.46,
      labelDuration: 0.28,
    },
    intro: {
      logoScale: 1.03,
      glowScale: 1.08,
      duration: 0.9,
      delay: 0.12,
    },
  },
  neonBrutalist: {
    id: 'neon-brutalist',
    page: {
      distance: 34,
      scale: 0.972,
      blur: 0,
      fadeDuration: 0.2,
      spring: { stiffness: 480, damping: 36, mass: 0.72 },
    },
    swipe: {
      threshold: 68,
      velocityThreshold: 0.3,
      distance: 40,
      scale: 0.972,
      spring: { stiffness: 520, damping: 38, mass: 0.72 },
      fadeDuration: 0.2,
    },
    reveal: {
      y: 22,
      blur: 0,
      scale: 0.972,
      stagger: 0.04,
      delay: 0.02,
      duration: 0.22,
      ease: easeOut,
    },
    micro: {
      tapScale: 0.95,
      hoverScale: 1.03,
      hoverY: -1,
      duration: 0.16,
    },
    route: {
      panelTravel: 126,
      panelScale: 0.92,
      panelOpacity: 0.3,
      duration: 0.38,
      labelDuration: 0.22,
    },
    intro: {
      logoScale: 1.08,
      glowScale: 1.14,
      duration: 0.78,
      delay: 0.08,
    },
  },
  lightMinimal: {
    id: 'light-minimal',
    page: {
      distance: 20,
      scale: 0.994,
      blur: 0,
      fadeDuration: 0.28,
      spring: { stiffness: 300, damping: 30, mass: 0.9 },
    },
    swipe: {
      threshold: 72,
      velocityThreshold: 0.34,
      distance: 24,
      scale: 0.994,
      spring: { stiffness: 300, damping: 30, mass: 0.9 },
      fadeDuration: 0.24,
    },
    reveal: {
      y: 14,
      blur: 0,
      scale: 0.998,
      stagger: 0.05,
      delay: 0.03,
      duration: 0.28,
      ease: easeOut,
    },
    micro: {
      tapScale: 0.97,
      hoverScale: 1.008,
      hoverY: -1,
      duration: 0.22,
    },
    route: {
      panelTravel: 108,
      panelScale: 0.96,
      panelOpacity: 0.18,
      duration: 0.5,
      labelDuration: 0.32,
    },
    intro: {
      logoScale: 1.02,
      glowScale: 1.04,
      duration: 0.72,
      delay: 0.08,
    },
  },
  claySoft: {
    id: 'clay-soft',
    page: {
      distance: 18,
      scale: 0.988,
      blur: 0,
      fadeDuration: 0.32,
      spring: { stiffness: 260, damping: 28, mass: 0.94 },
    },
    swipe: {
      threshold: 70,
      velocityThreshold: 0.32,
      distance: 20,
      scale: 0.988,
      spring: { stiffness: 260, damping: 28, mass: 0.94 },
      fadeDuration: 0.28,
    },
    reveal: {
      y: 16,
      blur: 0,
      scale: 0.992,
      stagger: 0.058,
      delay: 0.04,
      duration: 0.34,
      ease: easeOut,
    },
    micro: {
      tapScale: 0.97,
      hoverScale: 1.01,
      hoverY: -1,
      duration: 0.22,
    },
    route: {
      panelTravel: 104,
      panelScale: 0.96,
      panelOpacity: 0.2,
      duration: 0.52,
      labelDuration: 0.32,
    },
    intro: {
      logoScale: 1.03,
      glowScale: 1.05,
      duration: 0.84,
      delay: 0.1,
    },
  },
  elegantFloat: {
    id: 'elegant-float',
    page: {
      distance: 22,
      scale: 0.992,
      blur: 0,
      fadeDuration: 0.34,
      spring: { stiffness: 270, damping: 30, mass: 0.96 },
    },
    swipe: {
      threshold: 70,
      velocityThreshold: 0.32,
      distance: 24,
      scale: 0.992,
      spring: { stiffness: 270, damping: 30, mass: 0.96 },
      fadeDuration: 0.3,
    },
    reveal: {
      y: 18,
      blur: 0,
      scale: 0.994,
      stagger: 0.066,
      delay: 0.05,
      duration: 0.38,
      ease: easeOut,
    },
    micro: {
      tapScale: 0.97,
      hoverScale: 1.014,
      hoverY: -2,
      duration: 0.24,
    },
    route: {
      panelTravel: 110,
      panelScale: 0.95,
      panelOpacity: 0.22,
      duration: 0.54,
      labelDuration: 0.34,
    },
    intro: {
      logoScale: 1.04,
      glowScale: 1.08,
      duration: 0.92,
      delay: 0.14,
    },
  },
  playfulPop: {
    id: 'playful-pop',
    page: {
      distance: 30,
      scale: 0.978,
      blur: 0,
      fadeDuration: 0.22,
      spring: { stiffness: 540, damping: 36, mass: 0.72 },
    },
    swipe: {
      threshold: 66,
      velocityThreshold: 0.28,
      distance: 42,
      scale: 0.972,
      spring: { stiffness: 580, damping: 38, mass: 0.68 },
      fadeDuration: 0.2,
    },
    reveal: {
      y: 20,
      blur: 0,
      scale: 0.98,
      stagger: 0.046,
      delay: 0.02,
      duration: 0.24,
      ease: easeOut,
    },
    micro: {
      tapScale: 0.95,
      hoverScale: 1.026,
      hoverY: -2,
      duration: 0.16,
    },
    route: {
      panelTravel: 134,
      panelScale: 0.9,
      panelOpacity: 0.32,
      duration: 0.34,
      labelDuration: 0.2,
    },
    intro: {
      logoScale: 1.08,
      glowScale: 1.16,
      duration: 0.76,
      delay: 0.08,
    },
  },
  royalVelvet: {
    id: 'royal-velvet',
    page: {
      distance: 24,
      scale: 0.986,
      blur: 0,
      fadeDuration: 0.3,
      spring: { stiffness: 320, damping: 32, mass: 0.88 },
    },
    swipe: {
      threshold: 72,
      velocityThreshold: 0.32,
      distance: 30,
      scale: 0.984,
      spring: { stiffness: 340, damping: 34, mass: 0.82 },
      fadeDuration: 0.26,
    },
    reveal: {
      y: 18,
      blur: 0,
      scale: 0.99,
      stagger: 0.052,
      delay: 0.04,
      duration: 0.32,
      ease: easeOut,
    },
    micro: {
      tapScale: 0.965,
      hoverScale: 1.014,
      hoverY: -1,
      duration: 0.2,
    },
    route: {
      panelTravel: 114,
      panelScale: 0.94,
      panelOpacity: 0.24,
      duration: 0.48,
      labelDuration: 0.28,
    },
    intro: {
      logoScale: 1.05,
      glowScale: 1.1,
      duration: 0.88,
      delay: 0.12,
    },
  },
  freshBreeze: {
    id: 'fresh-breeze',
    page: {
      distance: 18,
      scale: 0.994,
      blur: 0,
      fadeDuration: 0.28,
      spring: { stiffness: 290, damping: 28, mass: 0.92 },
    },
    swipe: {
      threshold: 70,
      velocityThreshold: 0.34,
      distance: 22,
      scale: 0.992,
      spring: { stiffness: 300, damping: 30, mass: 0.9 },
      fadeDuration: 0.24,
    },
    reveal: {
      y: 14,
      blur: 0,
      scale: 0.996,
      stagger: 0.05,
      delay: 0.03,
      duration: 0.28,
      ease: easeOut,
    },
    micro: {
      tapScale: 0.97,
      hoverScale: 1.01,
      hoverY: -1,
      duration: 0.22,
    },
    route: {
      panelTravel: 106,
      panelScale: 0.96,
      panelOpacity: 0.18,
      duration: 0.48,
      labelDuration: 0.3,
    },
    intro: {
      logoScale: 1.025,
      glowScale: 1.05,
      duration: 0.76,
      delay: 0.08,
    },
  },
} satisfies Record<string, ThemeMotionPreset>;

function createFadeTransition(duration: number): Transition {
  return {
    duration,
    ease: easeOut,
  };
}

export function getPageMotion(motion: ThemeMotionPreset, direction: number) {
  const horizontalLead = direction === 0 ? 0 : direction * Math.max(10, motion.page.distance * 0.46);
  const horizontalExit = direction === 0 ? 0 : direction * -Math.max(12, motion.swipe.distance * 0.34);
  const springTransition = {
    type: 'spring' as const,
    ...motion.page.spring,
  };

  return {
    initial: {
      opacity: 0,
      x: horizontalLead,
      y: Math.max(14, motion.page.distance * 0.42),
      scale: motion.page.scale,
      rotateZ: direction === 0 ? 0 : direction * 0.4,
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotateZ: 0,
    },
    exit: {
      opacity: 0,
      x: horizontalExit,
      y: Math.max(10, motion.swipe.distance * 0.3),
      scale: motion.swipe.scale,
      rotateZ: direction === 0 ? 0 : direction * -0.3,
    },
    transition: {
      x: springTransition,
      y: springTransition,
      scale: createFadeTransition(motion.page.fadeDuration),
      opacity: createFadeTransition(motion.page.fadeDuration),
      rotateZ: createFadeTransition(Math.max(0.18, motion.page.fadeDuration - 0.06)),
    },
  };
}

export function getRouteOverlayMotion(motion: ThemeMotionPreset, direction: number) {
  const signedDirection = direction === 0 ? 1 : direction;
  const travel = motion.route.panelTravel * signedDirection;

  return {
    veil: {
      initial: {
        opacity: 0,
        scaleX: 0.92,
        x: `${travel}%`,
      },
      animate: {
        opacity: motion.route.panelOpacity,
        scaleX: 1,
        x: '0%',
      },
      exit: {
        opacity: 0,
        scaleX: motion.route.panelScale,
        x: `${travel * -0.24}%`,
      },
      transition: {
        duration: motion.route.duration,
        ease: easeOut,
      } satisfies Transition,
    },
    glow: {
      initial: {
        opacity: 0,
        x: `${travel * 0.82}%`,
      },
      animate: {
        opacity: Math.min(0.44, motion.route.panelOpacity + 0.08),
        x: '0%',
      },
      exit: {
        opacity: 0,
        x: `${travel * -0.12}%`,
      },
      transition: {
        duration: motion.route.duration + 0.04,
        ease: easeOut,
      } satisfies Transition,
    },
    label: {
      initial: {
        opacity: 0,
        y: 16,
        x: signedDirection * 12,
      },
      animate: {
        opacity: 1,
        y: 0,
        x: 0,
      },
      exit: {
        opacity: 0,
        y: -8,
        x: signedDirection * -8,
      },
      transition: {
        duration: motion.route.labelDuration,
        ease: easeOut,
      } satisfies Transition,
    },
  };
}

export function getRevealContainerVariants(motion: ThemeMotionPreset): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: motion.reveal.stagger,
        delayChildren: motion.reveal.delay,
      },
    },
  };
}

export function getRevealVariants(motion: ThemeMotionPreset) {
  const baseHidden = {
    opacity: 0,
    y: motion.reveal.y,
    scale: motion.reveal.scale,
  };
  const baseVisible = {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: motion.reveal.duration,
      ease: motion.reveal.ease,
    },
  };

  return {
    heading: {
      hidden: baseHidden,
      visible: baseVisible,
    },
    text: {
      hidden: {
        opacity: 0,
        y: Math.max(10, motion.reveal.y - 4),
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: Math.max(0.2, motion.reveal.duration - 0.04),
          ease: motion.reveal.ease,
        },
      },
    },
    item: {
      hidden: baseHidden,
      visible: baseVisible,
    },
  };
}

export function getInteractiveMotion(motion: ThemeMotionPreset) {
  return {
    whileHover: {
      scale: motion.micro.hoverScale,
      y: motion.micro.hoverY,
    },
    whileTap: {
      scale: motion.micro.tapScale,
      y: 0,
    },
    transition: {
      duration: motion.micro.duration,
      ease: easeOut,
    } satisfies Transition,
  };
}
