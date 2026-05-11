"use client";

import { useState } from "react";
import { useHabits } from "@/lib/hooks/useHabits";
import { AddHabitModal } from "@/components/habits/AddHabitModal";
import { HabitCard } from "@/components/habits/HabitCard";
import { WeekStrip } from "@/components/habits/WeekStrip";
import { getToday } from "@/lib/utils/dates";
import type { Habit } from "@/lib/types";

const SECTION_CONFIG = {
  habit:           { label: "Habits",        icon: "↻",  color: "#4D9EFF", bg: "#0A1220" },
  morning_routine: { label: "Morgen",        icon: "☀",  color: "#E8FF6B", bg: "#1A1E0A" },
  evening_routine: { label: "Abend",         icon: "🌙",  color: "#A78BFA", bg: "#110E1F" },
} as const;

export default function HabitsPage() {
  const { habits, loading, toggleHabit, addHabit, deleteHabit, isCompleted, todayCompletionRate } = useHabits();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<Habit["type"]>("habit");

  const sections: Habit["type"][] = ["habit", "morning_routine", "evening_routine"];
  const rate = todayCompletionRate();
  const dailyHabits = habits.filter(h => h.frequency === "daily");
  const done = dailyHabits.filter(h => isCompleted(h.id, selectedDate)).length;

  function openModal(type: Habit["type"]) {
    setModalType(type);
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* ── Header ── */}
      <div className="px-6 pt-7 pb-0">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display text-2xl font-semibold text-[#EDEDED]">Heute</h1>
          <button
            onClick={() => openModal("habit")}
            className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#AAAAAA] hover:bg-[#222222] hover:text-[#E8FF6B] transition-all text-lg leading-none"
          >
            +
          </button>
        </div>

        {/* Overall progress ring row */}
        {!loading && dailyHabits.length > 0 && (
          <div className="flex items-center gap-2 mb-5">
            <div className="flex-1 h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${rate}%`,
                  background: rate === 100 ? "#4ADE80" : "#E8FF6B",
                  boxShadow: rate > 0 ? `0 0 8px ${rate === 100 ? "rgba(74,222,128,0.4)" : "rgba(232,255,107,0.3)"}` : "none",
                }}
              />
            </div>
            <span className="text-xs text-[#555555] tabular-nums shrink-0">
              {done}/{dailyHabits.length}
            </span>
          </div>
        )}

        {/* 7-Day Strip */}
        <WeekStrip
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          habits={dailyHabits}
          isCompleted={isCompleted}
        />
      </div>

      {/* ── Sections ── */}
      <div className="px-6 pb-24 mt-6 space-y-6">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-[#111111] rounded-2xl animate-pulse" />)}
          </div>
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#111111] border border-[#1E1E1E] flex items-center justify-center text-3xl mb-4 opacity-40">○</div>
            <p className="text-[#555555] text-sm mb-1">Noch keine Habits</p>
            <p className="text-[#333333] text-xs mb-6">Leg deinen ersten Habit an</p>
            <button
              onClick={() => openModal("habit")}
              className="px-5 py-2.5 bg-[#E8FF6B] text-[#0F0F0F] rounded-xl text-sm font-semibold hover:bg-[#D4EB5A] transition-colors"
            >
              + Ersten Habit anlegen
            </button>
          </div>
        ) : (
          sections.map((type) => {
            const cfg = SECTION_CONFIG[type];
            const sectionHabits = habits.filter(h => h.type === type && (type === "habit" ? h.frequency === "daily" : true));
            return (
              <HabitSection
                key={type}
                type={type}
                label={cfg.label}
                icon={cfg.icon}
                color={cfg.color}
                bg={cfg.bg}
                habits={sectionHabits}
                selectedDate={selectedDate}
                isCompleted={isCompleted}
                onToggle={toggleHabit}
                onDelete={deleteHabit}
                onAdd={() => openModal(type)}
              />
            );
          })
        )}
      </div>

      <AddHabitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addHabit}
        defaultType={modalType}
      />
    </div>
  );
}

interface HabitSectionProps {
  type: Habit["type"];
  label: string;
  icon: string;
  color: string;
  bg: string;
  habits: Habit[];
  selectedDate: string;
  isCompleted: (id: string, date: string) => boolean;
  onToggle: (id: string, date: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

function HabitSection({ type, label, icon, color, bg, habits, selectedDate, isCompleted, onToggle, onDelete, onAdd }: HabitSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const done = habits.filter(h => isCompleted(h.id, selectedDate)).length;
  const allDone = habits.length > 0 && done === habits.length;

  return (
    <div>
      {/* Section header */}
      <div
        className="flex items-center justify-between mb-3 cursor-pointer"
        onClick={() => setCollapsed(v => !v)}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base leading-none">{icon}</span>
          <span className="text-base font-semibold text-[#DDDDDD]">{label}</span>
          {habits.length > 0 && (
            <span className="text-xs text-[#444444]">{done}/{habits.length}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Mini progress ring */}
          {habits.length > 0 && (
            <svg width="28" height="28" className="rotate-[-90deg]">
              <circle cx="14" cy="14" r="11" fill="none" stroke="#1A1A1A" strokeWidth="2.5"/>
              <circle
                cx="14" cy="14" r="11"
                fill="none"
                stroke={allDone ? "#4ADE80" : color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${(done / habits.length) * 69.1} 69.1`}
                style={{ transition: "stroke-dasharray 0.5s ease" }}
              />
            </svg>
          )}
          <span className="text-[#333333] text-xs">{collapsed ? "▾" : "▴"}</span>
        </div>
      </div>

      {/* Habit cards */}
      {!collapsed && (
        <div className="space-y-2.5">
          {habits.map((habit, i) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              date={selectedDate}
              colorIndex={i}
              sectionColor={color}
              isCompleted={isCompleted(habit.id, selectedDate)}
              onToggle={() => onToggle(habit.id, selectedDate)}
              onDelete={() => onDelete(habit.id)}
            />
          ))}

          {/* Add button */}
          <button
            onClick={onAdd}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-dashed border-[#1E1E1E] text-[#333333] hover:border-[#2A2A2A] hover:text-[#555555] transition-all text-sm"
          >
            <span className="text-lg leading-none">+</span>
            <span>Hinzufügen</span>
          </button>
        </div>
      )}
    </div>
  );
}
