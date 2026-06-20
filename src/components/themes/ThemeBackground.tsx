'use client';

import React from 'react';
import TekkenBackground from './TekkenBackground';
import TekkenHitSparks from './TekkenHitSparks';
import MissionControlBackground from './MissionControlBackground';
import type { ThemeType } from '@/lib/types';

interface ThemeBackgroundProps {
  theme: ThemeType;
}

export default function ThemeBackground({ theme }: ThemeBackgroundProps) {
  switch (theme) {
    case 'tekken':
      return (
        <>
          <TekkenBackground />
          <TekkenHitSparks />
        </>
      );
    case 'mission-control':
      return <MissionControlBackground />;
    default:
      return null;
  }
}
