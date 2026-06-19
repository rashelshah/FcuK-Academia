'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface ProgressBarProps {
  value: number; // 0 to 100
  color?: string;
  className?: string;
  showText?: boolean;
}

export default function ProgressBar({
  value,
  color = 'var(--primary)',
  className,
  showText = true,
}: ProgressBarProps) {
  const { theme } = useTheme();
  const isTekken = theme === 'tekken';
  const isDanger = isTekken && value < 25;

  return (
    <div className={cn("w-full space-y-2", className)}>
      {showText && (
        <div className="flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant sm:text-xs">
          <span>{isTekken ? 'POWER LEVEL' : 'PROGRESS'}</span>
          <span>{value.toFixed(2)}%</span>
        </div>
      )}
      <div
        className="relative h-[14px] w-full overflow-hidden rounded-full theme-progress-track"
        style={{
          background: 'color-mix(in srgb, var(--surface-soft) 92%, transparent)',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{ 
            width: `${value}%`,
            backgroundColor: color,
            boxShadow: `0 0 16px ${color}`,
          }}
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out theme-progress-fill",
            isDanger && "animate-health-pulse"
          )}
        />
      </div>
      <style jsx>{`
        @keyframes healthPulse {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.6; filter: brightness(1.5); }
        }
        .animate-health-pulse {
          animation: healthPulse 0.8s ease-in-out infinite;
          will-change: opacity, filter;
        }
      `}</style>
    </div>
  );
}
