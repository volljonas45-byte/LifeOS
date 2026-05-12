"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { TodayHabitsSummary } from "@/components/dashboard/TodayHabitsSummary";
import { GoalsSummary } from "@/components/dashboard/GoalsSummary";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { FocusWidget } from "@/components/dashboard/FocusWidget";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DailyOverlay } from "@/components/dashboard/DailyOverlay";
import { useHabits } from "@/lib/hooks/useHabits";
import { useGoals } from "@/lib/hooks/useGoals";

type OverlayMode = "morning" | "evening" | null;

function getEveningAnchorDate(): string {
  const now = new Date();
  const h = now.getHours();
  const anchor = new Date(now);
  if (h < 5) anchor.setDate(anchor.getDate() - 1);
  const y = anchor.getFullYear();
  const m = String(anchor.getMonth() + 1).padStart(2, "0");
  const d = String(anchor.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function useOverlayMode(): { mode: OverlayMode; dismiss: () => void } {
  const [mode, setMode] = useState<OverlayMode>(null);

  useEffect(() => {
    const now = new Date();
    const h = now.getHours();
    const min = now.getMinutes();

    const isMorning = h >= 5 && h < 12;
    const isEvening = h >= 22 || h < 5;
    const isLateEnough = h >= 22 ? (h > 22 || min >= 30) : true; // 22:30+

    if (isMorning) {
      const key = `lifeos-morning-shown-${getTodayString()}`;
      if (!localStorage.getItem(key)) setMode("morning");
    } else if (isEvening && isLateEnough) {
      const key = `lifeos-evening-shown-${getEveningAnchorDate()}-night`;
      if (!localStorage.getItem(key)) setMode("evening");
    }
  }, []);

  const dismiss = useCallback(() => {
    const now = new Date();
    const h = now.getHours();
    if (h >= 5 && h < 12) {
      localStorage.setItem(`lifeos-morning-shown-${getTodayString()}`, "1");
    } else {
      localStorage.setItem(`lifeos-evening-shown-${getEveningAnchorDate()}-night`, "1");
    }
    setMode(null);
  }, []);

  return { mode, dismiss };
}

export default function DashboardPage() {
  const { mode, dismiss } = useOverlayMode();
  const { habits, isCompleted, todayCompletionRate, loading: habitsLoading } = useHabits();
  const { goals, loading: goalsLoading } = useGoals();

  return (
    <div className="min-h-screen bg-[#080808]">
      {mode && (
        <DailyOverlay
          mode={mode}
          onDismiss={dismiss}
          habits={habits}
          isCompleted={isCompleted}
          todayCompletionRate={todayCompletionRate}
          habitsLoading={habitsLoading}
          goals={goals}
          goalsLoading={goalsLoading}
        />
      )}

      <DashboardHero />

      <div className="px-8 py-6 space-y-4">
        {/* ROW 1: Habits (big) + Ziele (medium) */}
        <div className="grid grid-cols-[3fr_2fr] gap-4">
          <TodayHabitsSummary />
          <GoalsSummary />
        </div>

        {/* ROW 2: Wochenfokus + Dokumente + Schnellzugriff */}
        <div className="grid grid-cols-3 gap-4">
          <FocusWidget />
          <RecentDocuments />
          <QuickActionsCard />
        </div>
      </div>
    </div>
  );
}

function QuickActionsCard() {
  const actions = [
    { href: "/habits",    icon: "☀",  label: "Morgenroutine starten",  sub: "Habits & Routine",  color: "#E8FF6B" },
    { href: "/sport",     icon: "⚡", label: "Workout loggen",          sub: "Sport Tracker",     color: "#4D9EFF" },
    { href: "/ziele",     icon: "◎",  label: "Meilenstein updaten",     sub: "Jahresplanung",     color: "#4ADE80" },
    { href: "/dokumente", icon: "✎",  label: "Neue Notiz erstellen",    sub: "Second Brain",      color: "#C084FC" },
    { href: "/aufgaben",  icon: "✓",  label: "Aufgaben ansehen",        sub: "To-Do Liste",       color: "#FB923C" },
  ];

  return (
    <div className="bg-[#0C0C0C] border border-[#161616] rounded-2xl p-5 h-full flex flex-col">
      <h2 className="text-[11px] font-semibold text-[#333333] uppercase tracking-[0.18em] mb-4">Schnellzugriff</h2>
      <div className="space-y-1 flex-1">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-[#181818] hover:bg-[#111111] transition-all group"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] shrink-0"
              style={{ background: `${a.color}10`, color: a.color }}
            >
              {a.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[#999999] group-hover:text-[#DDDDDD] transition-colors font-medium truncate">{a.label}</p>
              <p className="text-[10px] text-[#2A2A2A]">{a.sub}</p>
            </div>
            <span className="text-[#1E1E1E] group-hover:text-[#E8FF6B] transition-colors text-xs">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
