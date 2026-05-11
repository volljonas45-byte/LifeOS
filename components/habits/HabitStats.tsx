"use client";

import { useHabits } from "@/lib/hooks/useHabits";
import { getToday, getWeekDays, formatShortDate } from "@/lib/utils/dates";

export function HabitStats() {
  const { habits, isCompleted, loading } = useHabits();
  const today = getToday();
  const weekDays = getWeekDays();

  if (loading) return null;

  const dailyHabits = habits.filter((h) => h.frequency === "daily" && h.type === "habit");
  const morningHabits = habits.filter((h) => h.type === "morning_routine");
  const eveningHabits = habits.filter((h) => h.type === "evening_routine");

  const todayDone = habits.filter((h) => h.frequency === "daily" && isCompleted(h.id, today)).length;
  const todayTotal = habits.filter((h) => h.frequency === "daily").length;

  // Week completion %
  const weekScores = weekDays.map((day) => {
    const dateStr = formatShortDate(day);
    const total = habits.filter((h) => h.frequency === "daily").length;
    if (total === 0) return 0;
    const done = habits.filter((h) => h.frequency === "daily" && isCompleted(h.id, dateStr)).length;
    return Math.round((done / total) * 100);
  });
  const weekAvg = weekScores.length > 0 ? Math.round(weekScores.reduce((a, b) => a + b, 0) / weekScores.length) : 0;

  const DAY_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  return (
    <div className="bg-[#161616] border border-[#262626] rounded-xl p-5 mb-4">
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <p className="text-[10px] text-[#777777] uppercase tracking-widest mb-1">Heute</p>
          <p className="text-2xl font-semibold text-[#EDEDED] leading-none tabular-nums">
            {todayDone}<span className="text-sm text-[#555555] font-normal">/{todayTotal}</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-[#777777] uppercase tracking-widest mb-1">Ø diese Woche</p>
          <p className="text-2xl font-semibold text-[#EDEDED] leading-none tabular-nums">
            {weekAvg}<span className="text-sm text-[#555555] font-normal">%</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-[#777777] uppercase tracking-widest mb-1">Habits total</p>
          <p className="text-2xl font-semibold text-[#EDEDED] leading-none tabular-nums">{habits.length}</p>
        </div>
      </div>

      {/* Week bar chart */}
      <div className="flex items-end gap-1.5">
        {weekDays.map((day, i) => {
          const score = weekScores[i];
          const isToday = formatShortDate(day) === today;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#1A1A1A] rounded-sm overflow-hidden" style={{ height: 32 }}>
                <div
                  className={`w-full rounded-sm transition-all duration-500 ${isToday ? "bg-[#E8FF6B]" : "bg-[#2A2A2A]"}`}
                  style={{ height: `${score}%`, marginTop: `${100 - score}%` }}
                />
              </div>
              <span className={`text-[9px] ${isToday ? "text-[#E8FF6B]" : "text-[#555555]"}`}>
                {DAY_SHORT[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
