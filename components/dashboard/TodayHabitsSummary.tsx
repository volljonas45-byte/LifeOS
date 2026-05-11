"use client";

import Link from "next/link";
import { useHabits } from "@/lib/hooks/useHabits";
import { getToday } from "@/lib/utils/dates";
import { HabitCircle } from "@/components/habits/HabitCircle";
import { HabitStreakBadge } from "@/components/habits/HabitStreakBadge";

export function TodayHabitsSummary() {
  const { habits, loading, isCompleted, toggleHabit, todayCompletionRate } = useHabits();
  const today = getToday();
  const dailyHabits = habits.filter((h) => h.frequency === "daily");
  const rate = todayCompletionRate();
  const done = dailyHabits.filter((h) => isCompleted(h.id, today)).length;

  return (
    <div className="bg-[#161616] border border-[#262626] rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-semibold text-[#777777] uppercase tracking-widest">Habits heute</h2>
        <Link href="/habits" className="text-xs text-[#E8FF6B] hover:text-[#D4EB5A] transition-colors font-medium">Alle →</Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-8 bg-[#1E1E1E] rounded-lg animate-pulse" />)}
        </div>
      ) : dailyHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-3xl mb-3 opacity-20">○</span>
          <p className="text-sm text-[#666666] mb-4">Noch keine Habits angelegt</p>
          <Link href="/habits" className="px-4 py-2 bg-[#E8FF6B] text-[#0F0F0F] rounded-lg text-xs font-semibold hover:bg-[#D4EB5A] transition-colors">
            Habits anlegen
          </Link>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-1.5 bg-[#1E1E1E] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E8FF6B] rounded-full transition-all duration-700"
                style={{ width: `${rate}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-[#F0F0F0] tabular-nums">
              {done}<span className="text-[#555555] font-normal">/{dailyHabits.length}</span>
            </span>
          </div>

          {/* Habit rows */}
          <div className="space-y-0.5">
            {dailyHabits.map((h) => {
              const completed = isCompleted(h.id, today);
              return (
                <div key={h.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    completed ? "opacity-50" : "hover:bg-[#1E1E1E]"
                  }`}
                  onClick={() => toggleHabit(h.id, today)}
                >
                  <HabitCircle completed={completed} size="sm" />
                  <span className={`text-sm flex-1 transition-colors ${completed ? "text-[#555555] line-through" : "text-[#DDDDDD]"}`}>
                    {h.name}
                  </span>
                  <HabitStreakBadge habitId={h.id} />
                  {h.category && (
                    <span className="text-[10px] text-[#555555] px-1.5 py-0.5 bg-[#1E1E1E] border border-[#2A2A2A] rounded-full">
                      {h.category}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
