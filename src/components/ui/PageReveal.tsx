'use client';

import React, { PropsWithChildren, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.03,
    },
  },
};

const headlineVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.28,
    },
  },
};

const textVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.26,
    },
  },
};

function useMountedAnimation() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return mounted;
}

export function PageReveal({ children, className }: PropsWithChildren<{ className?: string }>) {
  const mounted = useMountedAnimation();

  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealHeading({ children, className }: PropsWithChildren<{ className?: string }>) {
  const mounted = useMountedAnimation();

  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={headlineVariants}
      className={cn(className, 'will-change-transform')}
      style={{ textShadow: '0 0 18px rgba(163,255,18,0.08)' }}
    >
      {children}
    </motion.div>
  );
}

export function RevealText({ children, className }: PropsWithChildren<{ className?: string }>) {
  const mounted = useMountedAnimation();

  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={textVariants} className={cn(className, 'will-change-transform')}>
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: PropsWithChildren<{ className?: string }>) {
  const mounted = useMountedAnimation();

  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={itemVariants} className={cn(className, 'will-change-transform')}>
      {children}
    </motion.div>
  );
}
