'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';

export default function AppSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { themeConfig, isDark } = useTheme();
  const { user } = useUser();
  const isPyqs = pathname.startsWith('/pyqs');

  // Load state synchronously on mount to intercept instant Next.js SPA transitions
  // and completely eliminate the 1-frame highlight visual flash.
  const [rippleData, setRippleData] = useState<{ target: 'home' | 'pyq'; start: number } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const pending = sessionStorage.getItem('pendingRipple') as 'home' | 'pyq' | null;
        const startTimeStr = sessionStorage.getItem('rippleStart');
        if (pending && startTimeStr) {
          return { target: pending, start: parseInt(startTimeStr, 10) };
        }
      } catch {}
    }
    return null;
  });

  // Cross-page Animation Persistence via Timestamp Math
  useEffect(() => {
    if (rippleData) {
      const elapsed = Date.now() - rippleData.start;
      if (elapsed < 3800) {
        const t = setTimeout(() => {
          setRippleData(null);
          try {
            sessionStorage.removeItem('pendingRipple');
            sessionStorage.removeItem('rippleStart');
          } catch {}
        }, 3800 - elapsed);
        return () => clearTimeout(t);
      } else {
        setRippleData(null);
        try {
          sessionStorage.removeItem('pendingRipple');
          sessionStorage.removeItem('rippleStart');
        } catch {}
      }
    }
  }, [rippleData]);

  // Try to determine user's current semester for smart redirect
  const userSemester = user?.semester ? parseInt(user.semester.replace(/[^0-9]/g, ''), 10) : null;
  const pyqLink = userSemester ? `/pyqs/${userSemester}` : '/pyqs';

  // Grab theme colors for gradients
  const primary = themeConfig.colors.primary;
  const secondary = themeConfig.colors.secondary;
  const accent = themeConfig.colors.accent;

  const handleNav = (target: 'home' | 'pyq', href: string) => {
    // We do NOT block if rippleData exists, allowing the user to seamlessly redirect 
    // their click if they mash the button fast without "double click" frustrations.
    const start = Date.now();
    setRippleData({ target, start });
    
    try {
      sessionStorage.setItem('pendingRipple', target);
      sessionStorage.setItem('rippleStart', start.toString());
    } catch {}

    router.push(href);
  };

  const SwitcherBtn = ({ 
    title, 
    isPyq, 
    isActive, 
    rippleStart,
    onClick 
  }: { 
    title: string; 
    isPyq?: boolean; 
    isActive: boolean; 
    rippleStart: number | null;
    onClick: () => void;
  }) => {
    const activeGradient = `linear-gradient(135deg, ${secondary}, ${primary}, ${accent})`;
    const inactiveBorder = `linear-gradient(to right, ${primary}, ${secondary}, ${accent})`;

    const inactiveTextColorClasses = "text-white font-bold drop-shadow-md";
    const activeTextColorClasses = isDark ? "text-black drop-shadow-sm font-black" : "text-white drop-shadow-lg";

    // Only apply the raw active color if the ripple is completely finished
    const textColorClasses = isActive && !rippleStart 
      ? activeTextColorClasses
      : inactiveTextColorClasses;

    // Calculate elapsed time strictly for the visual engine
    const globalElapsed = rippleStart ? Date.now() - rippleStart : 0;

    return (
      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          "relative flex h-[52px] w-full items-center justify-center rounded-[18px]",
          (isActive || rippleStart !== null) ? "shadow-xl shadow-primary/20" : "p-[1.5px]"
        )}
        style={{
          background: isActive && !rippleStart ? activeGradient : inactiveBorder
        }}
      >
        {/* Void Background layer */}
        {(!isActive || rippleStart) && (
          <div className="absolute inset-[1.5px] rounded-[17px] bg-[#0A0A0A] z-0" />
        )}

        {/* Thick, Gradient-Colored Concentric Waves */}
        {rippleStart && (
          <div 
             className="absolute inset-[1.5px] rounded-[16px] overflow-hidden pointer-events-none z-10"
             style={{ transform: 'translateZ(0)', WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
          >
            {[0, 1, 2].map((i) => {
               const staggerOffsetMs = i * 600;
               const finalDelayMs = staggerOffsetMs - globalElapsed;
               
               return (
                 <div 
                   key={i}
                   style={{
                     position: 'absolute',
                     top: '50%',
                     left: '50%',
                     width: '60px', 
                     height: '60px',
                     borderRadius: '50%',
                     background: `linear-gradient(135deg, ${primary}, ${secondary}, ${accent})`,
                     WebkitMaskImage: 'radial-gradient(transparent 45%, black 60%)',
                     maskImage: 'radial-gradient(transparent 45%, black 60%)',
                     opacity: 0, 
                     animation: `waterRippleRing 2.6s cubic-bezier(0.1, 0.5, 0.3, 1) forwards`,
                     animationDelay: `${finalDelayMs}ms` 
                   }}
                 />
               );
            })}
          </div>
        )}

        {/* The Final Expanding Highlight containing the beautifully synchronized font color transition! */}
        {isActive && rippleStart && (
          <div 
             className="absolute inset-[1.5px] rounded-[16px] overflow-hidden z-20 flex items-center justify-center"
             style={{
               background: activeGradient,
               opacity: 0, 
               animation: `fillPillClip 2.6s cubic-bezier(0.1, 0.5, 0.3, 1) forwards`,
               animationDelay: `${1200 - globalElapsed}ms`
             }}
          >
             <span className={cn(
              "whitespace-nowrap leading-none transition-none", // No CSS transition, the clip-path acts as the transition wipe!
              isPyq ? "uppercase tracking-[0.1em] text-[14px]" : "font-headline text-[18px]",
              activeTextColorClasses
            )} style={{ 
              fontFamily: isPyq ? 'Evaco' : 'Qelandsaightrial',
              paddingTop: isPyq ? '4px' : '2px',
              fontWeight: isDark ? 800 : (isPyq ? 400 : 700) 
            }}>
              {title}
            </span>
          </div>
        )}

        {/* Crisp Top Text Layer Base (Fallback & Inactive Base) */}
        <span className={cn(
          "relative z-10 whitespace-nowrap leading-none transition-none", 
          isPyq ? "uppercase tracking-[0.1em] text-[14px]" : "font-headline text-[18px]",
          textColorClasses
        )} style={{ 
          fontFamily: isPyq ? 'Evaco' : 'Qelandsaightrial',
          paddingTop: isPyq ? '4px' : '2px',
          fontWeight: isActive && isDark ? 800 : (isPyq ? 400 : 700) 
        }}>
          {title}
        </span>
      </motion.button>
    );
  };

  return (
    <>
      <style>{`
        @keyframes waterRippleRing {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.1); }
          15% { opacity: 0.9; }
          75% { opacity: 0.9; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(5.5); }
        }
        
        @keyframes fillPillClip {
          0% { clip-path: circle(0% at 50% 50%); opacity: 0; }
          15% { opacity: 1; clip-path: circle(15% at 50% 50%); }
          100% { clip-path: circle(150% at 50% 50%); opacity: 1; }
        }
      `}</style>
      
      <div className="flex w-full gap-3 mb-2">
        <div className="flex-1 min-w-0 flex">
          <SwitcherBtn 
            title="FcuK Academia" 
            isActive={!isPyqs} 
            rippleStart={rippleData?.target === 'home' ? rippleData.start : null}
            onClick={() => handleNav('home', '/')}
          />
        </div>

        <div className="flex-1 min-w-0 flex">
          <SwitcherBtn 
            title="LOCK IN" 
            isPyq 
            isActive={isPyqs} 
            rippleStart={rippleData?.target === 'pyq' ? rippleData.start : null}
            onClick={() => handleNav('pyq', pyqLink)}
          />
        </div>
      </div>
    </>
  );
}
