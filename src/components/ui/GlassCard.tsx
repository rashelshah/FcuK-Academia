'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-[28px] bg-[#121212] border border-[#2a2a2a] overflow-hidden p-6 md:p-8 shadow-xl",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}


