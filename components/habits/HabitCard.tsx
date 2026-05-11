"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { HabitStreakBadge } from "./HabitStreakBadge";
import type { Habit } from "@/lib/types";

const PALETTES: Record<string, { bg: string; border: string; text: string; sub: string; accent: string }[]> = {
  "#4D9EFF": [
    { bg: "#0C1C30", border: "#162840", text: "#D8EEFF", sub: "#4D7AAA", accent: "#4D9EFF" },
    { bg: "#0A1828", border: "#142238", text: "#CCE5FF", sub: "#3D6A9A", accent: "#3D8AEF" },
    { bg: "#0E2035", border: "#1A2C45", text: "#E0F0FF", sub: "#558ABB", accent: "#5AAEFF" },
    { bg: "#081522", border: "#101E30", text: "#C5DFFF", sub: "#345F8A", accent: "#3575D5" },
  ],
  "#E8FF6B": [
    { bg: "#191E08", border: "#252D0E", text: "#EEEEBB", sub: "#8A9040", accent: "#E8FF6B" },
    { bg: "#151A06", border: "#20270C", text: "#E5E5B0", sub: "#7A8035", accent: "#D8EF5B" },
    { bg: "#1C2209", border: "#2A3210", text: "#F2F2C5", sub: "#959A48", accent: "#F0FF78" },
    { bg: "#121704", border: "#1C2408", text: "#E0E0A8", sub: "#6A7030", accent: "#CCEE50" },
  ],
  "#A78BFA": [
    { bg: "#130E24", border: "#1E1535", text: "#E0D5FF", sub: "#7060AA", accent: "#A78BFA" },
    { bg: "#100C1E", border: "#1A1230", text: "#D5CCFF", sub: "#605099", accent: "#9578EA" },
    { bg: "#160F28", border: "#22183C", text: "#E8DEFF", sub: "#7868BB", accent: "#B89CFF" },
    { bg: "#0E0A1A", border: "#180F28", text: "#CBBFFF", sub: "#584888", accent: "#8A70E0" },
  ],
};

const DONE = { bg: "#0C1E0C", border: "#143514", text: "#86EFAC", sub: "#3A7A3A", accent: "#4ADE80" };

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
  const [animating, setAnimating] = useState(false);
  const [showDel, setShowDel] = useState(false);

  const cols = PALETTES[sectionColor] ?? PALETTES["#4D9EFF"];
  const p = isCompleted ? DONE : cols[colorIndex % cols.length];

  function handleToggle() {
    setAnimating(true);
    onToggle();
    setTimeout(() => setAnimating(false), 400);
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: p.bg,
        border: `1px solid ${p.border}`,
        opacity: isCompleted ? 0.7 : 1,
        transform: animating ? "scale(0.985)" : "scale(1)",
        transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
      }}
      onMouseEnter={() => setShowDel(true)}
      onMouseLeave={() => setShowDel(false)}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold leading-snug transition-all duration-300"
            style={{
              color: p.text,
              textDecoration: isCompleted ? "line-through" : "none",
              opacity: isCompleted ? 0.6 : 1,
            }}
          >
            {habit.name}
          </p>
          <p className="text-[11px] mt-0.5 transition-colors" style={{ color: p.sub }}>
            {habit.frequency === "daily" ? "Jeden Tag" : "Jede Woche"}
          </p>
        </div>

        {/* Streak */}
        <HabitStreakBadge habitId={habit.id} color={p.accent} />

        {/* Check button */}
        <button
          onClick={handleToggle}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90"
          style={{
            background: isCompleted ? p.accent : "transparent",
            border: `2px solid ${p.accent}`,
            boxShadow: isCompleted ? `0 0 12px ${p.accent}40` : "none",
          }}
        >
          {isCompleted ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-all duration-200">
              <path d="M3.5 8L6.5 11L12.5 5" stroke="#0A0A0A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-all duration-200">
              <path d="M6 1.5V10.5M1.5 6H10.5" stroke={p.accent} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Delete — hover only */}
      <button
        onClick={() => { if (confirm(`"${habit.name}" löschen?`)) onDelete(); }}
        className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full text-[10px] transition-all duration-200"
        style={{
          opacity: showDel ? 0.5 : 0,
          color: "#F87171",
          background: showDel ? "#1A0A0A" : "transparent",
        }}
      >
        ×
      </button>
    </div>
  );
}
