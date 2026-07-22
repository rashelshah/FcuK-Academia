'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ThemeAnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const isDismissed = localStorage.getItem('theme-banner-dismissed-v1');
    const isOnboarding = localStorage.getItem('onboardingDone') !== 'true';
    if (!isDismissed && !isOnboarding) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible || pathname === '/settings/theme') return null;

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('theme-banner-dismissed-v1', 'true');
  };

  return (
    <div className="bg-surface/40 backdrop-blur-3xl border-b border-outline/40 shadow-sm relative z-50 transition-all duration-300">
      <div className="mx-auto flex max-w-[28rem] sm:max-w-[34rem] lg:max-w-[44rem] xl:max-w-[52rem] items-center justify-between px-4 py-3">
        <Link href="/settings/theme" className="flex items-center gap-3 flex-1 group" onClick={() => setIsVisible(false)}>
          <div className="bg-primary/20 border border-primary/30 p-1.5 rounded-full shrink-0 group-hover:bg-primary/30 transition-all group-hover:scale-105 duration-300">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <p className="font-headline text-on-surface text-sm sm:text-base font-bold tracking-wide flex items-center gap-2">
              new themes available
              <span className="bg-primary/20 text-primary text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider border border-primary/30">New</span>
            </p>
            <p className="font-body text-on-surface-variant text-[10px] sm:text-xs font-medium mt-0.5">
              Experience a fresh look. <span className="text-primary group-hover:text-on-surface transition-colors">Configure in settings &rarr;</span>
            </p>
          </div>
        </Link>
        <button 
          onClick={handleDismiss}
          className="ml-4 p-1.5 rounded-full hover:bg-surface-highest text-on-surface-variant hover:text-on-surface transition-all shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
