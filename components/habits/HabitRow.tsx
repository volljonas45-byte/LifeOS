import { HabitCircle } from "./HabitCircle";
import { formatShortDate, getDayLabel } from "@/lib/utils/dates";
import type { Habit } from "@/lib/types";

interface HabitRowProps {
  habit: Habit;
  weekDays: Date[];
  isCompleted: (habitId: string, date: string) => boolean;
  onToggle: (habitId: string, date: string) => void;
  deleteMode?: boolean;
  onDelete?: (id: string) => void;
}

export function HabitRow({ habit, weekDays, isCompleted, onToggle, deleteMode, onDelete }: HabitRowProps) {
  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-[#1A1A1A] last:border-0">
      {deleteMode && onDelete && (
        <button
          onClick={() => onDelete(habit.id)}
          className="text-[#333333] hover:text-[#F87171] transition-colors text-sm shrink-0 w-4"
        >
          ×
        </button>
      )}
      <span className="flex-1 text-sm text-[#CCCCCC] truncate">{habit.name}</span>
      <div className="flex items-center gap-2">
        {weekDays.map((day) => {
          const dateStr = formatShortDate(day);
          return (
            <div key={dateStr} className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-[#444444] uppercase">
                {getDayLabel(day)}
              </span>
              <HabitCircle
                completed={isCompleted(habit.id, dateStr)}
                onClick={() => onToggle(habit.id, dateStr)}
                size="sm"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
