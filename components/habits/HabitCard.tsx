"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { HabitStreakBadge } from "./HabitStreakBadge";
import type { Habit } from "@/lib/types";

// Rich color palettes per section color
const CARD_PALETTES: Record<string, { bg: string; border: string; text: string; sub: string; checkBg: string; checkBorder: string }[]> = {
  "#4D9EFF": [
    { bg: "#0D1E35", border: "#1A3050", text: "#E0EDFF", sub: "#4D9EFF", checkBg: "#4D9EFF", checkBorder: "#4D9EFF" },
    { bg: "#0A1828", border: "#152840", text: "#D0E5FF", sub: "#3B7FD4", checkBg: "#3B7FD4", checkBorder: "#3B7FD4" },
    { bg: "#0C1F30", border: "#183050", text: "#D8EEFF", sub: "#5AAEFF", checkBg: "#5AAEFF", checkBorder: "#5AAEFF" },
  ],
  "#E8FF6B": [
    { bg: "#1A1E0A", border: "#2A2E10", text: "#F0F0CC", sub: "#C8DB50", checkBg: "#E8FF6B", checkBorder: "#E8FF6B" },
    { bg: "#161A08", border: "#222810", text: "#E8E8C0", sub: "#B8CC40", checkBg: "#D4EB5A", checkBorder: "#D4EB5A" },
    { bg: "#1C220C", border: "#2C3212", text: "#F4F4D0", sub: "#D0E858", checkBg: "#E0F560", checkBorder: "#E0F560" },
  ],
  "#A78BFA": [
    { bg: "#160E28", border: "#261A40", text: "#E8DEFF", sub: "#A78BFA", checkBg: "#A78BFA", checkBorder: "#A78BFA" },
    { bg: "#120C22", border: "#201535", text: "#DDD5FF", sub: "#9370E8", checkBg: "#9370E8", checkBorder: "#9370E8" },
    { bg: "#1A1030", border: "#2A1848", text: "#EDE5FF", sub: "#B89CFF", checkBg: "#B89CFF", checkBorder: "#B89CFF" },
  ],
};

const DONE_PALETTE = { bg: "#0E1F0E", border: "#1A3A1A", text: "#4ADE80", sub: "#2A8A2A", checkBg: "#4ADE80", checkBorder: "#4ADE80" };

interface HabitCardProps {
  habit: Habit;
  date: string;
  colorIndex: number;
  sectionColor: string;
  isCompleted: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export function HabitCard({ habit, date, colorIndex, sectionColor, isCompleted, onToggle, onDelete }: HabitCardProps) {
  const [pressing, setPressing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const palettes = CARD_PALETTES[sectionColor] ?? CARD_PALETTES["#4D9EFF"];
  const palette = isCompleted ? DONE_PALETTE : palettes[colorIndex % palettes.length];

  return (
    <div
      className="relative rounded-2xl overflow-hidden select-none"
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      style={{ background: palette.bg, border: `1px solid ${palette.border}` }}
    >
      <div className="flex items-center gap-4 px-4 py-4">
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-base font-semibold leading-snug transition-all",
            isCompleted ? "line-through opacity-60" : ""
          )} style={{ color: palette.text }}>
            {habit.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: palette.sub }}>
            {habit.frequency === "daily" ? "Jeden Tag" : "Jede Woche"}
          </p>
        </div>

        {/* Streak */}
        <div className="shrink-0">
          <HabitStreakBadge habitId={habit.id} color={palette.text} />
        </div>

        {/* Check button */}
        <button
          onClick={onToggle}
          onMouseDown={() => setPressing(true)}
          onMouseUp={() => setPressing(false)}
          onMouseLeave={() => setPressing(false)}
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-150",
            pressing ? "scale-90" : "scale-100",
          )}
          style={{
            background: isCompleted ? palette.checkBg : "transparent",
            border: `2.5px solid ${palette.checkBorder}`,
          }}
        >
          {isCompleted ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 9L7.5 12.5L14 6" stroke={sectionColor === "#E8FF6B" ? "#0F0F0F" : "#0F0F0F"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V12M2 7H12" stroke={palette.checkBorder} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Delete button - hover only */}
      {showDelete && (
        <button
          onClick={() => { if (confirm(`"${habit.name}" löschen?`)) onDelete(); }}
          className="absolute top-2 right-14 text-[10px] text-white/20 hover:text-red-400 transition-colors px-1"
        >
          ×
        </button>
      )}
    </div>
  );
}
