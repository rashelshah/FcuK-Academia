'use client';

import React, { useEffect, useMemo, useState } from 'react';

import {
  ENABLE_INTRO_SEQUENCE,
  getVariantIndex,
  introThemes,
  markCinematicSeen,
  shouldShowCinematic,
} from '@/lib/introConfig';
import CinematicIntro from '@/components/ui/CinematicIntro';

/**
 * Self-activating cinematic intro overlay.
 *
 * Does NOT depend on the popup chain (communityPopupDone / queueCinematic).
 * It activates itself after hydration if the feature flag is on and
 * shouldShowCinematic() is true. This makes it work reliably in production
 * regardless of popup cooldowns.
 */
export default function CinematicIntroOverlay() {
  const variantIndex = useMemo(() => getVariantIndex(), []);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only runs on the client, after hydration. In-memory flag ensures
    // it plays exactly once per app session regardless of localStorage/cooldowns.
    if (ENABLE_INTRO_SEQUENCE && shouldShowCinematic()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const theme = introThemes[variantIndex];

  const handleComplete = () => {
    markCinematicSeen(variantIndex);
    setShow(false);
  };

  return <CinematicIntro theme={theme} onComplete={handleComplete} />;
}

