'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Rocket } from 'lucide-react';

export default function MissionControlBackground() {
  const shouldReduceMotion = useReducedMotion();
  const [isActive, setIsActive] = useState(true);
  const pathname = usePathname();
  const [warpSpeed, setWarpSpeed] = useState(false);

  // Pause animations when window is inactive to save battery
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsActive(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Accelerate stars during page transitions
  useEffect(() => {
    setWarpSpeed(true);
    const timeout = setTimeout(() => setWarpSpeed(false), 800);
    return () => clearTimeout(timeout);
  }, [pathname]);

  const playAnimations = !shouldReduceMotion && isActive;

  // Generate static stars once to prevent hydration mismatch
  const stars = useMemo(() => {
    const layers = [];
    // Only 2 layers to save DOM nodes, since we have planets now
    for (let i = 0; i < 2; i++) {
      const layerStars = [];
      const numStars = i === 0 ? 40 : 20;
      for (let j = 0; j < numStars; j++) {
        layerStars.push({
          id: `star-${i}-${j}`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size: Math.random() * (i + 1) + 1 + 'px',
          opacity: Math.random() * 0.5 + 0.3,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${Math.random() * 4 + 4}s`,
        });
      }
      layers.push(layerStars);
    }
    return layers;
  }, []);

  const warpMultiplier = warpSpeed ? 0.1 : 1;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" style={{ background: 'linear-gradient(180deg, #020617 0%, #050B1F 50%, #0B1026 100%)' }}>
      <style>{`
        @keyframes drift {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-50px) rotate(5deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes radar-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spaceship-fly {
          0% { transform: translate(-100px, 100px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(1500px, -1500px); opacity: 0; }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes planet-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        .mc-layer {
          will-change: transform, opacity;
        }
        .mc-warp {
          transition: animation-duration 0.8s ease-out;
        }
      `}</style>

      {/* Layer 1: Nebula Clouds */}
      <div 
        className="absolute inset-0 mc-layer"
        style={{
          background: 'radial-gradient(ellipse at 10% 20%, rgba(0, 229, 255, 0.15) 0%, transparent 40%), radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 90% 10%, rgba(236, 72, 153, 0.1) 0%, transparent 30%)',
          filter: 'blur(80px)',
          animation: playAnimations ? 'drift 60s linear infinite alternate' : 'none',
        }}
      />

      {/* Layer 1: Star Layers */}
      {stars.map((layer, i) => (
        <div 
          key={`layer-${i}`} 
          className="absolute inset-0 mc-layer mc-warp"
          style={{
            animation: playAnimations ? `drift ${60 * warpMultiplier}s linear infinite alternate` : 'none',
          }}
        >
          {layer.map((star) => (
            <div
              key={star.id}
              className={`absolute rounded-full bg-white mc-layer`}
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
                animation: playAnimations ? `twinkle ${star.animationDuration} infinite ease-in-out ${star.animationDelay}` : 'none',
              }}
            />
          ))}
        </div>
      ))}

      {/* Layer 2: Celestial Objects */}
      {/* Massive Blue Gas Giant with faint ring */}
      <div 
        className="absolute -bottom-[20vh] -left-[40vw] w-[80vw] h-[80vw] rounded-full mc-layer"
        style={{
          background: 'radial-gradient(circle at 70% 30%, rgba(0, 229, 255, 0.4) 0%, rgba(11, 16, 38, 0.9) 60%, transparent 100%)',
          boxShadow: 'inset -20px -20px 60px rgba(0,0,0,0.8), 0 0 60px rgba(0, 229, 255, 0.2)',
          animation: playAnimations ? 'planet-rotate 240s linear infinite' : 'none',
        }}
      >
        <div className="absolute top-1/2 left-1/2 w-[140%] h-[10%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-t-[4px] border-b-[2px] border-[rgba(0,229,255,0.15)]" style={{ transform: 'translate(-50%, -50%) rotate(-15deg)' }} />
      </div>

      {/* Purple Planet */}
      <div 
        className="absolute top-[15vh] right-[10vw] w-[15vw] h-[15vw] rounded-full mc-layer"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.6) 0%, rgba(30, 20, 50, 0.9) 70%, transparent 100%)',
          boxShadow: '0 0 30px rgba(139, 92, 246, 0.3), inset -10px -10px 30px rgba(0,0,0,0.8)',
          animation: playAnimations ? 'planet-rotate 180s linear infinite reverse' : 'none',
        }}
      />

      {/* Tiny Moon */}
      <div 
        className="absolute top-[28vh] right-[20vw] w-[3vw] h-[3vw] rounded-full mc-layer bg-[rgba(255,255,255,0.6)]"
        style={{
          boxShadow: 'inset -3px -3px 10px rgba(0,0,0,0.6), 0 0 10px rgba(255,255,255,0.2)',
        }}
      />

      {/* Layer 3: Mission Elements */}
      {/* Orbital Path SVG */}
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180vw] h-[180vw] overflow-visible opacity-20">
        <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#00E5FF" strokeWidth="1" strokeDasharray="10 15" />
        <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#8B5CF6" strokeWidth="0.5" strokeDasharray="5 10" />
      </svg>

      {/* Orbiting Satellite */}
      <div className="absolute top-1/2 left-1/2 w-[90vw] h-[90vw] -translate-x-1/2 -translate-y-1/2 mc-layer rounded-full" style={{ animation: playAnimations ? 'orbit 60s linear infinite' : 'none' }}>
        <div className="absolute top-0 left-1/2 w-2 h-2 bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] -translate-x-1/2 -translate-y-1/2 rounded-sm" />
      </div>

      {/* Spaceship flying from bottom-left to top-right */}
      {playAnimations && (
        <div 
          className="absolute bottom-0 left-0 w-8 h-8 mc-layer flex items-center justify-center"
          style={{
            animation: 'spaceship-fly 20s linear infinite',
            animationDelay: '8s',
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center" style={{ transform: 'rotate(-45deg)' }}>
            {/* Exhaust trail */}
            <div className="absolute top-1/2 right-1/2 w-16 h-[3px] -translate-y-1/2 bg-gradient-to-l from-[#00E5FF] to-transparent shadow-[0_0_12px_3px_#00E5FF]" style={{ transform: 'translateX(-4px)' }} />
            {/* Spaceship body */}
            <Rocket className="w-5 h-5 text-[#00E5FF] drop-shadow-[0_0_8px_#00E5FF] relative z-10" style={{ transform: 'rotate(45deg)' }} strokeWidth={2} />
          </div>
        </div>
      )}

      {/* Occasional Shooting Star */}
      {playAnimations && (
        <div 
          className="absolute top-0 right-1/4 w-32 h-0.5 bg-gradient-to-r from-transparent to-white rounded-full mc-layer mc-warp"
          style={{
            animation: `shooting-star ${12 * warpMultiplier}s linear infinite`,
            animationDelay: '2s',
            boxShadow: '0 0 10px 2px rgba(255,255,255,0.4)'
          }}
        />
      )}

      {/* Layer 4: HUD Overlay */}
      {/* Radar Sweep */}
      {playAnimations && (
        <div 
          className="absolute top-1/2 left-1/2 w-[150vw] h-[150vw] -translate-x-1/2 -translate-y-1/2 origin-center mc-layer rounded-full pointer-events-none opacity-20"
          style={{
            background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(0, 229, 255, 0.1) 360deg)',
            animation: 'radar-sweep 15s linear infinite',
          }}
        />
      )}

      {/* Coordinate Grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,229,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Targeting Reticles */}
      <div className="absolute top-[20%] left-[20%] w-10 h-10 border border-[#00E5FF] opacity-10 rounded-full flex items-center justify-center">
        <div className="w-1 h-1 bg-[#00E5FF] rounded-full" />
      </div>
      <div className="absolute bottom-[30%] right-[15%] w-16 h-16 border border-dashed border-[#8B5CF6] opacity-10 flex items-center justify-center" />

      {/* Scanning Line */}
      {playAnimations && (
        <div 
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-20 mc-layer"
          style={{ animation: 'scanline 8s linear infinite' }}
        />
      )}
      
      {/* Constellation lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]">
        <polyline points="10%,10% 25%,15% 30%,30% 15%,40%" fill="none" stroke="#00E5FF" strokeWidth="1" />
        <circle cx="10%" cy="10%" r="2" fill="#00E5FF" />
        <circle cx="25%" cy="15%" r="2" fill="#00E5FF" />
        <circle cx="30%" cy="30%" r="2" fill="#00E5FF" />
        <circle cx="15%" cy="40%" r="2" fill="#00E5FF" />
      </svg>
    </div>
  );
}
