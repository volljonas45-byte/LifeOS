"use client";

import { TodayHabitsSummary } from "@/components/dashboard/TodayHabitsSummary";
import { GoalsSummary } from "@/components/dashboard/GoalsSummary";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { FocusWidget } from "@/components/dashboard/FocusWidget";
import { DashboardHero } from "@/components/dashboard/DashboardHero";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#080808]">
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

import Link from "next/link";

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
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] shrink-0 transition-all"
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
