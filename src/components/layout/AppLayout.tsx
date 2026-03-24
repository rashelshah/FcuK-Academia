'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

import Navbar from '@/components/layout/Navbar';

const HIDE_NAV_PATHS = ['/login'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = HIDE_NAV_PATHS.includes(pathname);

  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen pb-40 max-w-md mx-auto overflow-x-hidden">
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="px-6 pt-8"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Navbar />
    </div>
  );
}
