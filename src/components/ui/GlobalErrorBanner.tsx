'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';
import { useDashboardDataContext } from '@/context/DashboardDataContext';

export default function GlobalErrorBanner() {
  const { error } = useDashboardDataContext();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(true);

  useEffect(() => {
    setIsOnboarding(localStorage.getItem('onboardingDone') !== 'true');
  }, []);

  if (isOnboarding || !error) return null;

  async function handleLogOut() {
    try {
      setLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore errors and force redirect anyway
    } finally {
      window.location.href = '/login';
    }
  }

  return (
    <div className="bg-[#dc2626] border-b border-[#b91c1c] px-4 py-3 shadow-[0_4px_24px_rgba(220,38,38,0.4)] relative z-50">
      <div className="mx-auto flex max-w-[28rem] sm:max-w-[34rem] lg:max-w-[44rem] xl:max-w-[52rem] flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-full shrink-0">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-headline text-white font-bold text-base leading-tight">
              Action Required: {error.includes('expired') ? 'Session Expired' : 'Data Sync Error'}
            </h3>
            <p className="font-body text-white/90 text-xs mt-0.5">
              {error.toLowerCase().includes('log in again')
                ? 'Your session has ended. Please log in again to sync live academia data.'
                : error}
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogOut}
          disabled={loggingOut}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-2 font-label text-[10px] font-bold uppercase tracking-widest text-[#dc2626] shadow-sm hover:bg-white/90 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
        >
          <LogIn className="h-3.5 w-3.5" />
          {loggingOut ? 'Redirecting...' : 'Log In Now'}
        </button>
      </div>
    </div>
  );
}
