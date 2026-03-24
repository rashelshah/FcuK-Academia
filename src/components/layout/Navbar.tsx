'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, CheckSquare, Clock, Calendar, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'home' },
  { href: '/marks', icon: BarChart2, label: 'marks' },
  { href: '/attendance', icon: CheckSquare, label: 'attendance' },
  { href: '/timetable', icon: Clock, label: 'timetable' },
  { href: '/calendar', icon: Calendar, label: 'calendar' },
  { href: '/settings', icon: Settings, label: 'settings' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-[30rem] h-[4.5rem] bg-[#171717]/80 backdrop-blur-2xl border border-white/5 rounded-full flex justify-around items-center px-2 z-50 nav-glow mb-[env(safe-area-inset-bottom,0)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href} className="relative group p-3 flex flex-col items-center justify-center">
            <div className={cn(
                "transition-all duration-300 relative z-10",
                isActive ? "text-secondary drop-shadow-[0_0_12px_rgba(0,224,255,1)]" : "text-[#adaaaa] hover:text-white"
              )}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            {isActive && (
              <div
                className="absolute inset-0 m-auto w-10 h-10 bg-secondary/20 blur-xl rounded-full -z-10 pointer-events-none"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
