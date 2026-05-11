"use client";

import { useState, useEffect } from "react";
import { useHabits } from "@/lib/hooks/useHabits";
import { AddHabitModal } from "@/components/habits/AddHabitModal";
import { HabitCard } from "@/components/habits/HabitCard";
import { WeekStrip } from "@/components/habits/WeekStrip";
import { getToday } from "@/lib/utils/dates";
import type { Habit } from "@/lib/types";

const SECTIONS: { type: Habit["type"]; label: string; icon: string; color: string }[] = [
  { type: "habit",           label: "Habits",        icon: "↻", color: "#4D9EFF" },
  { type: "morning_routine", label: "Morgenroutine",  icon: "☀", color: "#E8FF6B" },
  { type: "evening_routine", label: "Abendroutine",   icon: "🌙", color: "#A78BFA" },
];

const WEEK_DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function getWeekDatesAround(anchor: string) {
  const base = new Date(anchor);
  base.setHours(0, 0, 0, 0);
  const day = base.getDay(); // 0=Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + mondayOffset + i);
    return d.toISOString().slice(0, 10);
  });
}

export default function HabitsPage() {
  const { habits, loading, toggleHabit, addHabit, deleteHabit, isCompleted, todayCompletionRate } = useHabits();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<Habit["type"]>("habit");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const dailyHabits = habits.filter(h => h.frequency === "daily");
  const weeklyHabits = habits.filter(h => h.frequency === "weekly");
  const rate = todayCompletionRate();
  const done = dailyHabits.filter(h => isCompleted(h.id, selectedDate)).length;
  const allDone = dailyHabits.length > 0 && done === dailyHabits.length;

  const weekDates = getWeekDatesAround(selectedDate);
  const today = getToday();

  function openModal(type: Habit["type"]) { setModalType(type); setModalOpen(true); }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">

      {/* ── Header ── */}
      <div
        className="px-8 pt-8 pb-6 border-b border-[#111111]"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-8px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
      >
        <div className="flex items-start justify-between gap-8">

          {/* Left */}
          <div className="flex-1">
            <div className="flex items-baseline gap-3 mb-4">
              <h1 className="font-display text-3xl font-semibold text-[#EDEDED]">Heute</h1>
              {!loading && dailyHabits.length > 0 && (
                <span className="text-sm text-[#444444] tabular-nums">
                  {done}/{dailyHabits.length} erledigt
                  {allDone && <span className="ml-2 animate-bounce inline-block">🎉</span>}
                </span>
              )}
            </div>

            {/* Progress bar */}
            {!loading && dailyHabits.length > 0 && (
              <div className="flex items-center gap-3 mb-5 max-w-sm">
                <div className="flex-1 h-1.5 bg-[#141414] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: mounted ? `${rate}%` : "0%",
                      background: allDone ? "#4ADE80" : "#E8FF6B",
                      boxShadow: rate > 0 ? `0 0 10px ${allDone ? "rgba(74,222,128,0.35)" : "rgba(232,255,107,0.25)"}` : "none",
                      transition: "width 1s cubic-bezier(.4,0,.2,1), background 0.5s ease",
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-[#333333] tabular-nums w-8">{rate}%</span>
              </div>
            )}

            {/* Week strip */}
            <div className="max-w-lg">
              <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} habits={dailyHabits} isCompleted={isCompleted} />
            </div>
          </div>

          {/* Right: section summary cards */}
          {!loading && (
            <div className="flex items-stretch gap-2.5 shrink-0">
              {SECTIONS.map((s, si) => {
                const sh = habits.filter(h => h.type === s.type);
                const sd = sh.filter(h => isCompleted(h.id, selectedDate)).length;
                const pct = sh.length > 0 ? sd / sh.length : 0;
                const circ = 2 * Math.PI * 18;
                const dash = pct * circ;
                const isAll = sh.length > 0 && sd === sh.length;

                return (
                  <button
                    key={s.type}
                    onClick={() => openModal(s.type)}
                    className="flex flex-col items-center justify-between gap-2 px-4 pt-4 pb-3 rounded-2xl border transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] group"
                    style={{
                      background: "#0C0C0C",
                      borderColor: isAll ? s.color + "40" : "#1A1A1A",
                      minWidth: "82px",
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? "translateY(0)" : "translateY(6px)",
                      transition: `opacity 0.4s ease ${0.1 + si * 0.08}s, transform 0.4s ease ${0.1 + si * 0.08}s, border-color 0.3s ease, box-shadow 0.3s ease`,
                      boxShadow: isAll ? `0 0 16px ${s.color}18` : "none",
                    }}
                  >
                    <span className="text-lg leading-none">{s.icon}</span>
                    <div className="relative">
                      <svg width="44" height="44" className="rotate-[-90deg]">
                        <circle cx="22" cy="22" r="18" fill="none" stroke="#1A1A1A" strokeWidth="3"/>
                        <circle cx="22" cy="22" r="18" fill="none"
                          stroke={isAll ? "#4ADE80" : s.color}
                          strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${mounted ? dash : 0} ${circ}`}
                          style={{ transition: `stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1) ${0.3 + si * 0.1}s` }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums" style={{ color: isAll ? "#4ADE80" : s.color }}>
                        {sd}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#444444] text-center leading-tight font-medium uppercase tracking-wide group-hover:text-[#666666] transition-colors">
                      {s.label}
                    </span>
                  </button>
                );
              })}

              {/* Add button */}
              <button
                onClick={() => openModal("habit")}
                className="flex flex-col items-center justify-center gap-1.5 px-5 rounded-2xl font-semibold transition-all duration-200 hover:scale-[1.04] active:scale-95"
                style={{
                  background: "#E8FF6B",
                  minWidth: "72px",
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(6px)",
                  transition: "opacity 0.4s ease 0.34s, transform 0.4s ease 0.34s",
                  boxShadow: "0 0 24px rgba(232,255,107,0.2)",
                }}
              >
                <span className="text-2xl font-light text-black leading-none">+</span>
                <span className="text-[10px] font-bold text-black tracking-wide">NEU</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        className="px-8 pt-5 pb-0"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.4s ease 0.2s" }}
      >
        <div className="flex items-center gap-1 border-b border-[#111111]">
          {(["daily", "weekly"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 pb-3 text-sm font-medium transition-all duration-200 relative"
              style={{ color: activeTab === tab ? "#EDEDED" : "#444444" }}
            >
              {tab === "daily" ? "Täglich" : "Wöchentlich"}
              {activeTab === tab && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ background: "#E8FF6B", boxShadow: "0 0 8px rgba(232,255,107,0.4)" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-8 py-7">
        {loading ? (
          <div className="grid grid-cols-3 gap-5">
            {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-[#0E0E0E] rounded-2xl animate-pulse" />)}
          </div>
        ) : activeTab === "daily" ? (
          /* ── Daily Tab ── */
          habits.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-64 text-center"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] flex items-center justify-center text-3xl mb-5 opacity-20">○</div>
              <p className="text-[#555555] text-sm mb-1">Noch keine Habits angelegt</p>
              <p className="text-[#2A2A2A] text-xs mb-6">Starte mit deinem ersten Habit</p>
              <button onClick={() => openModal("habit")}
                className="px-5 py-2.5 bg-[#E8FF6B] text-[#0F0F0F] rounded-xl text-sm font-semibold hover:bg-[#D4EB5A] transition-all active:scale-95 shadow-[0_0_20px_rgba(232,255,107,0.2)]">
                + Ersten Habit anlegen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {SECTIONS.map((s, si) => {
                const sh = habits.filter(h => h.type === s.type && (s.type === "habit" ? h.frequency === "daily" : true));
                return (
                  <div
                    key={s.type}
                    style={{
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? "translateY(0)" : "translateY(16px)",
                      transition: `opacity 0.5s ease ${0.15 + si * 0.1}s, transform 0.5s cubic-bezier(.4,0,.2,1) ${0.15 + si * 0.1}s`,
                    }}
                  >
                    <HabitSection
                      type={s.type} label={s.label} icon={s.icon} color={s.color}
                      habits={sh} selectedDate={selectedDate}
                      isCompleted={isCompleted} onToggle={toggleHabit} onDelete={deleteHabit}
                      onAdd={() => openModal(s.type)}
                    />
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ── Weekly Tab ── */
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.4s ease 0.05s, transform 0.4s ease 0.05s",
            }}
          >
            {weeklyHabits.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] flex items-center justify-center text-3xl mb-5 opacity-20">○</div>
                <p className="text-[#555555] text-sm mb-1">Keine wöchentlichen Habits</p>
                <p className="text-[#2A2A2A] text-xs mb-6">Füge deinen ersten wöchentlichen Habit hinzu</p>
                <button onClick={() => openModal("habit")}
                  className="px-5 py-2.5 bg-[#E8FF6B] text-[#0F0F0F] rounded-xl text-sm font-semibold hover:bg-[#D4EB5A] transition-all active:scale-95 shadow-[0_0_20px_rgba(232,255,107,0.2)]">
                  + Habit anlegen
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Week header */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-[#333333]">KW {getISOWeek(new Date(selectedDate))}</span>
                  <span className="text-xs text-[#222222]">
                    {new Date(weekDates[0]).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
                    {" – "}
                    {new Date(weekDates[6]).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
                  </span>
                </div>

                {/* Grid: habits × 7 days */}
                <div className="rounded-2xl border border-[#111111] overflow-hidden">
                  {/* Header row */}
                  <div className="grid border-b border-[#111111]" style={{ gridTemplateColumns: "1fr repeat(7, 44px)" }}>
                    <div className="px-4 py-3 text-[10px] font-medium text-[#333333] uppercase tracking-wider">Habit</div>
                    {weekDates.map((d, i) => {
                      const isT = d === today;
                      return (
                        <div key={d} className="flex flex-col items-center justify-center py-3 gap-0.5">
                          <span className="text-[9px] font-medium uppercase tracking-wider" style={{ color: isT ? "#E8FF6B" : "#333333" }}>{WEEK_DAYS[i]}</span>
                          <span className="text-[11px] font-semibold tabular-nums" style={{ color: isT ? "#E8FF6B" : "#555555" }}>
                            {new Date(d).getDate()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Habit rows */}
                  {weeklyHabits.map((habit, hi) => {
                    const weekDone = weekDates.filter(d => isCompleted(habit.id, d)).length;
                    return (
                      <div
                        key={habit.id}
                        className="grid border-b border-[#0D0D0D] last:border-b-0 group hover:bg-[#0A0A0A] transition-colors"
                        style={{ gridTemplateColumns: "1fr repeat(7, 44px)" }}
                      >
                        {/* Name */}
                        <div className="flex items-center gap-3 px-4 py-3.5">
                          <span
                            className="text-sm font-semibold text-[#CCCCCC] truncate"
                          >
                            {habit.name}
                          </span>
                          <span className="text-[10px] text-[#2A2A2A] tabular-nums ml-auto shrink-0">{weekDone}×</span>
                        </div>

                        {/* Day dots */}
                        {weekDates.map((d) => {
                          const done = isCompleted(habit.id, d);
                          const isFuture = d > today;
                          return (
                            <button
                              key={d}
                              onClick={() => !isFuture && toggleHabit(habit.id, d)}
                              disabled={isFuture}
                              className="flex items-center justify-center"
                              style={{ opacity: isFuture ? 0.2 : 1 }}
                            >
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
                                style={{
                                  background: done ? "#4ADE80" : "#111111",
                                  border: done ? "none" : "1.5px solid #1E1E1E",
                                  boxShadow: done ? "0 0 8px rgba(74,222,128,0.3)" : "none",
                                  transform: "scale(1)",
                                }}
                              >
                                {done && (
                                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <path d="M2 5L4.5 7.5L8 3" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Add button */}
                <button
                  onClick={() => openModal("habit")}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm transition-all duration-200 hover:bg-[#0E0E0E] active:scale-[0.98] self-start"
                  style={{ borderColor: "#161616", color: "#2A2A2A" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#4D9EFF"; (e.currentTarget as HTMLElement).style.borderColor = "#4D9EFF55"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#2A2A2A"; (e.currentTarget as HTMLElement).style.borderColor = "#161616"; }}
                >
                  <span className="text-base leading-none">+</span>
                  <span className="font-medium">Wöchentlichen Habit hinzufügen</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <AddHabitModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={addHabit} defaultType={modalType} />
    </div>
  );
}

function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

/* ─── Daily Section ─── */
interface HabitSectionProps {
  type: Habit["type"]; label: string; icon: string; color: string;
  habits: Habit[]; selectedDate: string;
  isCompleted: (id: string, date: string) => boolean;
  onToggle: (id: string, date: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

function HabitSection({ label, icon, color, habits, selectedDate, isCompleted, onToggle, onDelete, onAdd }: HabitSectionProps) {
  const done = habits.filter(h => isCompleted(h.id, selectedDate)).length;
  const allDone = habits.length > 0 && done === habits.length;
  const circ = 2 * Math.PI * 10;
  const dash = habits.length > 0 ? (done / habits.length) * circ : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between pb-1 border-b border-[#111111]">
        <div className="flex items-center gap-2">
          <span className="text-sm leading-none">{icon}</span>
          <span className="text-sm font-semibold text-[#CCCCCC]">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {habits.length > 0 && (
            <svg width="22" height="22" className="rotate-[-90deg]">
              <circle cx="11" cy="11" r="10" fill="none" stroke="#1A1A1A" strokeWidth="2"/>
              <circle cx="11" cy="11" r="10" fill="none"
                stroke={allDone ? "#4ADE80" : color}
                strokeWidth="2" strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
                style={{ transition: "stroke-dasharray 0.5s ease" }}
              />
            </svg>
          )}
          <span className="text-[10px] text-[#2A2A2A] tabular-nums">{done}/{habits.length}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
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

        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl border text-xs transition-all duration-200 hover:bg-[#0E0E0E] active:scale-[0.98]"
          style={{ borderColor: "#161616", color: "#2A2A2A" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = color + "55";
            (e.currentTarget as HTMLElement).style.color = color;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "#161616";
            (e.currentTarget as HTMLElement).style.color = "#2A2A2A";
          }}
        >
          <span className="text-base leading-none">+</span>
          <span className="font-medium">Hinzufügen</span>
        </button>
      </div>
    </div>
  );
}
