'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'brutalist' | 'ghost';
  fullWidth?: boolean;
}

export default function Button({
  children,
  className,
  variant = 'primary',
  fullWidth = false,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-primary-container text-[#324A00] font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity drop-shadow-[0_0_15px_rgba(182,255,0,0.5)]",
    secondary: "bg-secondary text-background font-bold rounded-full px-8 py-3 hover:opacity-90 drop-shadow-[0_0_15px_rgba(0,224,255,0.5)]",
    brutalist: "bg-surface-low border-2 border-error text-error p-8 rounded-xl font-headline text-3xl font-bold lowercase tracking-tighter shadow-[4px_4px_0px_0px_var(--error)] hover:bg-error hover:text-background flex items-center justify-center gap-4 transition-all duration-200",
    ghost: "text-primary font-bold lowercase tracking-tight hover:underline underline-offset-4",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "transition-transform inline-flex items-center justify-center",
        variants[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
