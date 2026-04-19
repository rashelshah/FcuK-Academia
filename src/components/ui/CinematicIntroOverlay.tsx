'use client';

import React, { useEffect, useMemo } from 'react';

import {
  ENABLE_INTRO_SEQUENCE,
  getVariantIndex,
  introThemes,
  markCinematicSeen,
  shouldShowCinematic,
} from '@/lib/introConfig';
import CinematicIntro from '@/components/ui/CinematicIntro';

import { useTheme } from '@/context/ThemeContext';

/**
 * Orchestrator layer.
 *
 * Responsibilities:
 *  - Checks NEXT_PUBLIC_ENABLE_INTRO_SEQUENCE feature flag
 *  - Checks the 24-hour localStorage gate
 *  - Selects the daily variant via UTC-day rotation
 *  - Mounts <CinematicIntro> with the correct theme
 *  - Calls dismissCinematic immediately when the intro should be skipped
 *  - Calls dismissCinematic after the cinematic finishes
 */
export default function CinematicIntroOverlay() {
  const { cinematicQueued, dismissCinematic } = useTheme();
  const variantIndex = useMemo(() => getVariantIndex(), []);

  // Computed synchronously to avoid an extra render cycle on the skip path.
  const active = useMemo(
    () => ENABLE_INTRO_SEQUENCE && shouldShowCinematic(),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // When the flag/gate says skip, fire dismissCinematic after first paint.
  useEffect(() => {
    if (cinematicQueued && !active) {
      dismissCinematic();
    }
  }, [active, cinematicQueued, dismissCinematic]);

  if (!cinematicQueued || !active) return null;

  const theme = introThemes[variantIndex];

  const handleComplete = () => {
    markCinematicSeen(variantIndex);
    dismissCinematic();
  };

  return <CinematicIntro theme={theme} onComplete={handleComplete} />;
}
