'use client';

import { motion } from 'framer-motion';

import { useTheme } from '@/context/ThemeContext';
import { getInteractiveMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface DayOrderPillsProps {
  days: number[];
  activeDayOrder: number | null;
  onSelect: (day: number) => void;
  className?: string;
}

export default function DayOrderPills({
  days,
  activeDayOrder,
  onSelect,
  className,
}: DayOrderPillsProps) {
  const { themeConfig } = useTheme();
  const motionProps = getInteractiveMotion(themeConfig.motion);

  return (
    <div className={cn('flex min-w-max gap-3', className)}>
      {days.map((day) => {
        const active = activeDayOrder === day;

        return (
          <motion.button
            key={day}
            type="button"
            onClick={() => onSelect(day)}
            whileHover={motionProps.whileHover}
            whileTap={motionProps.whileTap}
            transition={motionProps.transition}
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border font-headline text-xl font-bold transition-all',
              active ? 'text-[var(--text-inverse)] shadow-[var(--glow-primary)]' : 'text-on-surface-variant',
            )}
            style={
              active
                ? {
                    backgroundColor: 'var(--primary)',
                    borderColor: 'var(--primary)',
                  }
                : {
                    background: 'var(--surface-card-soft)',
                    borderColor: 'var(--card-border)',
                  }
            }
          >
            {day}
          </motion.button>
        );
      })}
    </div>
  );
}
