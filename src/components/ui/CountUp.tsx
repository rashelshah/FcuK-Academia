'use client';

import React, { useEffect, useRef, useState } from 'react';

// Global cache ensures values only animate from zero ONCE per app session.
// Soft navigations will immediately display the final state seamlessly.
const countedValuesCache = new Set<string>();

interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  renderFormatted?: (formatted: string) => React.ReactNode;
}

function formatValue(value: number, decimals: number) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function CountUp({
  value,
  duration = 900,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  renderFormatted,
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // A robust cache key strictly blocks redundant runs on intra-app routing
    const cacheKey = `${value}-${duration}`;

    if (countedValuesCache.has(cacheKey)) {
      // Safely clamp it to its final value instead of re-animating
      setDisplayValue(value);
      return; 
    }
    
    // Register the count-up occurrence perfectly inside the closure cleanly
    countedValuesCache.add(cacheKey);

    const startValue = 0;
    const startTime = performance.now();

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + (value - startValue) * eased;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [duration, value]); // Strict dependency list prevents mid-animation aborts!

  const formatted = `${prefix}${formatValue(displayValue, decimals)}${suffix}`;

  return (
    <span className={className}>
      {renderFormatted ? renderFormatted(formatted) : formatted}
    </span>
  );
}
