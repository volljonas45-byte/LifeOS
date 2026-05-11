"use client";

import { useState } from "react";
import { RoutineChecklist } from "./RoutineChecklist";
import { HabitRow } from "./HabitRow";
import { AddHabitModal } from "./AddHabitModal";
import { getWeekDays } from "@/lib/utils/dates";
import { useHabits } from "@/lib/hooks/useHabits";

export function DailyHabits() {
  const { habits, loading, toggleHabit, addHabit, deleteHabit, isCompleted } = useHabits();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const weekDays = getWeekDays();

  const morningHabits = habits.filter((h) => h.type === "morning_routine");
  const eveningHabits = habits.filter((h) => h.type === "evening_routine");
  const regularHabits = habits.filter((h) => h.type === "habit" && h.frequency === "daily");

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-[#1A1A1A] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RoutineChecklist
        title="Morgenroutine"
        emoji="☀️"
        habits={morningHabits}
        isCompleted={isCompleted}
        onToggle={toggleHabit}
        deleteMode={deleteMode}
        onDelete={deleteHabit}
      />

      <RoutineChecklist
        title="Abendroutine"
        emoji="🌙"
        habits={eveningHabits}
        isCompleted={isCompleted}
        onToggle={toggleHabit}
        deleteMode={deleteMode}
        onDelete={deleteHabit}
      />

      {regularHabits.length > 0 && (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5">
          <h3 className="text-[10px] font-semibold text-[#444444] uppercase tracking-[0.12em] mb-4">
            Daily Habits
          </h3>
          <div>
            {regularHabits.map((habit) => (
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
        </div>
      )}

      {habits.length === 0 && (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-10 text-center">
          <p className="text-[#555555] text-sm mb-4">Noch keine Habits angelegt.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-[#E8FF6B] text-[#0F0F0F] rounded-lg text-sm font-semibold hover:bg-[#D4EB5A] transition-colors"
          >
            Ersten Habit anlegen
          </button>
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
          Habit hinzufügen
        </button>
        {habits.length > 0 && (
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
        onAdd={addHabit}
      />
    </div>
  );
}
