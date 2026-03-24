'use client';

import React from 'react';
import { cn } from '@/lib/utils';

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
  return (
    <div className={cn("w-full space-y-2", className)}>
      {showText && (
        <div className="flex justify-between items-center text-[10px] sm:text-xs font-label uppercase tracking-widest text-[#adaaaa] px-1 font-semibold">
          <span>PROGRESS</span>
          <span>{value}%</span>
        </div>
      )}
      <div className="h-[14px] w-full bg-[#1e1e1e] rounded-full overflow-hidden relative">
        <div
          style={{ 
            width: `${value}%`,
            backgroundColor: color,
            boxShadow: `0 0 16px ${color}`
          }}
          className="h-full rounded-full transition-all duration-1000 ease-out"
        />
      </div>
    </div>
  );
}
