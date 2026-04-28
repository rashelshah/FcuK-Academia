'use client';

import React, { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import ProgressBar from '../ui/ProgressBar';
import { Subject } from '@/lib/types';
import { cn } from '@/lib/utils';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface SubjectCardProps {
  subject: Subject;
  type: 'attendance' | 'marks';
}

function SubjectCard({ subject, type }: SubjectCardProps) {
  const isAttendance = type === 'attendance';
  const [flipped, setFlipped] = useState(false);
  const attPct = subject.attendance.percentage;
  const marksPct = subject.marks.totalInternal > 0
    ? (subject.marks.internal / subject.marks.totalInternal) * 100
    : 0;
  const examBoxes = useMemo(() => {
    const items = [...subject.marks.exams]
      .sort((a, b) => {
        if (a.obtained === null && b.obtained !== null) return 1;
        if (a.obtained !== null && b.obtained === null) return -1;
        return 0;
      });

    while (items.length < 3) {
      items.push({
        exam: 'TBA',
        obtained: null,
        maxMark: null,
      });
    }

    return items;
  }, [subject.marks.exams]);

  const attendanceMargin = Math.floor((subject.attendance.attended / 0.75) - subject.attendance.total);
  const attendanceRequired = Math.ceil((0.75 * subject.attendance.total - subject.attendance.attended) / 0.25);
  const attendancePillClass = attPct < 75
    ? 'text-error'
    : attendanceMargin === 0
      ? 'text-secondary'
      : 'text-success';
  const attendancePillLabel = attPct < 75
    ? `required: ${Math.max(0, attendanceRequired)}`
    : `margin: ${Math.max(0, attendanceMargin)}`;

  // Keep the original marks card color logic unchanged on the front face.
  let colorClass = 'text-primary';
  let glowColor: 'primary' | 'secondary' | 'error' = 'primary';
  let hexColor = 'var(--primary)';

  if (isAttendance) {
    if (attPct < 75) {
      glowColor = 'error';
      colorClass = 'text-error';
      hexColor = 'var(--error)';
    } else if (attPct > 90) {
      glowColor = 'secondary';
      colorClass = 'text-secondary';
      hexColor = 'var(--secondary)';
    }
  } else {
    glowColor = 'secondary';
    if (marksPct > 90) {
      hexColor = 'var(--secondary)';
      colorClass = 'text-secondary';
    }
  }

  const chartData = useMemo(
    () => examBoxes
      .filter((exam) => exam.obtained !== null && exam.maxMark !== null)
      .map((exam) => ({
        exam: exam.exam.replace(/internal|assessment/gi, '').trim() || exam.exam,
        obtained: Number(exam.obtained ?? 0),
        max: Number(exam.maxMark ?? 0),
        remaining: Math.max(0, Number(exam.maxMark ?? 0) - Number(exam.obtained ?? 0)),
      })),
    [examBoxes],
  );

  if (isAttendance) {
    return (
      <div className="theme-card relative flex flex-col gap-4 p-5 md:p-6">
        <GlowEdge glowColor={glowColor} />
        <AttendanceCardBody
          subject={subject}
          attPct={attPct}
          attendancePillClass={attendancePillClass}
          attendancePillLabel={attendancePillLabel}
          colorClass={colorClass}
          hexColor={hexColor}
        />
      </div>
    );
  }

  const gridCols = examBoxes.length >= 4 ? 4 : 3;
  const numRows = Math.ceil(examBoxes.length / gridCols);
  
  // Account for long titles wrapping (approx 18-20 chars per line at 62% width)
  const estimatedTitleLines = Math.ceil(subject.name.length / 18);
  const titleBuffer = Math.max(0, estimatedTitleLines - 2) * 1.6;

  const cardHeight = 22.5 + Math.max(0, numRows - 1) * 4.75 + titleBuffer;
  const mobileCardHeight = 21.75 + Math.max(0, numRows - 1) * 4.75 + titleBuffer;

  return (
    <div
      className="relative [perspective:1000px]"
      onClick={() => setFlipped((current) => !current)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setFlipped((current) => !current);
        }
      }}
      aria-label={`Flip ${subject.name} marks card`}
      aria-pressed={flipped}
    >
      <motion.div
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        className="relative cursor-pointer [transform-style:preserve-3d]"
        style={{
          transformStyle: 'preserve-3d',
          minHeight: `${cardHeight}rem`,
        }}
      >
        <div
          className="absolute inset-0 [backface-visibility:hidden]"
          style={{
            backfaceVisibility: 'hidden',
            minHeight: `${cardHeight}rem`,
          }}
        >
          <div
            className="theme-card relative h-full px-5 pb-8 pt-5 md:px-6 md:pb-9 md:pt-6"
            style={{ minHeight: `${cardHeight}rem` }}
          >
            <style jsx>{`
              @media (max-width: 380px) {
                .theme-card { min-height: ${mobileCardHeight}rem !important; }
              }
            `}</style>
            <GlowEdge glowColor={glowColor} />
            <MarksCardFront subject={subject} examBoxes={examBoxes} hexColor={hexColor} marksPct={marksPct} />
          </div>
        </div>

        <div
          className="absolute inset-0 [backface-visibility:hidden]"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            minHeight: `${cardHeight}rem`,
          }}
        >
          <div
            className="theme-card relative flex h-full flex-col px-4 pb-6 pt-4 md:px-5 md:pb-7 md:pt-5"
            style={{ minHeight: `${cardHeight}rem` }}
          >
            <GlowEdge glowColor={glowColor} />
            <MarksCardBack subject={subject} chartData={chartData} lineColor={hexColor} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function GlowEdge({ glowColor }: { glowColor: 'primary' | 'secondary' | 'error' }) {
  return (
    <div
      className={cn(
        'absolute left-0 top-0 bottom-0 w-1 rounded-l-[inherit]',
        glowColor === 'primary'
          ? 'bg-primary shadow-[0_0_15px_var(--primary)]'
          : glowColor === 'secondary'
            ? 'bg-secondary shadow-[0_0_15px_var(--secondary)]'
            : 'bg-error shadow-[0_0_15px_var(--error)]',
      )}
    />
  );
}

