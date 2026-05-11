"use client";

import type { Workout } from "@/lib/types";

interface WorkoutHeatmapProps {
  workouts: Workout[];
}

export function WorkoutHeatmap({ workouts }: WorkoutHeatmapProps) {
  const workoutDates = new Set(workouts.map((w) => w.workout_date));

  // Build last 10 weeks (Mon-Sun), newest on right
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Go back to the most recent Monday
  const dayOfWeek = (today.getDay() + 6) % 7; // 0=Mon
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek);

  // Build 10 weeks backwards
  const weeks: Date[][] = [];
  for (let w = 9; w >= 0; w--) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() - w * 7 + d);
      week.push(day);
    }
    weeks.push(week);
  }

  const DAY_LABELS = ["Mo", "Mi", "Fr"];
  const dayIndices = [0, 2, 4];

  function toISO(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  const monthLabels: { label: string; col: number }[] = [];
  weeks.forEach((week, i) => {
    const first = week[0];
    if (first.getDate() <= 7) {
      monthLabels.push({
        label: first.toLocaleDateString("de-DE", { month: "short" }),
        col: i,
      });
    }
  });

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5">
      <h3 className="text-[10px] font-semibold text-[#444444] uppercase tracking-[0.12em] mb-4">
        Aktivität (10 Wochen)
      </h3>

      <div className="flex gap-3">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pt-5">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d, i) => (
            <span key={d} className={`text-[9px] h-3 flex items-center ${dayIndices.includes(i) ? "text-[#444444]" : "text-transparent"}`}>
              {d}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1">
          {/* Month labels */}
          <div className="flex gap-1 mb-1" style={{ paddingLeft: 0 }}>
            {weeks.map((week, i) => {
              const label = monthLabels.find((m) => m.col === i);
              return (
                <div key={i} className="w-3 text-[9px] text-[#444444] text-center leading-none">
                  {label?.label ?? ""}
                </div>
              );
            })}
          </div>

          {/* Days grid */}
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => {
                  const iso = toISO(day);
                  const hasWorkout = workoutDates.has(iso);
                  const isFuture = day > today;
                  const isToday = iso === toISO(today);
                  return (
                    <div
                      key={di}
                      title={iso}
                      className={`w-3 h-3 rounded-sm transition-colors ${
                        isFuture
                          ? "bg-[#0A0A0A]"
                          : hasWorkout
                          ? "bg-[#E8FF6B]"
                          : isToday
                          ? "bg-[#1E1E1E] ring-1 ring-[#333333]"
                          : "bg-[#1A1A1A]"
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-[9px] text-[#333333]">Weniger</span>
        {["#1A1A1A", "#4A5C1A", "#7A9A2A", "#E8FF6B"].map((c) => (
          <div key={c} className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
        ))}
        <span className="text-[9px] text-[#333333]">Mehr</span>
      </div>
    </div>
  );
}
