import React, { useMemo } from 'react';
import type { RawTimetableItem } from '@/lib/server/academia';
import { getDayOrders, getClassesForDay } from '@/lib/academia-ui';
import { cn } from '@/lib/utils';

export default function ThemedTimetableGrid({ 
  timetable, 
  id 
}: { 
  timetable: RawTimetableItem[];
  id?: string;
}) {
  const dayOrders = useMemo(() => getDayOrders(timetable), [timetable]);
  
  const allTimeSlots = useMemo(() => {
    const slots = new Set<string>();
    timetable.forEach(day => {
      day.class.forEach(cls => {
        if (cls.isClass && cls.time) {
          slots.add(cls.time);
        }
      });
    });
    // Sort slots logically (converting academic 12h time to minutes)
    return Array.from(slots).sort((a, b) => {
      const parseTime = (timeStr: string) => {
        const [hourStr, minStr] = timeStr.split(':');
        let hour = parseInt(hourStr, 10);
        const min = parseInt(minStr, 10);
        if (hour < 8) hour += 12; // 01:00 to 07:59 are PM
        return hour * 60 + min;
      };
      
      const aStart = a.split('-')[0].trim();
      const bStart = b.split('-')[0].trim();
      
      return parseTime(aStart) - parseTime(bStart);
    });
  }, [timetable]);

  if (!timetable || timetable.length === 0) return null;

  return (
    <div id={id} className="theme-card min-w-[1650px] p-10 flex flex-col gap-8 bg-background border-0 rounded-none shadow-none">
      <div className="flex justify-between items-center px-2">
        <span className="text-[48px] font-bold normal-case tracking-tight text-primary" style={{ fontFamily: 'Qelandsaightrial' }}>fcuk academia</span>
        <div className="inline-flex rounded-full px-6 py-2 font-headline text-[16px] font-bold tracking-widest bg-primary text-on-primary">
          TIMETABLE
        </div>
      </div>
      
      <div className="rounded-xl overflow-hidden border-2 border-border mt-4">
        <table className="w-full border-collapse bg-surface">
          <thead>
            <tr>
              <th className="w-24 bg-surface-variant/50 text-on-surface border-b-2 border-r-2 border-border p-4 font-headline">
                Time
              </th>
              {allTimeSlots.map((slot, i) => {
                const parts = slot.split('-');
                return (
                  <th key={slot} className="w-[120px] bg-surface-variant/50 text-on-surface border-b-2 border-r border-border p-3 font-headline text-center align-middle">
                    <div className="text-[14px] font-bold tracking-wider">{parts[0]?.trim()}</div>
                    <div className="text-[12px] font-bold opacity-80 mt-1 tracking-wider">{parts[1]?.trim()}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {dayOrders.map((dayOrder) => {
              const classes = getClassesForDay(timetable, dayOrder);
              return (
                <tr key={dayOrder}>
                  <td className="w-24 bg-primary text-on-primary border-b border-r-2 border-border font-headline text-[20px] font-bold text-center align-middle p-4">
                    Day {dayOrder}
                  </td>
                  {allTimeSlots.map((slot) => {
                    const cls = classes.find(c => c.time === slot);
                    return (
                      <td key={slot} className="border-b border-r border-border p-0 align-top h-[110px]">
                        {cls ? (
                          <div className="h-full bg-primary/10 p-3 flex flex-col">
                            <span className="font-headline text-[11px] font-bold leading-tight uppercase line-clamp-2 text-primary">
                              {cls.courseTitle}
                            </span>
                            <span className="font-label text-[9px] truncate mt-1 text-on-surface-variant">
                              {cls.faculty}
                            </span>
                            <div className="mt-auto pt-2">
                              <span className="font-label text-[10px] font-bold text-primary">
                                {cls.courseRoomNo}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full bg-background"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
