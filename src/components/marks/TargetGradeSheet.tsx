'use client';

import { createPortal } from 'react-dom';
import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calculator, X } from 'lucide-react';

import type { Subject } from '@/lib/types';
import { cn } from '@/lib/utils';

type GradeOption = {
  label: string;
  min: number;
  points: number;
};

type TargetSubject = {
  id: string;
  name: string;
  shortCode: string;
  credits: number;
  currentInternals: number;
  completedInternalMax: number;
  remainingInternalMax: number;
  totalInternalCap: number;
  currentRecordedPercentage: number;
  isFullyInternal: boolean;
  semesterExamMax: number;
};

const GRADE_OPTIONS: GradeOption[] = [
  { label: 'O', min: 91, points: 10 },
  { label: 'A+', min: 81, points: 9 },
  { label: 'A', min: 71, points: 8 },
  { label: 'B+', min: 61, points: 7 },
  { label: 'B', min: 56, points: 6 },
  { label: 'C', min: 50, points: 5 },
];

function inferGradeLabel(score: number) {
  if (score >= 91) return 'O';
  if (score >= 81) return 'A+';
  if (score >= 71) return 'A';
  if (score >= 61) return 'B+';
  if (score >= 56) return 'B';
  if (score >= 50) return 'C';
  return 'F';
}

function getGradePoints(label: string) {
  return GRADE_OPTIONS.find((grade) => grade.label === label)?.points ?? 0;
}

function getSubjectAcronym(name: string, code: string) {
  const cleanedCode = code.trim().toUpperCase();
  if (cleanedCode.length && cleanedCode.length <= 8) return cleanedCode;

  const parts = name
    .split(/\s+/)
    .map((part) => part.replace(/[^a-z0-9]/gi, ''))
    .filter(Boolean);

  if (!parts.length) return 'SUB';
  if (parts.length === 1) return parts[0].slice(0, 4).toUpperCase();
  return parts.slice(0, 4).map((part) => part[0]?.toUpperCase() ?? '').join('');
}

function inferFullyInternal(subject: Subject) {
  const normalizedCode = subject.code.trim().toUpperCase();
  return /[PL]$/i.test(normalizedCode);
}

function buildTargetSubject(subject: Subject): TargetSubject {
  const completedExams = subject.marks.exams.filter(
    (exam) => exam.obtained !== null && exam.maxMark !== null,
  );
  const completedInternalMax = completedExams.reduce((sum, exam) => sum + (exam.maxMark ?? 0), 0);
  const currentInternals = completedExams.reduce((sum, exam) => sum + (exam.obtained ?? 0), 0);
  const isFullyInternal = inferFullyInternal(subject);
  const totalInternalCap = isFullyInternal ? 100 : 60;
  const remainingInternalMax = Math.max(0, totalInternalCap - completedInternalMax);
  const currentRecordedPercentage = completedInternalMax > 0 ? (currentInternals / completedInternalMax) * 100 : 0;

  return {
    id: subject.id,
    name: subject.name,
    shortCode: getSubjectAcronym(subject.name, subject.code),
    credits: subject.credits,
    currentInternals,
    completedInternalMax,
    remainingInternalMax,
    totalInternalCap,
    currentRecordedPercentage,
    isFullyInternal,
    semesterExamMax: isFullyInternal ? 0 : 75,
  };
}

export function TargetGradeTrigger({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-primary px-5 py-2.5 font-label text-[10px] font-bold uppercase tracking-[0.26em] text-[var(--text-inverse)] shadow-[var(--glow-primary)] transition-all active:scale-95"
    >
      <Calculator className="h-3.5 w-3.5" />
      target
    </button>
  );
}

