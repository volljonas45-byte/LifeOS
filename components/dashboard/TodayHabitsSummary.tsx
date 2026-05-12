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
    <div className="bg-[#0C0C0C] border border-[#161616] rounded-2xl p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[11px] font-semibold text-[#333333] uppercase tracking-[0.18em]">Habits heute</h2>
          {allDone && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20 font-medium">
              ✓ Alle erledigt
            </span>
          )}
        </div>
        <Link href="/habits" className="text-[10px] text-[#2A2A2A] hover:text-[#E8FF6B] transition-colors">
          Alle →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2 flex-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-9 bg-[#111111] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : dailyHabits.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-2xl bg-[#111111] border border-[#1A1A1A] flex items-center justify-center mb-3">
            <span className="text-lg opacity-30">○</span>
          </div>
          <p className="text-sm text-[#444444] mb-1">Keine Habits angelegt</p>
          <Link href="/habits" className="mt-3 px-4 py-2 bg-[#E8FF6B] text-[#0A0A0A] rounded-xl text-xs font-bold hover:bg-[#D4EB5A] transition-colors">
            Habits anlegen
          </Link>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-1 bg-[#141414] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${rate}%`,
                  background: allDone ? "#4ADE80" : "#E8FF6B",
                }}
              />
            </div>
            <span className="text-xs font-semibold tabular-nums" style={{ color: allDone ? "#4ADE80" : "#E8FF6B" }}>
              {done}<span className="text-[#2A2A2A] font-normal">/{dailyHabits.length}</span>
            </span>
          </div>

          {/* Habit list */}
          <div className="space-y-0.5 flex-1">
            {dailyHabits.slice(0, 8).map((h) => {
              const completed = isCompleted(h.id, today);
              return (
                <div
                  key={h.id}
                  onClick={() => toggleHabit(h.id, today)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all ${
                    completed ? "opacity-35" : "hover:bg-[#111111]"
                  }`}
                >
                  <HabitCircle completed={completed} size="sm" />
                  <span className={`text-[13px] flex-1 transition-colors ${completed ? "text-[#333333] line-through" : "text-[#C0C0C0]"}`}>
                    {h.name}
                  </span>
                  <HabitStreakBadge habitId={h.id} />
                </div>
              );
            })}
            {dailyHabits.length > 8 && (
              <Link href="/habits" className="block text-center text-[10px] text-[#2A2A2A] hover:text-[#555555] py-2 transition-colors">
                +{dailyHabits.length - 8} weitere
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
