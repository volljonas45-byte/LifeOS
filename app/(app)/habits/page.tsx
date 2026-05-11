"use client";

import { useState } from "react";
import { useHabits } from "@/lib/hooks/useHabits";
import { AddHabitModal } from "@/components/habits/AddHabitModal";
import { HabitCard } from "@/components/habits/HabitCard";
import { WeekStrip } from "@/components/habits/WeekStrip";
import { getToday } from "@/lib/utils/dates";
import type { Habit } from "@/lib/types";

const SECTIONS: { type: Habit["type"]; label: string; icon: string; color: string }[] = [
  { type: "habit",           label: "Habits",       icon: "↻", color: "#4D9EFF" },
  { type: "morning_routine", label: "Morgenroutine", icon: "☀", color: "#E8FF6B" },
  { type: "evening_routine", label: "Abendroutine",  icon: "🌙", color: "#A78BFA" },
];

export default function HabitsPage() {
  const { habits, loading, toggleHabit, addHabit, deleteHabit, isCompleted, todayCompletionRate } = useHabits();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<Habit["type"]>("habit");

  const dailyHabits = habits.filter(h => h.frequency === "daily");
  const rate = todayCompletionRate();
  const done = dailyHabits.filter(h => isCompleted(h.id, selectedDate)).length;
  const allDone = dailyHabits.length > 0 && done === dailyHabits.length;

  function openModal(type: Habit["type"]) {
    setModalType(type);
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">

      {/* ── Top header ── */}
      <div className="px-8 pt-8 pb-6 border-b border-[#111111]">
        <div className="flex items-start justify-between gap-8">

          {/* Left: title + progress */}
          <div className="flex-1">
            <div className="flex items-baseline gap-3 mb-4">
              <h1 className="font-display text-3xl font-semibold text-[#EDEDED]">Heute</h1>
              {!loading && dailyHabits.length > 0 && (
                <span className="text-sm text-[#444444] tabular-nums">
                  {done}/{dailyHabits.length} erledigt
                  {allDone && <span className="ml-2">🎉</span>}
                </span>
              )}
            </div>

            {/* Progress bar */}
            {!loading && dailyHabits.length > 0 && (
              <div className="flex items-center gap-3 mb-5 max-w-sm">
                <div className="flex-1 h-1.5 bg-[#141414] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${rate}%`,
                      background: allDone ? "#4ADE80" : "#E8FF6B",
                      boxShadow: rate > 0 ? `0 0 10px ${allDone ? "rgba(74,222,128,0.35)" : "rgba(232,255,107,0.25)"}` : "none",
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-[#333333] tabular-nums w-8">{rate}%</span>
              </div>
            )}

            {/* Week strip */}
            <div className="max-w-lg">
              <WeekStrip
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                habits={dailyHabits}
                isCompleted={isCompleted}
              />
            </div>
          </div>

          {/* Right: stats summary */}
          {!loading && (
            <div className="flex items-center gap-3 shrink-0">
              {SECTIONS.map(s => {
                const sh = habits.filter(h => h.type === s.type);
                const sd = sh.filter(h => isCompleted(h.id, selectedDate)).length;
                const circ = 2 * Math.PI * 20;
                const dash = sh.length > 0 ? (sd / sh.length) * circ : 0;
                return (
                  <div key={s.type} className="flex flex-col items-center gap-2 px-4 py-3 bg-[#0E0E0E] border border-[#1A1A1A] rounded-2xl min-w-[80px]">
                    <div className="relative">
                      <svg width="52" height="52" className="rotate-[-90deg]">
                        <circle cx="26" cy="26" r="20" fill="none" stroke="#1A1A1A" strokeWidth="3"/>
                        <circle cx="26" cy="26" r="20" fill="none" stroke={s.color} strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${dash} ${circ}`}
                          style={{ transition: "stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)", opacity: sh.length === 0 ? 0.15 : 1 }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: s.color }}>
                        {sd}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#444444] text-center leading-tight">{s.label}</span>
                  </div>
                );
              })}
              <button
                onClick={() => openModal("habit")}
                className="flex flex-col items-center justify-center gap-1.5 px-4 py-3 bg-[#E8FF6B] rounded-2xl min-w-[80px] h-full hover:bg-[#D4EB5A] transition-all active:scale-95 shadow-[0_0_20px_rgba(232,255,107,0.15)]"
              >
                <span className="text-2xl font-light text-black leading-none">+</span>
                <span className="text-[10px] font-semibold text-black">Neu</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main content: 3 columns ── */}
      <div className="flex-1 px-8 py-7">
        {loading ? (
          <div className="grid grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-24 bg-[#0E0E0E] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] flex items-center justify-center text-3xl mb-5 opacity-30">○</div>
            <p className="text-[#555555] text-sm mb-1">Noch keine Habits angelegt</p>
            <p className="text-[#2A2A2A] text-xs mb-6">Starte mit deinem ersten Habit</p>
            <button onClick={() => openModal("habit")}
              className="px-5 py-2.5 bg-[#E8FF6B] text-[#0F0F0F] rounded-xl text-sm font-semibold hover:bg-[#D4EB5A] transition-all active:scale-95">
              + Ersten Habit anlegen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {SECTIONS.map(s => {
              const sh = habits.filter(h => h.type === s.type && (s.type === "habit" ? h.frequency === "daily" : true));
              return (
                <HabitSection
                  key={s.type}
                  type={s.type}
                  label={s.label}
                  icon={s.icon}
                  color={s.color}
                  habits={sh}
                  selectedDate={selectedDate}
                  isCompleted={isCompleted}
                  onToggle={toggleHabit}
                  onDelete={deleteHabit}
                  onAdd={() => openModal(s.type)}
                />
              );
            })}
          </div>
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

/* ─── Section ─── */
interface HabitSectionProps {
  type: Habit["type"];
  label: string;
  icon: string;
  color: string;
  habits: Habit[];
  selectedDate: string;
  isCompleted: (id: string, date: string) => boolean;
  onToggle: (id: string, date: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

function HabitSection({ type, label, icon, color, habits, selectedDate, isCompleted, onToggle, onDelete, onAdd }: HabitSectionProps) {
  const done = habits.filter(h => isCompleted(h.id, selectedDate)).length;
  const allDone = habits.length > 0 && done === habits.length;
  const circ = 2 * Math.PI * 10;
  const dash = habits.length > 0 ? (done / habits.length) * circ : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{icon}</span>
          <span className="text-sm font-semibold text-[#CCCCCC]">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {habits.length > 0 && (
            <svg width="24" height="24" className="rotate-[-90deg]">
              <circle cx="12" cy="12" r="10" fill="none" stroke="#1A1A1A" strokeWidth="2"/>
              <circle cx="12" cy="12" r="10" fill="none" stroke={allDone ? "#4ADE80" : color}
                strokeWidth="2" strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                style={{ transition: "stroke-dasharray 0.5s ease" }}
              />
            </svg>
          )}
          <span className="text-[10px] text-[#333333] tabular-nums">{done}/{habits.length}</span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5">
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

        {/* Add */}
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed text-xs transition-all hover:bg-[#0E0E0E] active:scale-[0.98]"
          style={{ borderColor: "#1E1E1E", color: "#333333" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = color + "44"; (e.currentTarget as HTMLElement).style.color = color; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1E1E1E"; (e.currentTarget as HTMLElement).style.color = "#333333"; }}
        >
          <span className="text-base leading-none">+</span>
          <span>Hinzufügen</span>
        </button>
      </div>
    </div>
  );
}