function TargetGradeSheetContent({
  subjects,
  onClose,
}: {
  subjects: Subject[];
  onClose: () => void;
}) {
  const targetSubjects = useMemo(() => subjects.map(buildTargetSubject), [subjects]);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [targetGrades, setTargetGrades] = useState<Record<string, number>>({});
  const [expectedMarks, setExpectedMarks] = useState<Record<string, number>>({});

  const resolvedActiveSubjectId = activeSubjectId && targetSubjects.some((subject) => subject.id === activeSubjectId)
    ? activeSubjectId
    : (targetSubjects[0]?.id ?? null);
  const activeSubject = targetSubjects.find((subject) => subject.id === resolvedActiveSubjectId) ?? null;
  const currentTargetGrade = activeSubject ? (targetGrades[activeSubject.id] ?? 71) : 71;
  const maxExpectedMarks = activeSubject
    ? activeSubject.remainingInternalMax
    : 0;
  const currentExpectedMarks = activeSubject
    ? Math.min(expectedMarks[activeSubject.id] ?? 0, maxExpectedMarks)
    : 0;
  const projectedInternals = activeSubject ? activeSubject.currentInternals + currentExpectedMarks : 0;
  const externalWeight = 40;
  const externalMax = activeSubject?.semesterExamMax ?? 0;
  const externalMarksNeeded = activeSubject
    ? Math.ceil((Math.max(0, currentTargetGrade - projectedInternals) / externalWeight) * externalMax)
    : 0;
  const projectInternalNeeded = activeSubject?.isFullyInternal
    ? Math.ceil(Math.max(0, currentTargetGrade - projectedInternals))
    : 0;

  const projectedSgpa = useMemo(() => {
    const consideredSubjects = targetSubjects.filter((subject) => subject.credits > 0);
    const totalCredits = consideredSubjects.reduce((sum, subject) => sum + subject.credits, 0);
    if (!totalCredits) return '0.00';

    const totalPoints = consideredSubjects.reduce((sum, subject) => {
      const explicitTarget = targetGrades[subject.id];
      const gradeLabel = explicitTarget
        ? (GRADE_OPTIONS.find((grade) => grade.min === explicitTarget)?.label ?? 'O')
        : inferGradeLabel(subject.currentRecordedPercentage);
      return sum + (subject.credits * getGradePoints(gradeLabel));
    }, 0);

    return (totalPoints / totalCredits).toFixed(2);
  }, [targetGrades, targetSubjects]);

  const neededMessage = !activeSubject
    ? 'no marks data'
    : activeSubject.isFullyInternal
      ? projectInternalNeeded <= 0
        ? '0 internal'
        : projectInternalNeeded > maxExpectedMarks
          ? 'not reachable'
          : `${projectInternalNeeded} internal`
      : externalMarksNeeded <= 0
        ? `0 / ${externalMax}`
        : externalMarksNeeded > externalMax
          ? 'not reachable'
          : `${externalMarksNeeded} / ${externalMax}`;

  const neededToneClass = !activeSubject
    ? 'text-on-surface-variant'
    : activeSubject.isFullyInternal
      ? projectInternalNeeded > maxExpectedMarks
        ? 'text-error'
        : 'text-secondary'
      : externalMarksNeeded > externalMax
      ? 'text-error'
      : 'text-secondary';

  const setExpectedForActive = (value: number | ((current: number) => number)) => {
    if (!activeSubject) return;

    setExpectedMarks((current) => {
      const currentValue = Math.min(current[activeSubject.id] ?? 0, maxExpectedMarks);
      const nextValue = typeof value === 'function' ? value(currentValue) : value;
      return {
        ...current,
        [activeSubject.id]: Math.max(0, Math.min(maxExpectedMarks, nextValue)),
      };
    });
  };

  const handleExpectedInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeSubject) return;

    const rawValue = Number(event.target.value);
    const nextValue = Number.isNaN(rawValue) ? 0 : rawValue;
    setExpectedForActive(nextValue);
  };

  return (
    <section className="theme-card overflow-hidden rounded-none border-x-0 border-t-0 p-5 shadow-none sm:p-6">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-36 opacity-70"
        style={{
          background: 'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 70%)',
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="theme-kicker text-primary">target your grade</p>
            <div className="mt-2 font-headline text-[3.2rem] font-bold leading-[0.84] tracking-tight text-on-surface">
              {projectedSgpa}
            </div>
            <p className="mt-2 font-label text-[10px] font-bold uppercase tracking-[0.28em] text-secondary">
              projected sgpa
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="theme-icon-button flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <p className="theme-kicker">select subject</p>
          <span className="max-w-full font-label text-[11px] font-semibold lowercase text-on-surface-variant sm:max-w-[60%] sm:text-right">
            active: {activeSubject?.name ?? 'no subject'}
          </span>
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {targetSubjects.map((subject) => {
            const isActive = subject.id === activeSubject?.id;
            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => setActiveSubjectId(subject.id)}
                className={cn(
                  'min-w-[6.5rem] shrink-0 rounded-[999px] border px-4 py-3 font-headline text-[1.35rem] font-bold uppercase transition-all',
                  isActive ? 'text-[var(--text-inverse)] shadow-[var(--glow-primary)]' : 'text-on-surface-variant',
                )}
                style={isActive ? {
                  background: 'var(--primary)',
                  borderColor: 'color-mix(in srgb, var(--primary) 78%, transparent)',
                } : {
                  background: 'color-mix(in srgb, var(--surface-soft) 88%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--border-strong) 72%, transparent)',
                }}
              >
                {subject.shortCode}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <p className="theme-kicker">internal marks ({activeSubject ? `/${Math.round(activeSubject.totalInternalCap)}` : '/0'})</p>

          <div className="mt-6 grid grid-cols-2 gap-5">
            <div className="min-w-0">
              <p className="font-label text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                current internals
              </p>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-headline text-[3rem] font-bold leading-none text-primary sm:text-[3.35rem]">
                  {activeSubject ? activeSubject.currentInternals.toFixed(activeSubject.currentInternals % 1 ? 1 : 0) : '0'}
                </span>
                <span className="pb-1 font-headline text-[1.7rem] font-bold text-on-surface-variant">
                  /{Math.round(activeSubject?.completedInternalMax || 0)}
                </span>
              </div>
              <div className="mt-2 h-[3px] w-20 rounded-full bg-primary shadow-[var(--glow-primary)]" />
            </div>

            <div className="min-w-0">
              <p className="font-label text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                expected remaining
              </p>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-headline text-[3rem] font-bold leading-none text-secondary sm:text-[3.35rem]">
                  {currentExpectedMarks}
                </span>
                <span className="pb-1 font-headline text-[1.7rem] font-bold text-on-surface-variant">
                  /{Math.round(maxExpectedMarks)}
                </span>
              </div>
              <div className="mt-2 h-[3px] w-20 rounded-full bg-secondary shadow-[var(--glow-secondary)]" />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setExpectedForActive((current) => current - 1)}
              className="theme-icon-button flex h-11 w-11 shrink-0 items-center justify-center text-on-surface"
            >
              -
            </button>
            <div
              className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-[18px] border px-4"
              style={{
                background: 'color-mix(in srgb, var(--surface-soft) 90%, transparent)',
                borderColor: 'color-mix(in srgb, var(--border) 92%, transparent)',
              }}
            >
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={maxExpectedMarks}
                step={1}
                value={currentExpectedMarks}
                onChange={handleExpectedInputChange}
                className="w-full bg-transparent text-center font-headline text-[1.7rem] font-bold uppercase text-secondary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setExpectedForActive((current) => current + 1)}
              className="theme-icon-button flex h-11 w-11 shrink-0 items-center justify-center text-on-surface"
            >
              +
            </button>
          </div>

          <div className="mt-7 grid grid-cols-6 gap-1.5 sm:gap-2">
            {['C', 'B', 'B+', 'A', 'A+', 'O'].map((grade) => {
              const gradeOption = GRADE_OPTIONS.find((option) => option.label === grade);
              const isActive = gradeOption?.min === currentTargetGrade;
              return (
                <button
                  key={grade}
                  type="button"
                  onClick={() => {
                    if (!activeSubject || !gradeOption) return;
                    setTargetGrades((current) => ({ ...current, [activeSubject.id]: gradeOption.min }));
                  }}
                  className="flex min-w-0 items-center justify-center"
                >
                  <span
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-full border font-headline text-[1.05rem] font-bold uppercase transition-all sm:h-12 sm:w-12 sm:text-[1.15rem]',
                      isActive ? 'text-[var(--text-inverse)] shadow-[var(--glow-primary)]' : 'text-on-surface-variant',
                    )}
                    style={isActive ? {
                      background: 'var(--primary-soft)',
                      borderColor: 'color-mix(in srgb, var(--primary) 76%, transparent)',
                    } : {
                      background: 'color-mix(in srgb, var(--surface-soft) 80%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--border) 90%, transparent)',
                      }}
                  >
                    {grade}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="mt-9 rounded-[30px] border px-5 py-6 text-center"
          style={{
            background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent) 0%, color-mix(in srgb, var(--surface-soft) 88%, transparent) 100%)',
            borderColor: 'color-mix(in srgb, var(--border) 76%, transparent)',
          }}
        >
          <p className="font-headline text-[3.1rem] font-bold lowercase leading-[0.9] text-on-surface sm:text-[3.7rem]">
            you need
          </p>
          <p className={cn('mt-3 font-headline text-[3rem] font-bold italic leading-[0.9] sm:text-[4rem]', neededToneClass)}>
            {neededMessage}
          </p>
          <p className="mt-4 font-label text-[12px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
            {activeSubject?.isFullyInternal
              ? `to secure an ${GRADE_OPTIONS.find((grade) => grade.min === currentTargetGrade)?.label ?? 'A'} grade in this internal-only course`
              : `to secure an ${GRADE_OPTIONS.find((grade) => grade.min === currentTargetGrade)?.label ?? 'A'} grade in semester exam`}
          </p>
        </div>

        <p className="mt-5 text-center font-label text-[10px] font-semibold lowercase tracking-[0.18em] text-on-surface-variant">
          {activeSubject?.isFullyInternal
            ? 'project-based subjects use 100 internal marks with no semester exam'
            : 'regular subjects use 60 internal marks and a 75-mark semester exam'}
        </p>
      </div>
    </section>
  );
}

export default function TargetGradeSheet({
  open,
  subjects,
  onClose,
}: {
  open: boolean;
  subjects: Subject[];
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.classList.add('predictor-open');

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      document.body.classList.remove('predictor-open');
    };
  }, [open]);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[999] flex min-h-screen w-full items-end justify-center overflow-hidden bg-black/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={onClose}
        >
          <motion.div
            className="relative flex h-[100dvh] w-full max-w-[28rem] touch-pan-y flex-col overflow-hidden border-0 px-0 pb-0 pt-0 overscroll-contain sm:max-w-[34rem] lg:max-w-[44rem] xl:max-w-[52rem]"
            style={{
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, black 4%) 0%, color-mix(in srgb, var(--surface-soft) 94%, transparent) 100%)',
              boxShadow: '0 28px 80px rgba(0,0,0,0.45)',
            }}
            initial={{ y: '100%', opacity: 0.96 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.92 }}
            transition={{ type: 'spring', stiffness: 170, damping: 24, mass: 0.9 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-70"
              style={{
                background: 'radial-gradient(circle at top, color-mix(in srgb, var(--primary) 12%, transparent) 0%, transparent 72%)',
              }}
            />

            <div className="relative flex items-center justify-start px-5 pt-3 sm:px-6">
              <div className="h-1.5 w-12 rounded-full bg-[color-mix(in_srgb,var(--text-muted)_24%,transparent)]" />
            </div>

            <div className="relative mt-3 min-h-0 flex-1 overflow-y-auto pb-8">
              <TargetGradeSheetContent subjects={subjects} onClose={onClose} />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
