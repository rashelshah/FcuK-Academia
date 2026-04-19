'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, Filter, Calendar, BookMarked } from 'lucide-react';
import type { PYQItem } from './page';

interface PYQListProps {
  pyqs: PYQItem[];
  subject: string;
  semester: number;
}

type FilterType = 'All' | 'PYQ' | 'CT' | 'Note' | 'Other';

const examTypeBadge: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PYQ: {
    label: 'PYQ',
    color: 'var(--primary)',
    bg: 'color-mix(in srgb, var(--primary) 12%, transparent)',
    border: 'color-mix(in srgb, var(--primary) 28%, transparent)',
  },
  CT: {
    label: 'CT',
    color: 'var(--secondary)',
    bg: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
    border: 'color-mix(in srgb, var(--secondary) 28%, transparent)',
  },
  Note: {
    label: 'Note',
    color: '#10b981', // Emerald-500
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.28)',
  },
  Other: {
    label: 'Other',
    color: 'var(--accent)',
    bg: 'color-mix(in srgb, var(--accent) 12%, transparent)',
    border: 'color-mix(in srgb, var(--accent) 28%, transparent)',
  },
};

export default function PYQList({ pyqs, subject, semester }: PYQListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const availableFilters = useMemo(() => {
    const types = new Set(pyqs.map((p) => (p.exam_type as FilterType) || 'Other'));
    const order: FilterType[] = ['All', 'PYQ', 'CT', 'Note', 'Other'];
    return order.filter((f) => f === 'All' || types.has(f));
  }, [pyqs]);

  const filtered = useMemo(
    () =>
      activeFilter === 'All'
        ? pyqs
        : pyqs.filter((p) => (p.exam_type || 'Other') === activeFilter),
    [pyqs, activeFilter]
  );

  if (pyqs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4 py-16 text-center"
      >
        <BookMarked className="h-12 w-12" style={{ color: 'var(--text-subtle)' }} />
        <div className="space-y-1">
          <p className="font-headline text-xl font-bold" style={{ color: 'var(--text-muted)' }}>
            no papers found
          </p>
          <p className="font-body text-sm" style={{ color: 'var(--text-subtle)' }}>
            this subject hasn&apos;t been scraped yet.
            <br />
            run the scraper script to populate data!
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Filter pills */}
      {availableFilters.length > 2 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {availableFilters.map((f) => {
            const isActive = activeFilter === f;
            return (
              <button
                key={f}
                id={`pyq-filter-${f.toLowerCase()}`}
                onClick={() => setActiveFilter(f)}
                className="flex-shrink-0 rounded-full px-4 py-1.5 font-label text-[10px] font-bold uppercase tracking-widest transition-all duration-200"
                style={{
                  background: isActive
                    ? 'var(--primary)'
                    : 'color-mix(in srgb, var(--surface-soft) 92%, transparent)',
                  color: isActive ? 'var(--text-inverse)' : 'var(--text-muted)',
                  border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                  boxShadow: isActive ? 'var(--glow-primary)' : 'none',
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      )}

      {/* Count */}
      <p
        className="font-label text-[10px] font-bold uppercase tracking-widest"
        style={{ color: 'var(--text-subtle)' }}
      >
        {filtered.length} paper{filtered.length !== 1 ? 's' : ''} available
      </p>

      {/* PYQ Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
        }}
        className="flex flex-col gap-3"
      >
        {filtered.map((pyq, i) => {
          const badge = examTypeBadge[pyq.exam_type || 'Other'] ?? examTypeBadge.Other;
          return (
            <motion.div
              key={pyq.id}
              variants={{
                hidden: { opacity: 0, y: 18, scale: 0.97 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <div
                className="theme-card relative overflow-hidden px-5 py-4"
                style={{
                  background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface-elevated) 96%, var(--primary) 4%) 0%, var(--surface) 100%)',
                  borderColor: 'color-mix(in srgb, var(--border) 80%, transparent)',
                }}
              >
                {/* Card content */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Exam type badge */}
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 font-label text-[8px] font-bold uppercase tracking-widest"
                        style={{
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.color,
                        }}
                      >
                        {badge.label}
                      </span>

                      {/* Year badge */}
                      {pyq.year && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-label text-[8px] font-bold uppercase tracking-widest"
                          style={{
                            background: 'color-mix(in srgb, var(--surface-soft) 85%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--border) 60%, transparent)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          <Calendar className="h-2.5 w-2.5 opacity-70" />
                          {pyq.year}
                        </span>
                      )}
                    </div>

                    {/* Label */}
                    <h3
                      className="font-headline text-lg font-bold lowercase leading-tight tracking-tight"
                      style={{ color: 'var(--text)' }}
                    >
                      {pyq.source_label || `${pyq.exam_type || 'PYQ'} ${pyq.year || ''}`}
                    </h3>

                    {/* Subject sub-text */}
                    <p
                      className="truncate font-label text-[9px] font-medium uppercase tracking-[0.08em]"
                      style={{ color: 'var(--text-subtle)' }}
                    >
                      {subject} · sem {semester}
                    </p>
                  </div>

                  {/* View PDF button */}
                  <a
                    href={pyq.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`pyq-view-${pyq.id}`}
                    className="flex-shrink-0"
                    aria-label={`View ${pyq.source_label || 'PYQ'} PDF`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.04, y: -0.5 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2.5 rounded-full px-5 py-3 transition-colors"
                      style={{
                        background: 'color-mix(in srgb, var(--primary) 10%, var(--surface-elevated))',
                        border: '1.5px solid color-mix(in srgb, var(--primary) 22%, transparent)',
                        color: 'var(--primary)',
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label text-[10px] font-black uppercase tracking-[0.14em] leading-none">
                          View
                        </span>
                        <div className="mt-1 flex items-center gap-1 opacity-60">
                           <span className="font-label text-[7px] uppercase tracking-widest font-bold">PDF</span>
                           <ExternalLink className="h-2 w-2" />
                        </div>
                      </div>
                    </motion.div>
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
