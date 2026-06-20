'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
export default function ArcadeBackground() {
  const shouldReduceMotion = useReducedMotion();
  const [isActive, setIsActive] = useState(true);

  // Pause animations when window is inactive to save battery
  useEffect(() => {
    const handleVisibilityChange = () => setIsActive(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const playAnimations = !shouldReduceMotion && isActive;

  // Pre-calculate randomized elements
  const { stars, coins, spaceships } = useMemo(() => {
    const stars = Array.from({ length: 40 }).map((_, i) => ({
      id: `star-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`,
    }));

    const coins = Array.from({ length: 5 }).map((_, i) => ({
      id: `coin-${i}`,
      left: `${10 + Math.random() * 80}%`,
      top: `${20 + Math.random() * 60}%`,
      delay: `${Math.random() * 2}s`,
    }));

    const spaceships = Array.from({ length: 3 }).map((_, i) => ({
      id: `ship-${i}`,
      top: `${10 + Math.random() * 70}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${10 + Math.random() * 10}s`,
    }));

    return { stars, coins, spaceships };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#0A0A0A]">
      <style>{`
        @keyframes crt-flicker {
          0% { opacity: 0.98; }
          10% { opacity: 0.95; }
          20% { opacity: 0.99; }
          30% { opacity: 0.96; }
          40% { opacity: 0.98; }
          50% { opacity: 0.99; }
          60% { opacity: 0.97; }
          70% { opacity: 0.96; }
          80% { opacity: 0.98; }
          90% { opacity: 0.97; }
          100% { opacity: 0.99; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pixel-blink {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 1; }
        }
        @keyframes fly-across {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(120vw); }
        }
        @keyframes coin-spin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        
        .pixel-star {
          width: 4px;
          height: 4px;
          background: #F5F5F5;
          box-shadow: 4px 0 0 #F5F5F5, -4px 0 0 #F5F5F5, 0 4px 0 #F5F5F5, 0 -4px 0 #F5F5F5;
        }

        .pixel-coin {
          width: 16px;
          height: 24px;
          background: #FFD600;
          box-shadow: 
            inset 4px 0 0 rgba(255, 255, 255, 0.4),
            inset -4px 0 0 rgba(0, 0, 0, 0.2),
            0 4px 0 #000, 0 -4px 0 #000, 4px 0 0 #000, -4px 0 0 #000;
        }

        .pixel-ship {
          width: 20px;
          height: 12px;
          background: #00A8FF;
          position: relative;
          box-shadow: 
            0 4px 0 #FF2E43,
            -8px 4px 0 #FFD600,
            0 -4px 0 #000, 0 8px 0 #000, 4px 0 0 #000, -4px 0 0 #000;
        }

        .crt-curve {
          box-shadow: inset 0 0 100px rgba(0,0,0,0.9);
          border-radius: 16px;
        }
        
        .chromatic-aberration {
          text-shadow: 2px 0 0 rgba(255,0,0,0.5), -2px 0 0 rgba(0,255,255,0.5);
        }
      `}</style>

      {/* Layer 1: Stars */}
      <div className="absolute inset-0 opacity-20">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute pixel-star"
            style={{
              left: star.left,
              top: star.top,
              animation: playAnimations ? `pixel-blink ${star.duration} infinite steps(2) ${star.delay}` : 'none',
            }}
          />
        ))}
      </div>

      {/* Layer 2: Pixel Spaceships */}
      {spaceships.map((ship) => (
        <div
          key={ship.id}
          className="absolute left-0 opacity-30"
          style={{
            top: ship.top,
            animation: playAnimations ? `fly-across ${ship.duration} infinite linear ${ship.delay}` : 'none',
            willChange: 'transform',
          }}
        >
          <div className="pixel-ship" />
        </div>
      ))}

      {/* Layer 3: Floating Coins */}
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute opacity-10"
          style={{
            left: coin.left,
            top: coin.top,
            animation: playAnimations ? `coin-spin 1.5s infinite steps(4) ${coin.delay}` : 'none',
            willChange: 'transform',
          }}
        >
          <div className="pixel-coin" />
        </div>
      ))}

      {/* Layer 4: INSERT COIN text */}
      <div className="absolute bottom-12 w-full text-center opacity-10">
        <h2 className="font-headline text-3xl text-[#FF2E43] tracking-widest chromatic-aberration" style={{ fontFamily: '"Press Start 2P"' }}>
          INSERT COIN
        </h2>
      </div>

      {/* Screen Effects: Flicker & Scanlines */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%)',
          backgroundSize: '100% 4px',
        }}
      />
      
      {/* Moving scanline */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.1) 10%, transparent 20%)',
          animation: playAnimations ? 'scanline 6s linear infinite' : 'none',
          willChange: 'transform',
        }}
      />

      {/* CRT Curvature and Vignette */}
      <div className="absolute inset-0 pointer-events-none crt-curve border-[16px] border-[#050505]" />
      
      {/* Global CRT Flicker */}
      {playAnimations && (
        <div 
          className="absolute inset-0 pointer-events-none bg-black mix-blend-overlay opacity-10"
          style={{
            animation: 'crt-flicker 0.15s infinite',
          }}
        />
      )}
    </div>
  );
}
