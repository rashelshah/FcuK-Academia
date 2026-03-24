'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: 'primary' | 'secondary' | 'error';
  borderStyle?: 'solid' | 'dashed' | 'dotted';
}

export default function GlowCard({ 
  children, 
  glowColor = 'primary', 
  borderStyle = 'solid',
  className, 
  ...props 
}: GlowCardProps) {
  const glowClasses = {
    primary: 'glow-primary border-primary/50',
    secondary: 'glow-secondary border-secondary/50',
    error: 'glow-error border-error/50',
  };

  return (
    <div
      className={cn(
        "relative rounded-[28px] bg-[#0c0c0c] border-[2px]",
        glowClasses[glowColor],
        borderStyle === 'dashed' && 'border-dashed',
        borderStyle === 'dotted' && 'border-dotted',
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none rounded-[28px]" />
      <div className="relative z-10 w-full h-full p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}
