"use client";

import { CheckItem } from "./CheckItem";
import { getToday } from "@/lib/utils/dates";
import type { Habit } from "@/lib/types";

interface RoutineChecklistProps {
  title: string;
  emoji: string;
  habits: Habit[];
  isCompleted: (habitId: string, date: string) => boolean;
  onToggle: (habitId: string, date: string) => void;
  deleteMode?: boolean;
  onDelete?: (id: string) => void;
  accentClass?: string;
}

export function RoutineChecklist({
  title,
  emoji,
  habits,
  isCompleted,
  onToggle,
  deleteMode,
  onDelete,
}: RoutineChecklistProps) {
  const today = getToday();
  const done = habits.filter((h) => isCompleted(h.id, today)).length;

  if (habits.length === 0) return null;

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#DDDDDD] flex items-center gap-2">
          <span>{emoji}</span>
          {title}
        </h3>
        <span className="text-xs text-[#555555] tabular-nums">{done}/{habits.length}</span>
      </div>
      <div className="space-y-0.5">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-2">
            <div className="flex-1">
              <CheckItem
                label={habit.name}
                completed={isCompleted(habit.id, today)}
                onToggle={() => onToggle(habit.id, today)}
              />
            </div>
            {deleteMode && onDelete && (
              <button
                onClick={() => onDelete(habit.id)}
                className="text-[#333333] hover:text-[#F87171] transition-colors text-sm shrink-0 w-5 text-center"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
