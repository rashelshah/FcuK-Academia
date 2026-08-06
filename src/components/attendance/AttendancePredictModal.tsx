'use client';

import React, { memo, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { combineAttendanceSubjects, getClassWindow, getClassesForDay, inferAttendanceComponent } from '@/lib/academia-ui';
import type { RawAttendanceItem, RawCalendarMonth, RawTimetableItem } from '@/lib/server/academia';
import type { Subject } from '@/lib/types';
import { cn } from '@/lib/utils';

type PredictionMode = 'leaves' | 'attending';
type ModalStep = 'picker' | 'results';

interface AttendancePredictModalProps {
  open: boolean;
  attendanceList: RawAttendanceItem[];
  calendar: RawCalendarMonth[];
  timetable: RawTimetableItem[];
  loading?: boolean;
  onApply: (subjects: Subject[]) => void;
  onClose: () => void;
}

interface AttendancePredictionResult {
  courseCode: string;
  courseTitle: string;
  attendanceComponent: 'theory' | 'practical';
  attendance: number;
  status: 'safe' | 'danger';
  margin: number;
  required: number;
  conducted: number;
  attended: number;
  sessionsAffected: number;
  accentColor: string;
  accentGlow: string;
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseCalendarMonthLabel(label: string) {
  const match = label.match(/([A-Za-z]{3,9})\s*'?\s*(\d{2,4})/);
  if (!match) return null;

  const monthName = match[1];
  const yearText = match[2];
  const date = new Date(`${monthName} 1, ${yearText.length === 2 ? `20${yearText}` : yearText}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getCalendarDateKey(monthLabel: string, dateText: string) {
  const monthDate = parseCalendarMonthLabel(monthLabel);
  const numericDate = Number(dateText);
  if (!monthDate || Number.isNaN(numericDate)) return null;

  return formatDateKey(new Date(monthDate.getFullYear(), monthDate.getMonth(), numericDate));
}

function getDayOrderValue(dayOrder?: string) {
  const numeric = Number(dayOrder);
  return Number.isNaN(numeric) || numeric <= 0 ? null : numeric;
}

function isHolidayLike(event?: string) {
  const normalized = (event || '').trim().toLowerCase();
  if (!normalized || normalized === '-') return false;
  return /(holiday|leave|vacation|break|festival|closed|no class)/i.test(normalized);
}

function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function addDays(date: Date, value: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + value);
  return next;
}

function getCalendarGrid(month: Date) {
  const monthStart = getMonthStart(month);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const leadingEmptyCells = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  return [
    ...Array.from({ length: leadingEmptyCells }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => addDays(monthStart, index)),
  ];
}

function toPredictionResults(
  attendanceSubjects: Subject[],
  sessionImpact: Record<string, { total: number; attended: number }>,
): AttendancePredictionResult[] {
  return attendanceSubjects.map((item) => {
    const conducted = item.attendance.total;
    const attended = item.attendance.attended;
    const impact = sessionImpact[item.id] || { total: 0, attended: 0 };
    const newTotal = conducted + impact.total;
    const newAttended = attended + impact.attended;
    const newAttendance = newTotal ? (newAttended / newTotal) * 100 : 0;
    const status: AttendancePredictionResult['status'] = newAttendance >= 75 ? 'safe' : 'danger';
    const margin = Math.max(0, Math.floor((newAttended / 0.75) - newTotal));
    const required = Math.max(0, Math.ceil(((0.75 * newTotal) - newAttended) / 0.25));
    let accentColor = 'var(--accent)';
    let accentGlow = '0 0 22px rgba(255, 138, 91, 0.2)';

    if (newAttendance < 75) {
      accentColor = 'var(--error)';
      accentGlow = '0 0 22px rgba(255, 122, 104, 0.22)';
    } else if (margin === 0) {
      accentColor = 'var(--accent)';
      accentGlow = '0 0 22px rgba(255, 138, 91, 0.2)';
    } else {
      accentColor = 'var(--warning)';
      accentGlow = '0 0 22px rgba(255, 204, 105, 0.2)';
    }

    return {
      courseCode: item.code,
      courseTitle: item.name,
      attendanceComponent: item.attendanceComponent ?? 'theory',
      attendance: newAttendance,
      status,
      margin,
      required,
      conducted: newTotal,
      attended: newAttended,
      sessionsAffected: impact.total,
      accentColor,
      accentGlow,
    };
  }).sort((left, right) => {
    const leftScore = left.status === 'danger' ? left.required + 1000 : -left.margin;
    const rightScore = right.status === 'danger' ? right.required + 1000 : -right.margin;
    return rightScore - leftScore;
  });
}

const weekdayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function AttendancePredictModal({
  open,
  attendanceList,
  calendar,
  timetable,
  loading = false,
  onApply,
  onClose,
}: AttendancePredictModalProps) {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStart(today));
  const [predictionMode, setPredictionMode] = useState<PredictionMode>('leaves');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [step, setStep] = useState<ModalStep>('picker');
  const attendanceSubjects = useMemo(
    () => combineAttendanceSubjects(attendanceList).sort((left, right) => {
      const componentPriority = left.attendanceComponent === right.attendanceComponent
        ? 0
        : left.attendanceComponent === 'practical'
          ? 1
          : -1;
      if (componentPriority !== 0) return componentPriority;

      const leftPriority = left.attendance.percentage < 75 ? 0 : 1;
      const rightPriority = right.attendance.percentage < 75 ? 0 : 1;
      if (leftPriority !== rightPriority) return leftPriority - rightPriority;

      return left.attendance.percentage - right.attendance.percentage;
    }),
    [attendanceList],
  );
  const calendarDayMap = useMemo(() => {
    const entries = new Map<string, { dayOrder: number | null; disabled: boolean }>();

    calendar.forEach((month) => {
      month.days.forEach((day) => {
        const key = getCalendarDateKey(month.month, day.date);
        if (!key) return;

        const weekday = (day.day || '').trim().toLowerCase();
        const dayOrder = getDayOrderValue(day.dayOrder);
        const disabled = weekday.startsWith('sat')
          || weekday.startsWith('sun')
          || dayOrder === null
          || isHolidayLike(day.event);

        entries.set(key, { dayOrder, disabled });
      });
    });

    return entries;
  }, [calendar]);
  const sessionImpact = useMemo(() => {
    const impact: Record<string, { total: number; attended: number }> = {};
    if (!selectedKeys.length) return impact;

    const sortedSelected = [...selectedKeys].sort();
    const maxDateKey = sortedSelected[sortedSelected.length - 1];
    const [year, month, day] = maxDateKey.split('-').map(Number);
    const endDate = new Date(year, month - 1, day);
    
    let currentDate = new Date(today);
    const now = new Date();
    const currentMinutes = (now.getHours() * 60) + now.getMinutes();

    while (currentDate <= endDate) {
      const dateKey = formatDateKey(currentDate);
      const isSelected = selectedKeys.includes(dateKey);
      const isToday = isSameDay(currentDate, today);

      const dayInfo = calendarDayMap.get(dateKey);
      if (dayInfo && !dayInfo.disabled && dayInfo.dayOrder !== null) {
        const classes = getClassesForDay(timetable, dayInfo.dayOrder);
        classes.forEach((item) => {
          if (!item.courseCode) return;
          
          if (isToday) {
            const window = getClassWindow(item);
            if (!window || window.start <= currentMinutes) return;
          }

          const component = inferAttendanceComponent(item.slot, item.courseCategory, item.courseType);
          const subjectId = `${item.courseCode}-${component}`;
          if (!attendanceSubjects.some((subject) => subject.id === subjectId)) return;
          
          if (!impact[subjectId]) impact[subjectId] = { total: 0, attended: 0 };
          
          impact[subjectId].total += 1;
          
          if (predictionMode === 'leaves') {
            if (!isSelected) impact[subjectId].attended += 1;
          } else {
            if (isSelected) impact[subjectId].attended += 1;
          }
        });
      }
      
      currentDate = addDays(currentDate, 1);
    }

    return impact;
  }, [attendanceSubjects, calendarDayMap, selectedKeys, timetable, today, predictionMode]);
  const totalAffectedSessions = useMemo(
    () => Object.values(sessionImpact).reduce((sum, value) => sum + value.total, 0),
    [sessionImpact],
  );

  useEffect(() => {
    if (!open) return;

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

  const calendarDays = useMemo(() => getCalendarGrid(visibleMonth), [visibleMonth]);
  const totalDaysSelected = selectedKeys.length;
  const results = useMemo(
    () => toPredictionResults(attendanceSubjects, sessionImpact),
    [attendanceSubjects, sessionImpact],
  );
  const theoryResults = useMemo(
    () => results.filter((item) => item.attendanceComponent !== 'practical'),
    [results],
  );
  const practicalResults = useMemo(
    () => results.filter((item) => item.attendanceComponent === 'practical'),
    [results],
  );
  const appliedSubjects = useMemo<Subject[]>(
    () => results.map((item) => ({
      id: `${item.courseCode}-${item.attendanceComponent}`,
      name: item.courseTitle,
      code: item.courseCode,
      attendanceComponent: item.attendanceComponent,
      teacher: 'faculty tba',
      credits: 0,
      attendance: {
        attended: item.attended,
        total: item.conducted,
        percentage: item.attendance,
      },
      marks: {
        internal: 0,
        totalInternal: 0,
        exams: [],
        grade: undefined,
      },
    })),
    [results],
  );

  function resetState() {
    setPredictionMode('leaves');
    setSelectedKeys([]);
    setStep('picker');
    setVisibleMonth(getMonthStart(today));
  }

  function handleClose() {
    resetState();
    onClose();
  }

  function toggleSingleDate(key: string) {
    setSelectedKeys((current) => (
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key].sort()
    ));
  }

  function handleDateSelection(date: Date) {
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (normalizedDate < today) return;

    const key = formatDateKey(normalizedDate);
    const dateMeta = calendarDayMap.get(key);
    if (!dateMeta || dateMeta.disabled) return;

    toggleSingleDate(key);
  }

  function showPreviousMonth() {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  function showNextMonth() {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  function handleConfirm() {
    if (!selectedKeys.length) return;
    setStep('results');
  }

  function handleApply() {
    onApply(appliedSubjects);
    handleClose();
  }

  const actionLabel = predictionMode === 'leaves' ? 'leave days selected' : 'attending days selected';

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
        >
          <motion.div
            className="relative flex h-[100dvh] w-full max-w-[28rem] touch-pan-y flex-col overflow-hidden border px-4 pb-6 pt-5 overscroll-contain sm:max-w-[34rem] sm:px-6 lg:max-w-[44rem] xl:max-w-[52rem]"
            style={{
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, black 4%) 0%, color-mix(in srgb, var(--surface-soft) 94%, transparent) 100%)',
              borderColor: 'var(--border-strong)',
              boxShadow: '0 28px 80px rgba(0,0,0,0.45)',
            }}
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-70" style={{ background: 'var(--hero-gradient)' }} />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="theme-kicker">predict</p>
                <h2 className="mt-2 font-headline text-[2.6rem] font-bold leading-[0.9] tracking-tight text-on-surface">
                  PREDICT
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {predictionMode === 'leaves' ? 'plan your leaves' : 'plan your presence'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="theme-icon-button flex items-center justify-center"
                aria-label="Close attendance predictor"
              >
                <X size={18} />
              </button>
            </div>

            {step === 'picker' ? (
              <div className="relative z-10 mt-6 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain pb-2">
                <div className="grid grid-cols-2 gap-3">
                  {(['leaves', 'attending'] as const).map((mode) => {
                    const active = predictionMode === mode;

                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPredictionMode(mode)}
                        className={cn(
                          'rounded-[24px] border px-4 py-3 font-label text-[11px] font-bold uppercase tracking-[0.22em] transition-all',
                          active ? 'text-[var(--text-inverse)] shadow-[var(--glow-primary)]' : 'text-on-surface-variant',
                        )}
                        style={active ? {
                          background: 'var(--primary)',
                          borderColor: 'var(--primary)',
                        } : {
                          background: 'color-mix(in srgb, var(--surface-soft) 90%, transparent)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>

                <div
                  className="flex flex-none flex-col rounded-[32px] border p-5"
                  style={{
                    background: 'color-mix(in srgb, var(--surface-soft) 88%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--primary) 18%, var(--border))',
                    boxShadow: 'var(--elevation-card)',
                  }}
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <button type="button" onClick={showPreviousMonth} className="theme-icon-button flex items-center justify-center">
                      <ChevronLeft size={18} />
                    </button>
                    <div className="text-center">
                      <p className="font-headline text-xl font-bold text-on-surface">
                        {visibleMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                        tap to select
                      </p>
                    </div>
                    <button type="button" onClick={showNextMonth} className="theme-icon-button flex items-center justify-center">
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center">
                    {weekdayLabels.map((label) => (
                      <span key={label} className="font-label text-[9px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-2">
                    {calendarDays.map((date, index) => {
                      if (!date) {
                        return <div key={`empty-${index}`} aria-hidden="true" className="aspect-square" />;
                      }

                      const key = formatDateKey(date);
                      const selected = selectedKeys.includes(key);
                      const dateMeta = calendarDayMap.get(key);
                      const disabled = date < today || !dateMeta || dateMeta.disabled;
                      const isToday = isSameDay(date, today);

                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={disabled}
                          onClick={() => handleDateSelection(date)}
                          className={cn(
                            'relative flex aspect-square items-center justify-center rounded-[18px] border text-sm font-semibold transition-all',
                            disabled && 'cursor-not-allowed opacity-35',
                            !disabled && !selected && 'hover:-translate-y-0.5',
                            !selected && 'text-on-surface',
                          )}
                          style={selected ? {
                            background: 'color-mix(in srgb, var(--primary) 24%, transparent)',
                            borderColor: 'var(--primary)',
                            boxShadow: 'var(--glow-primary)',
                            color: 'var(--primary)',
                          } : {
                            background: isToday
                              ? 'color-mix(in srgb, var(--secondary) 10%, transparent)'
                              : 'color-mix(in srgb, var(--surface-elevated) 84%, transparent)',
                            borderColor: isToday
                              ? 'color-mix(in srgb, var(--secondary) 28%, transparent)'
                              : 'var(--border)',
                          }}
                        >
                          {date.getDate()}
                          {isToday && !selected ? (
                            <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-secondary shadow-[var(--glow-secondary)]" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  className="shrink-0 rounded-[28px] border p-5"
                  style={{
                    background: 'color-mix(in srgb, var(--surface-soft) 92%, transparent)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="theme-kicker">{actionLabel}</p>
                      <p className="mt-2 font-headline text-3xl font-bold text-on-surface">{totalDaysSelected}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                        {totalAffectedSessions} classes affected
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={!selectedKeys.length || loading}
                      className="rounded-[22px] px-5 py-3 font-label text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-inverse)] transition-all disabled:cursor-not-allowed disabled:opacity-45"
                      style={{
                        background: 'var(--primary)',
                        boxShadow: 'var(--glow-primary)',
                      }}
                    >
                      confirm
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 mt-6 flex min-h-0 flex-1 flex-col gap-5">
                <div
                  className="rounded-[28px] border px-5 py-4"
                  style={{
                    background: 'color-mix(in srgb, var(--surface-soft) 92%, transparent)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="theme-kicker">prediction summary</p>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        {totalDaysSelected} date{totalDaysSelected === 1 ? '' : 's'} selected / {totalAffectedSessions} class session{totalAffectedSessions === 1 ? '' : 's'} affected
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('picker')}
                      className="rounded-[18px] border px-3 py-2 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface-elevated)' }}
                    >
                      edit dates
                    </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                  <div className="space-y-4">
                    {theoryResults.map((item) => <PredictionCard key={`${item.courseCode}-${item.courseTitle}`} item={item} />)}
                  </div>
                  {practicalResults.length ? (
                    <div className="mt-8 space-y-4">
                      <p className="theme-kicker px-1">practical</p>
                      {practicalResults.map((item) => <PredictionCard key={`${item.courseCode}-${item.courseTitle}`} item={item} />)}
                    </div>
                  ) : null}
                </div>

                <div
                  className="flex items-center justify-between gap-4 rounded-[24px] border px-5 py-4"
                  style={{
                    background: 'color-mix(in srgb, var(--surface-soft) 94%, transparent)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <CalendarDays size={18} className="text-primary" />
                    <span className="text-sm">{selectedKeys.length} dates / {totalAffectedSessions} class sessions applied locally</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="rounded-[18px] px-4 py-2 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-inverse)]"
                    style={{ background: 'var(--primary)', boxShadow: 'var(--glow-primary)' }}
                  >
                    done
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function PredictionCard({ item }: { item: AttendancePredictionResult }) {
  return (
    <div
      className="relative overflow-hidden rounded-[30px] border p-5"
      style={{
        background: 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 8%, var(--surface)) 0%, color-mix(in srgb, var(--surface) 96%, transparent) 100%)',
        borderColor: 'color-mix(in srgb, var(--accent) 18%, var(--border))',
        boxShadow: item.accentGlow,
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[30px]"
        style={{
          background: item.accentColor,
          boxShadow: `0 0 15px ${item.accentColor}`,
        }}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-headline text-[1.55rem] font-bold lowercase leading-[0.98] text-on-surface">
            {item.courseTitle.toLowerCase()}
          </h3>
          <p className="mt-2 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
            {item.attended} of {item.conducted} sessions attended
          </p>
          <span
            className="mt-3 inline-flex rounded-full border px-3 py-1 font-label text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{
              color: item.accentColor,
              borderColor: `color-mix(in srgb, ${item.accentColor} 30%, transparent)`,
              background: `color-mix(in srgb, ${item.accentColor} 14%, transparent)`,
            }}
          >
            {item.status === 'safe' ? `margin: ${item.margin}` : `required: ${item.required}`}
          </span>
        </div>
        <span
          className="shrink-0 font-headline text-[2.3rem] font-bold leading-none tracking-tight"
          style={{ color: item.accentColor }}
        >
          {item.attendance.toFixed(1)}%
        </span>
      </div>

      <div
        className="mt-5 h-3 overflow-hidden rounded-full"
        style={{ background: 'color-mix(in srgb, var(--surface-elevated) 84%, transparent)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, item.attendance)}%`,
            background: item.accentColor,
            boxShadow: item.accentGlow,
          }}
        />
      </div>
    </div>
  );
}

export default memo(AttendancePredictModal);
