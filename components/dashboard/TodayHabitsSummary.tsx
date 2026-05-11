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
  const allDone = dailyHabits.length > 0 && done === dailyHabits.length;

  return (
    <div className="bg-[#0E0E0E] border border-[#1A1A1A] rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[10px] font-semibold text-[#333333] uppercase tracking-[0.18em]">Habits heute</h2>
        </div>
        <Link href="/habits" className="text-[10px] text-[#444444] hover:text-[#E8FF6B] transition-colors">
          Alle ansehen →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-10 bg-[#141414] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : dailyHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-[#1E1E1E] flex items-center justify-center mb-4">
            <span className="text-xl opacity-40">○</span>
          </div>
          <p className="text-sm text-[#555555] mb-1">Keine Habits heute</p>
          <p className="text-xs text-[#333333] mb-4">Leg deine ersten Habits an</p>
          <Link href="/habits" className="px-4 py-2 bg-[#E8FF6B] text-[#0F0F0F] rounded-xl text-xs font-semibold hover:bg-[#D4EB5A] transition-colors">
            Habits anlegen
          </Link>
        </div>
      ) : (
        <>
          {/* Progress bar + count */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-1.5 bg-[#141414] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${rate}%`,
                  background: allDone ? "#4ADE80" : "#E8FF6B",
                  boxShadow: allDone ? "0 0 12px rgba(74,222,128,0.4)" : rate > 0 ? "0 0 12px rgba(232,255,107,0.3)" : "none",
                }}
              />
            </div>
            <span className="text-sm font-bold text-[#EDEDED] tabular-nums shrink-0">
              {done}<span className="text-[#333333] font-normal text-xs">/{dailyHabits.length}</span>
            </span>
            {allDone && <span className="text-xs">🎉</span>}
          </div>

          {/* Habit rows */}
          <div className="space-y-0.5">
            {dailyHabits.slice(0, 7).map((h) => {
              const completed = isCompleted(h.id, today);
              return (
                <div
                  key={h.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all select-none ${
                    completed ? "opacity-40" : "hover:bg-[#141414]"
                  }`}
                  onClick={() => toggleHabit(h.id, today)}
                >
                  <HabitCircle completed={completed} size="sm" />
                  <span className={`text-sm flex-1 transition-colors ${completed ? "text-[#444444] line-through" : "text-[#CCCCCC]"}`}>
                    {h.name}
                  </span>
                  <HabitStreakBadge habitId={h.id} />
                </div>
              );
            })}
            {dailyHabits.length > 7 && (
              <Link href="/habits" className="block text-center text-[10px] text-[#333333] hover:text-[#666666] py-1.5 transition-colors">
                +{dailyHabits.length - 7} weitere
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