function AttendanceCardBody({
  subject,
  attPct,
  attendancePillClass,
  attendancePillLabel,
  colorClass,
  hexColor,
}: {
  subject: Subject;
  attPct: number;
  attendancePillClass: string;
  attendancePillLabel: string;
  colorClass: string;
  hexColor: string;
}) {
  const attendanceMargin = Math.floor((subject.attendance.attended / 0.75) - subject.attendance.total);

  return (
    <>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-headline text-xl font-bold lowercase leading-tight text-on-surface">{subject.name}</h3>
          <p className="mt-1 font-label text-[11px] tracking-[0.16em] text-on-surface-variant">{subject.attendance.attended} of {subject.attendance.total} sessions attended</p>
          <span
            className={cn('inline-flex mt-2 rounded-full border px-2.5 py-1 font-label text-[9px] font-bold tracking-[0.18em] uppercase', attendancePillClass)}
            style={
              attPct < 75
                ? {
                    borderColor: 'color-mix(in srgb, var(--error) 30%, transparent)',
                    background: 'color-mix(in srgb, var(--error) 14%, transparent)',
                  }
                : attendanceMargin === 0
                  ? {
                      borderColor: 'color-mix(in srgb, var(--secondary) 26%, transparent)',
                      background: 'color-mix(in srgb, var(--secondary) 14%, transparent)',
                    }
                  : {
                      borderColor: 'color-mix(in srgb, var(--success) 30%, transparent)',
                      background: 'color-mix(in srgb, var(--success) 14%, transparent)',
                    }
            }
          >
            {attendancePillLabel}
          </span>
        </div>
        <span className={cn('font-headline text-[2rem] font-bold tracking-tighter', colorClass)}>
          {attPct.toFixed(1)}%
        </span>
      </div>
      <ProgressBar value={attPct} color={hexColor} showText={false} />
    </>
  );
}

