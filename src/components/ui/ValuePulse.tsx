'use client';

import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

interface ValuePulseProps {
  value: any;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function ValuePulse({ value, children, className, style }: ValuePulseProps) {
  const { themeConfig } = useTheme();
  const controls = useAnimation();
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue && themeConfig.id === 'mission-control') {
      controls.start({
        scale: [1, 1.05, 1],
        textShadow: [
          '0 0 0px transparent',
          '0 0 20px rgba(0, 229, 255, 0.8), 0 0 40px rgba(0, 229, 255, 0.4)',
          '0 0 0px transparent',
        ],
        transition: { duration: 0.8, ease: 'easeOut' },
      });
      setPrevValue(value);
    }
  }, [value, prevValue, themeConfig.id, controls]);

  return (
    <motion.div animate={controls} className={className} style={style}>
      {children}
    </motion.div>
  );
}
