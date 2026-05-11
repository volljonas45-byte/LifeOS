"use client";

import { cn } from "@/lib/utils";
import type { Habit } from "@/lib/types";

const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

interface WeekStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  habits: Habit[];
  isCompleted: (id: string, date: string) => boolean;
}

export function WeekStrip({ selectedDate, onSelectDate, habits, isCompleted }: WeekStripProps) {
  // Build 7-day window centered on today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    const iso = d.toISOString().slice(0, 10);
    const isToday = iso === today.toISOString().slice(0, 10);
    const isSelected = iso === selectedDate;
    const isFuture = d > today;

    // Completion rate for this day
    const rate = habits.length > 0
      ? habits.filter(h => isCompleted(h.id, iso)).length / habits.length
      : 0;

    return { d, iso, isToday, isSelected, isFuture, rate, dayLabel: DAY_LABELS[d.getDay()], dayNum: d.getDate() };
  });

  return (
    <div className="flex items-end justify-between gap-1">
      {days.map(({ d, iso, isToday, isSelected, isFuture, rate, dayLabel, dayNum }) => {
        const circ = 2 * Math.PI * 14;
        const dash = rate * circ;

        return (
          <button
            key={iso}
            onClick={() => !isFuture && onSelectDate(iso)}
            disabled={isFuture}
            className={cn(
              "flex flex-col items-center gap-1.5 py-1 px-1 rounded-xl transition-all flex-1",
              isFuture ? "opacity-25 cursor-default" : "hover:bg-[#111111]",
            )}
          >
            <span className={cn(
              "text-[10px] font-medium uppercase tracking-wide",
              isSelected ? "text-[#EDEDED]" : "text-[#444444]"
            )}>
              {dayLabel}
            </span>

            {/* Ring with day number */}
            <div className="relative flex items-center justify-center">
              <svg width="36" height="36" className="rotate-[-90deg]">
                <circle cx="18" cy="18" r="14" fill={isSelected ? "#1A1A1A" : "none"} stroke="#1A1A1A" strokeWidth="2.5"/>
                {rate > 0 && (
                  <circle
                    cx="18" cy="18" r="14"
                    fill="none"
                    stroke={rate === 1 ? "#4ADE80" : "#4D9EFF"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ}`}
                  />
                )}
                {isSelected && (
                  <circle cx="18" cy="18" r="14" fill="#1F2A4A" stroke="#4D9EFF" strokeWidth="2"/>
                )}
                {isToday && !isSelected && (
                  <circle cx="18" cy="18" r="14" fill="#1A2040" stroke="#4D9EFF" strokeWidth="1.5"/>
                )}
              </svg>
              <span className={cn(
                "absolute text-sm font-semibold tabular-nums leading-none",
                isSelected || isToday ? "text-[#EDEDED]" : "text-[#666666]"
              )}>
                {dayNum}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
