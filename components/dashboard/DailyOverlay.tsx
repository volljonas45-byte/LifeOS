"use client";

import { useState, useEffect } from "react";
import { useWeather } from "@/lib/hooks/useWeather";
import { getMorningQuote, getEveningQuote, getMorningAffirmation } from "@/lib/quotes";
import { getToday } from "@/lib/utils/dates";
import type { Habit, Goal } from "@/lib/types";

interface DailyOverlayProps {
  mode: "morning" | "evening";
  onDismiss: () => void;
  habits: Habit[];
  isCompleted: (id: string, date: string) => boolean;
  todayCompletionRate: () => number;
  habitsLoading: boolean;
  goals: Goal[];
  goalsLoading: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  achieved:    "Erreicht",
  on_track:    "On Track",
  at_risk:     "At Risk",
  not_started: "Offen",
};

function getSleepCountdown(): string {
  const now = new Date();
  const target = new Date();
  target.setHours(0, 30, 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
  const diff = target.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `in ${h} h ${m} min` : `in ${m} min`;
}

export function DailyOverlay({
  mode, onDismiss,
  habits, isCompleted, todayCompletionRate, habitsLoading,
  goals, goalsLoading,
}: DailyOverlayProps) {
  const [visible, setVisible] = useState(false);
  const weather = useWeather();
  const today = getToday();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const isMorning = mode === "morning";
  const quote = isMorning ? getMorningQuote() : getEveningQuote();
  const affirmation = getMorningAffirmation();

  const dailyHabits = habits.filter((h) => h.frequency === "daily");
  const morningHabits = habits.filter((h) => h.type === "morning_routine");
  const done = dailyHabits.filter((h) => isCompleted(h.id, today)).length;
  const rate = Math.round(todayCompletionRate());
  const topGoal = goals[0] ?? null;

  const hour = new Date().getHours();
  const greeting = isMorning
    ? (hour < 7 ? "Früh auf ☀️" : "Guten Morgen ☀️")
    : (hour >= 22 ? "Guten Abend 🌙" : "Noch eine Nacht 🌙");

  const accent = isMorning ? "#E8FF6B" : "#A78BFA";
  const accentText = isMorning ? "#0A0A0A" : "#FFFFFF";
  const cardBorder = isMorning ? "#E8FF6B20" : "#A78BFA20";
  const glowBg = isMorning ? "rgba(232,255,107,0.04)" : "rgba(167,139,250,0.04)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        background: "rgba(0,0,0,0.78)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    >
      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-2xl border overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at top, ${glowBg}, transparent 60%), #0D0D0D`,
          borderColor: cardBorder,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(18px) scale(0.97)",
          transition: "opacity 0.4s ease, transform 0.4s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Top accent line */}
        <div
          className="h-px w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }}
        />

        <div className="p-6 space-y-5">
          {/* Header: brand + close */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>
              LifeOS · {isMorning ? "Morning Briefing" : "Evening Wind-down"}
            </span>
            <button
              onClick={onDismiss}
              className="text-[#333333] hover:text-[#666666] transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Greeting */}
          <div>
            <h2 className="text-2xl font-semibold text-[#EDEDED] leading-tight">{greeting}</h2>
          </div>

          {/* Quote */}
          <div
            className="rounded-xl p-4 border"
            style={{ background: `${accent}06`, borderColor: `${accent}15` }}
          >
            <p className="text-[13px] text-[#CCCCCC] italic leading-relaxed">
              „{quote.text}"
            </p>
            <p className="text-[10px] mt-2 font-medium" style={{ color: `${accent}90` }}>
              — {quote.author}
            </p>
          </div>

          {/* Affirmation (morning only) */}
          {isMorning && (
            <div className="flex items-center gap-2">
              <div
                className="text-[11px] px-3 py-1.5 rounded-full border font-medium"
                style={{ background: `${accent}10`, borderColor: `${accent}25`, color: accent }}
              >
                {affirmation}
              </div>
            </div>
          )}

          {/* Weather */}
          <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#111111] border border-[#1A1A1A]">
            {weather.loading ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] animate-pulse" />
                <div className="w-24 h-4 rounded bg-[#1A1A1A] animate-pulse" />
              </div>
            ) : weather.error ? (
              <span className="text-xs text-[#444444]">Wetter nicht verfügbar</span>
            ) : (
              <>
                <span className="text-2xl leading-none">{weather.icon}</span>
                <div className="flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-[#EDEDED] tabular-nums leading-none">
                      {weather.temperature}°
                    </span>
                    <span className="text-[12px] text-[#888888]">{weather.label}</span>
                  </div>
                  <p className="text-[10px] text-[#333333] mt-0.5">
                    Wind {weather.windspeed} km/h · Schwaigern, BW
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Habits summary */}
          {!habitsLoading && (
            <div className="space-y-2">
              {isMorning ? (
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-[#111111] rounded-xl px-4 py-3 border border-[#1A1A1A]">
                    <p className="text-[10px] text-[#333333] uppercase tracking-wider mb-1">Heute</p>
                    <p className="text-[13px] text-[#CCCCCC] font-medium">
                      {dailyHabits.length} Habits · {morningHabits.length} Morgenroutine
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#111111] rounded-xl px-4 py-3 border border-[#1A1A1A]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-[#333333] uppercase tracking-wider">Heute erledigt</p>
                    <span className="text-[12px] font-semibold tabular-nums" style={{ color: rate === 100 ? "#4ADE80" : accent }}>
                      {done}/{dailyHabits.length}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${rate}%`, background: rate === 100 ? "#4ADE80" : accent }}
                    />
                  </div>
                  <p className="text-[10px] text-[#333333] mt-1.5">{rate}% abgeschlossen</p>
                </div>
              )}
            </div>
          )}

          {/* Goal reminder (morning) */}
          {isMorning && !goalsLoading && topGoal && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#111111] border border-[#1A1A1A]">
              <div className="w-1 h-8 rounded-full shrink-0" style={{ background: "#E8FF6B40" }} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#333333] uppercase tracking-wider mb-0.5">Dein Ziel 2026</p>
                <p className="text-[13px] text-[#CCCCCC] font-medium truncate">{topGoal.title}</p>
              </div>
              <span className="text-[10px] shrink-0 text-[#555555]">{STATUS_LABEL[topGoal.status] ?? "Offen"}</span>
            </div>
          )}

          {/* Reflection prompt (evening) */}
          {!isMorning && (
            <div className="px-4 py-3 rounded-xl bg-[#111111] border border-[#1A1A1A]">
              <p className="text-[10px] text-[#333333] uppercase tracking-wider mb-1.5">Tagesreflexion</p>
              <p className="text-[13px] text-[#888888] italic">„Was war heute gut?"</p>
            </div>
          )}

          {/* Sleep countdown (evening) */}
          {!isMorning && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ borderColor: `${accent}20`, background: `${accent}06` }}>
              <span className="text-lg leading-none">🌙</span>
              <div>
                <p className="text-[12px] font-medium" style={{ color: accent }}>
                  Schlafenszeit: 00:30 Uhr
                </p>
                <p className="text-[10px] text-[#444444] mt-0.5">{getSleepCountdown()}</p>
              </div>
            </div>
          )}

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="w-full py-3 rounded-xl text-[14px] font-bold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: accent, color: accentText }}
          >
            {isMorning ? "Tag starten →" : "Gute Nacht →"}
          </button>
        </div>
      </div>
    </div>
  );
}
