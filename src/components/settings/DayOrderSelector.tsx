'use client';

import React, { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import { cn } from '@/lib/utils';

const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'];

export default function DayOrderSelector() {
  const [selected, setSelected] = useState('Day 1');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-primary">active day order</h3>
      <div className="grid grid-cols-3 gap-3">
        {days.map((day) => (
          <GlassCard
            key={day}
            onClick={() => setSelected(day)}
            className={cn(
              "p-4 text-center cursor-pointer border-2 transition-all",
              selected === day ? "border-primary bg-primary/10" : "border-outline/5"
            )}
          >
            <span className={cn(
               "font-headline text-lg",
               selected === day ? "text-primary" : "text-on-surface-variant"
            )}>{day}</span>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
