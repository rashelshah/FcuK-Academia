'use client';

import React, { useId } from 'react';

import { cn } from '@/lib/utils';

interface UserAvatarProps {
  className?: string;
  size?: number;
}

export default function UserAvatar({ className, size = 44 }: UserAvatarProps) {
  const id = useId().replace(/:/g, '');

  return (
    <div
      className={cn('relative shrink-0 overflow-hidden rounded-full', className)}
      style={{
        width: size,
        height: size,
        border: '1px solid color-mix(in srgb, var(--border-strong) 72%, transparent)',
        background: 'radial-gradient(circle at 24% 20%, color-mix(in srgb, var(--secondary) 22%, transparent), transparent 42%), linear-gradient(145deg, color-mix(in srgb, var(--surface-card-elevated) 96%, transparent), color-mix(in srgb, var(--surface-card) 88%, transparent))',
        boxShadow: '0 0 0 1px color-mix(in srgb, var(--border-strong) 72%, transparent), 0 0 26px color-mix(in srgb, var(--primary) 22%, transparent)',
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 128 128" className="h-full w-full" fill="none">
        <defs>
          <linearGradient id={`${id}-bg`} x1="18" y1="16" x2="108" y2="112" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--secondary)" />
            <stop offset="0.52" stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--accent)" />
          </linearGradient>
          <linearGradient id={`${id}-jacket`} x1="20" y1="74" x2="110" y2="118" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--surface-highlight)" />
            <stop offset="1" stopColor="var(--text)" />
          </linearGradient>
          <pattern id={`${id}-dots`} width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="var(--text)" opacity="0.18" />
            <circle cx="8" cy="6" r="1.2" fill="var(--text)" opacity="0.1" />
          </pattern>
          <clipPath id={`${id}-clip`}>
            <circle cx="64" cy="64" r="64" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${id}-clip)`}>
          <rect width="128" height="128" fill={`url(#${id}-bg)`} />
          <rect width="128" height="128" fill={`url(#${id}-dots)`} opacity="0.6" />
          <path
            d="M18 114L38 84L62 96L84 82L110 112L18 114Z"
            fill={`url(#${id}-jacket)`}
          />
          <path
            d="M20 111L42 82L60 90L77 82L109 111"
            stroke="var(--text-inverse)"
            strokeWidth="4"
            strokeLinejoin="round"
            opacity="0.88"
          />
          <path
            d="M51 85L64 98L76 85"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="56" y="74" width="16" height="18" rx="8" fill="var(--primary-soft)" />
          <path
            d="M35 53L43 31L51 44L58 24L65 37L73 21L80 38L89 27L94 50"
            fill="var(--text)"
          />
          <path
            d="M43 46C43 32.7 53.7 22 67 22C80.3 22 91 32.7 91 46V59C91 72.3 80.3 83 67 83C53.7 83 43 72.3 43 59V46Z"
            fill="var(--primary-soft)"
          />
          <path
            d="M44 46C44 33 54 22 67 22C80 22 90 33 90 46V51C83 46 72 44 62 46C55 47 48 51 44 56V46Z"
            fill="var(--secondary)"
            opacity="0.78"
          />
          <path
            d="M50 61C54 56 59 54 65 54H80C85 54 88 56 91 59"
            stroke="var(--primary)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect x="49" y="54" width="13" height="11" rx="4" stroke="var(--text-inverse)" strokeWidth="3" />
          <rect x="69" y="54" width="13" height="11" rx="4" stroke="var(--text-inverse)" strokeWidth="3" />
          <path d="M62 59H69" stroke="var(--text-inverse)" strokeWidth="3" strokeLinecap="round" />
          <path d="M56 69L60 71" stroke="var(--text-inverse)" strokeWidth="3" strokeLinecap="round" />
          <path d="M74 69L78 71" stroke="var(--text-inverse)" strokeWidth="3" strokeLinecap="round" />
          <path d="M61 75C64 77 69 77 73 75" stroke="var(--text-inverse)" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M33 98L26 88L31 72L46 79L42 93L33 98Z"
            fill="var(--accent)"
            opacity="0.72"
          />
          <path
            d="M95 93L89 77L102 70L111 84L104 99L95 93Z"
            fill="var(--secondary)"
            opacity="0.72"
          />
          <path
            d="M18 28L56 12L47 3L12 17L18 28Z"
            fill="var(--text)"
            opacity="0.88"
          />
          <path
            d="M101 18L111 10L116 23L103 28"
            fill="var(--primary)"
            opacity="0.82"
          />
        </g>
      </svg>
    </div>
  );
}
