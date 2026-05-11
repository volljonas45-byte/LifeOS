"use client";

import { HabitRow } from "./HabitRow";
import { AddHabitModal } from "./AddHabitModal";
import { getWeekDays } from "@/lib/utils/dates";
import { useHabits } from "@/lib/hooks/useHabits";
import { useState } from "react";

export function WeeklyHabits() {
  const { habits, loading, toggleHabit, addHabit, deleteHabit, isCompleted } = useHabits();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const weekDays = getWeekDays();

  const weeklyHabits = habits.filter((h) => h.frequency === "weekly");

  if (loading) {
    return <div className="h-24 bg-[#1A1A1A] rounded-xl animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      {weeklyHabits.length > 0 ? (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5">
          <h3 className="text-[10px] font-semibold text-[#444444] uppercase tracking-[0.12em] mb-4">
            Weekly Habits
          </h3>
          {weeklyHabits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              weekDays={weekDays}
              isCompleted={isCompleted}
              onToggle={toggleHabit}
              deleteMode={deleteMode}
              onDelete={deleteHabit}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-10 text-center">
          <p className="text-[#555555] text-sm">Noch keine wöchentlichen Habits.</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 text-sm text-[#444444] hover:text-[#888888] transition-colors"
        >
          <span className="w-5 h-5 rounded-full border border-dashed border-[#2A2A2A] flex items-center justify-center text-xs hover:border-[#444444] transition-colors">
            +
          </span>
          Weekly Habit hinzufügen
        </button>
        {weeklyHabits.length > 0 && (
          <button
            onClick={() => setDeleteMode((v) => !v)}
            className={`text-xs transition-colors ${deleteMode ? "text-[#F87171]" : "text-[#333333] hover:text-[#666666]"}`}
          >
            {deleteMode ? "Fertig" : "Bearbeiten"}
          </button>
        )}
      </div>

      <AddHabitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={(h) => addHabit({ ...h, frequency: "weekly" })}
      />
    </div>
  );
}