function MarksCardFront({
  subject,
  examBoxes,
  hexColor,
  marksPct,
}: {
  subject: Subject;
  examBoxes: { exam: string; obtained: number | null; maxMark: number | null }[];
  hexColor: string;
  marksPct: number;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-between items-start">
        <h3 className="max-w-[62%] font-headline text-[1.7rem] font-bold lowercase leading-[0.95] text-on-surface">{subject.name}</h3>
        <div
          className="rounded-full px-3 py-1 font-label text-[9px] font-bold tracking-[0.18em] text-secondary"
          style={{
            background: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--secondary) 24%, transparent)',
          }}
        >
          {subject.credits} CREDITS
        </div>
      </div>
      <div className={cn(
        'mt-4 grid gap-3',
        examBoxes.length >= 4 ? 'grid-cols-4 gap-2' : 'grid-cols-3 gap-3',
      )}>
        {examBoxes.map((exam, index) => {
          const isPending = exam.obtained === null || exam.maxMark === null;
          const isSmall = examBoxes.length >= 4;

          return (
            <div
              key={`${exam.exam}-${index}`}
              className={cn(
                'min-w-0 rounded-[16px] border text-center',
                isSmall ? 'px-1 py-2' : 'px-2 py-2.5',
                isPending
                  ? 'border-dashed bg-transparent'
                  : 'shadow-[var(--glow-primary)]',
              )}
              style={isPending ? { borderColor: 'var(--border)' } : {
                borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)',
                background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
              }}
            >
              <p className={cn(
                'font-label font-bold tracking-[0.16em] uppercase',
                isSmall ? 'text-[8px]' : 'text-[9px]',
                isPending ? 'text-on-surface-variant' : 'text-primary/70',
              )}
              >
                {exam.exam}
              </p>
              {isPending ? (
                <p className="mt-2 font-headline text-[1.2rem] font-bold leading-none tracking-tighter text-on-surface-variant">
                  TBA
                </p>
              ) : (
                <div className="mt-1.5 flex flex-col items-center">
                  <p className="font-headline text-[1.15rem] font-bold leading-none tracking-tighter text-primary">
                    {exam.obtained?.toFixed(2)}
                  </p>
                  <p className="mt-1 font-label text-[9px] font-bold tracking-[0.14em] text-primary/70">
                    / {exam.maxMark?.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <ProgressBar value={marksPct} color={hexColor} className="mt-4" />
      <div className="mt-auto w-full flex items-baseline justify-end gap-1 pb-2 pt-7 text-right">
        <span className="font-headline text-[2.6rem] font-bold leading-none tracking-tighter text-on-surface">
          {subject.marks.internal.toFixed(2)}
        </span>
        <span className="font-headline text-[1.15rem] font-bold leading-none tracking-tighter text-on-surface-variant/50">
          / {subject.marks.totalInternal.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function MarksCardBack({
  subject,
  chartData,
  lineColor,
}: {
  subject: Subject;
  chartData: { exam: string; obtained: number; max: number; remaining: number }[];
  lineColor: string;
}) {
  const isCompact = chartData.length > 2;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="theme-kicker">marks trend</p>
          <h3
            className={cn(
              'mt-1 line-clamp-2 font-headline font-bold lowercase leading-[0.85] text-on-surface',
              isCompact
                ? 'text-[1.3rem] max-[380px]:text-[1.15rem]'
                : 'text-[1.45rem] max-[380px]:text-[1.25rem]',
            )}
          >
            {subject.name}
          </h3>
        </div>
        <div
          className={cn(
            'rounded-full font-label text-[8px] font-bold uppercase tracking-[0.16em] text-on-surface max-[380px]:px-2 max-[380px]:text-[7px]',
            isCompact ? 'px-2 py-0.5' : 'px-2.5 py-1',
          )}
          style={{
            background: 'color-mix(in srgb, var(--surface-elevated) 88%, transparent)',
            border: '1px solid var(--border)',
          }}
        >
          tap to close
        </div>
      </div>

      <div
        className={cn(
          'mt-2.5 flex min-h-0 flex-1 flex-col rounded-[18px] border max-[380px]:mt-2 max-[380px]:rounded-[16px]',
          isCompact ? 'p-2.5 max-[380px]:p-2' : 'p-3 max-[380px]:p-2.5',
        )}
        style={{
          background: 'color-mix(in srgb, var(--surface-soft) 90%, transparent)',
          borderColor: 'color-mix(in srgb, var(--border) 88%, transparent)',
        }}
      >
        {chartData.length ? (
          <div className={cn('w-full shrink-0', isCompact ? 'h-24 max-[380px]:h-20' : 'h-32 max-[380px]:h-28')}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(165,175,157,0.12)" vertical={false} />
                <XAxis
                  dataKey="exam"
                  tick={{ fill: 'var(--text-muted)', fontSize: 9, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 9, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                  domain={[0, 'dataMax']}
                />
                <Tooltip content={<MarksTooltip lineColor={lineColor} />} cursor={{ stroke: 'rgba(165,175,157,0.18)' }} />
                <Bar dataKey="obtained" fill="color-mix(in srgb, var(--surface-highlight) 92%, transparent)" radius={[8, 8, 8, 8]} maxBarSize={28} />
                <Line
                  type="monotone"
                  dataKey="obtained"
                  stroke={lineColor}
                  strokeWidth={2.5}
                  dot={{ r: 3.5, strokeWidth: 2, fill: lineColor, stroke: 'var(--surface)' }}
                  activeDot={{ r: 5, fill: lineColor, stroke: 'var(--surface)', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div
            className={cn(
              'flex items-center justify-center rounded-[16px] border border-dashed border-[var(--border)] text-center font-semibold text-on-surface-variant',
              isCompact
                ? 'h-24 text-[13px] max-[380px]:h-20 max-[380px]:text-xs'
                : 'h-32 text-sm max-[380px]:h-28 max-[380px]:text-[13px]',
            )}
          >
            no chart data yet
          </div>
        )}

        <div
          className={cn(
            'grid',
            chartData.length === 3 ? 'grid-cols-3' : 'grid-cols-2',
            isCompact ? 'mt-2 gap-1.5 max-[380px]:mt-1.5 max-[380px]:gap-1' : 'mt-2.5 gap-2 max-[380px]:mt-2 max-[380px]:gap-1.5',
          )}
        >
          {chartData.map((point) => (
            <div
              key={point.exam}
              className={cn(
                'rounded-[12px] border max-[380px]:rounded-[10px]',
                isCompact ? 'px-2 py-1.5 max-[380px]:px-1.5 max-[380px]:py-1.5' : 'px-2.5 py-2 max-[380px]:px-2 max-[380px]:py-1.5',
              )}
              style={{
                background: 'color-mix(in srgb, var(--surface-elevated) 84%, transparent)',
                borderColor: 'color-mix(in srgb, var(--border) 90%, transparent)',
              }}
            >
              <p
                className={cn(
                  'truncate font-label font-bold uppercase tracking-[0.18em] text-on-surface-variant',
                  isCompact ? 'text-[8px] max-[380px]:text-[7px]' : 'text-[9px] max-[380px]:text-[8px]',
                )}
              >
                {point.exam}
              </p>
              <p
                className={cn(
                  'font-headline font-bold text-on-surface',
                  isCompact ? 'mt-0.5 text-[0.95rem] max-[380px]:text-[0.88rem]' : 'mt-1 text-[1.05rem] max-[380px]:text-[0.95rem]',
                )}
              >
                {point.obtained.toFixed(2)}
              </p>
              <p
                className={cn(
                  'font-label font-bold tracking-[0.14em] text-on-surface-variant',
                  isCompact ? 'text-[8px] max-[380px]:text-[7px]' : 'text-[9px] max-[380px]:text-[8px]',
                )}
              >
                of {point.max.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarksTooltip({
  active,
  payload,
  label,
  lineColor,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    value?: number;
    payload?: {
      obtained?: number;
      max?: number;
    };
  }>;
  label?: string;
  lineColor: string;
}) {
  if (!active || !payload?.length) return null;

  const chartPoint = payload[0]?.payload;
  const obtainedSeries = payload.find((entry) => entry.dataKey === 'obtained');
  const obtained = Number(chartPoint?.obtained ?? obtainedSeries?.value ?? 0);
  const max = Number(chartPoint?.max ?? 0);

  return (
    <div
      className="rounded-[16px] px-3 py-2 text-xs font-semibold text-on-surface"
      style={{
        background: 'color-mix(in srgb, var(--surface) 96%, black 4%)',
        border: `1px solid color-mix(in srgb, ${lineColor} 32%, transparent)`,
        boxShadow: 'var(--elevation-card)',
      }}
    >
      <div className="font-label uppercase tracking-[0.18em] text-on-surface-variant">{label}</div>
      <div className="mt-1" style={{ color: lineColor }}>
        {obtained.toFixed(2)} / {max.toFixed(2)}
      </div>
    </div>
  );
}

export default memo(SubjectCard);
