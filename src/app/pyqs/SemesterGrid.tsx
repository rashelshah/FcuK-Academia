'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const semesterEmojis = ['🚀', '📐', '💻', '🧠', '⚡', '🔬', '🏗️', '🎓'];
const semesterLabels = [
  'the beginning',
  'survival mode',
  'getting real',
  'no cap hard',
  'halfway cooked',
  'deep in it',
  'almost there',
  'final boss',
];

interface SemesterGridProps {
  semesters: number[];
}

export default function SemesterGrid({ semesters }: SemesterGridProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
      }}
      className="grid grid-cols-2 gap-3"
    >
      {semesters.map((sem, i) => (
        <motion.div
          key={sem}
          variants={{
            hidden: { opacity: 0, y: 22, scale: 0.96 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          <Link href={`/pyqs/${sem}`} prefetch={true}>
            <motion.div
              whileHover={{ scale: 1.024, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="theme-card group relative flex flex-col gap-3 overflow-hidden p-5"
              style={{
                background:
                  'linear-gradient(145deg, color-mix(in srgb, var(--surface-elevated) 95%, var(--primary) 5%) 0%, var(--surface) 100%)',
              }}
            >
              {/* Glow on hover */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--primary) 10%, transparent) 0%, transparent 70%)',
                }}
              />

              {/* Semester number (large bg) */}
              <span
                className="absolute right-3 top-1 font-headline text-6xl font-bold leading-none opacity-[0.06]"
                style={{ color: 'var(--primary)', fontVariantNumeric: 'lining-nums' }}
                aria-hidden="true"
              >
                {sem}
              </span>

              {/* Icon */}
              <span className="text-2xl leading-none" role="img" aria-label={`Semester ${sem}`}>
                {semesterEmojis[(sem - 1) % semesterEmojis.length]}
              </span>

              {/* Label */}
              <div className="space-y-0.5">
                <span
                  className="block font-label text-[9px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: 'var(--text-subtle)' }}
                >
                  semester
                </span>
                <span
                  className="font-headline text-2xl font-bold lowercase leading-none"
                  style={{ color: 'var(--text)' }}
                >
                  {sem}
                </span>
              </div>

              {/* Sub-label */}
              <span
                className="font-label text-[10px] font-semibold"
                style={{ color: 'var(--text-muted)' }}
              >
                {semesterLabels[(sem - 1) % semesterLabels.length]}
              </span>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
