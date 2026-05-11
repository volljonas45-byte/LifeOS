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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString().slice(0, 10);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    const iso = d.toISOString().slice(0, 10);
    const rate = habits.length > 0
      ? habits.filter(h => isCompleted(h.id, iso)).length / habits.length
      : 0;
    return {
      iso, rate,
      isToday: iso === todayIso,
      isSelected: iso === selectedDate,
      isFuture: d > today,
      label: DAY_LABELS[d.getDay()],
      num: d.getDate(),
    };
  });

  return (
    <div className="flex items-end gap-1">
      {days.map(({ iso, rate, isToday, isSelected, isFuture, label, num }) => {
        const r = 15;
        const circ = 2 * Math.PI * r;
        const dash = rate * circ;
        const ringColor = rate === 1 ? "#4ADE80" : "#4D9EFF";

        return (
          <button
            key={iso}
            onClick={() => !isFuture && onSelectDate(iso)}
            disabled={isFuture}
            className={cn(
              "flex flex-col items-center gap-1.5 px-1.5 py-1.5 rounded-xl transition-all duration-200 flex-1",
              isFuture ? "opacity-20 cursor-default" : "cursor-pointer hover:bg-[#111111] active:scale-95"
            )}
          >
            <span className={cn(
              "text-[10px] font-medium uppercase tracking-wider transition-colors",
              isSelected ? "text-[#AAAAAA]" : "text-[#333333]"
            )}>
              {label}
            </span>

            <div className="relative flex items-center justify-center">
              <svg width="38" height="38" className="rotate-[-90deg]">
                {/* Track */}
                <circle cx="19" cy="19" r={r} fill={isSelected ? "#141414" : isToday ? "#0F0F0F" : "none"} stroke="#1A1A1A" strokeWidth="2.5"/>
                {/* Progress */}
                {rate > 0 && (
                  <circle cx="19" cy="19" r={r} fill="none"
                    stroke={ringColor} strokeWidth="2.5" strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ}`}
                    style={{ transition: "stroke-dasharray 0.5s cubic-bezier(.4,0,.2,1)" }}
                  />
                )}
                {/* Selected indicator */}
                {isSelected && (
                  <circle cx="19" cy="19" r={r} fill="none" stroke="#E8FF6B" strokeWidth="2" opacity="0.6"/>
                )}
              </svg>
              <span className={cn(
                "absolute text-[13px] font-semibold tabular-nums leading-none transition-colors",
                isSelected ? "text-[#E8FF6B]" : isToday ? "text-[#EDEDED]" : "text-[#555555]"
              )}>
                {num}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
