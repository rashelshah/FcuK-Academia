'use client';

import React, { useDeferredValue, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, BookOpenCheck } from 'lucide-react';

interface SubjectListProps {
  subjects: string[];
  semester: number;
}

export default function SubjectList({ subjects, semester }: SubjectListProps) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(
    () =>
      subjects.filter((s) =>
        s.toLowerCase().includes(deferredQuery.toLowerCase())
      ),
    [subjects, deferredQuery]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: 'var(--text-subtle)' }}
        />
        <input
          id="pyq-subject-search"
          type="search"
          placeholder="search subjects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="theme-input w-full py-3 pl-11 pr-4 font-body text-sm"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* Count */}
      <p
        className="font-label text-[10px] font-bold uppercase tracking-widest"
        style={{ color: 'var(--text-subtle)' }}
      >
        {filtered.length} subject{filtered.length !== 1 ? 's' : ''}
        {query ? ` matching "${query}"` : ''}
      </p>

      {/* Subject cards */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-12 text-center"
          >
            <BookOpenCheck
              className="h-10 w-10"
              style={{ color: 'var(--text-subtle)' }}
            />
            <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
              no subjects found for &quot;{query}&quot;
            </p>
            <button
              className="theme-kicker underline"
              onClick={() => setQuery('')}
            >
              clear search
            </button>
          </motion.div>
        ) : (
          <motion.ul
            key="list"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
            }}
            className="flex flex-col gap-2"
          >
            {filtered.map((subject) => {
              const encodedSubject = encodeURIComponent(subject);
              return (
                <motion.li
                  key={subject}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 14, scale: 0.97 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  <Link
                    href={`/pyqs/${semester}/${encodedSubject}`}
                    prefetch={false}
                  >
                    <motion.div
                      whileHover={{ x: 3, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                      className="theme-card group flex items-center justify-between gap-3 px-5 py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {/* Accent dot */}
                        <div
                          className="h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors duration-200 group-hover:scale-150"
                          style={{ background: 'var(--primary)' }}
                        />
                        <span
                          className="truncate font-body text-sm font-semibold capitalize leading-snug"
                          style={{ color: 'var(--text)' }}
                        >
                          {subject}
                        </span>
                      </div>
                      <ChevronRight
                        className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                        style={{ color: 'var(--text-subtle)' }}
                      />
                    </motion.div>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
