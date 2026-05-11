"use client";

import { TodayHabitsSummary } from "@/components/dashboard/TodayHabitsSummary";
import { GoalsSummary } from "@/components/dashboard/GoalsSummary";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { FocusWidget } from "@/components/dashboard/FocusWidget";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#080808]">
      <DashboardHero />

      <div className="px-8 pb-10 space-y-4 mt-5">
        {/* ROW 1: Habits (wide) + Ziele */}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <TodayHabitsSummary />
          </div>
          <div className="col-span-2">
            <GoalsSummary />
          </div>
        </div>

        {/* ROW 2: Fokus + Dokumente + Aktionen */}
        <div className="grid grid-cols-3 gap-4">
          <FocusWidget />
          <RecentDocuments />
          <div className="space-y-3">
            <QuickActionsCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionsCard() {
  const actions = [
    { href: "/habits",    icon: "☀️", label: "Morgenroutine starten",  sub: "Habits & Routine" },
    { href: "/sport",     icon: "⚡", label: "Workout loggen",         sub: "Sport Tracker" },
    { href: "/ziele",     icon: "★",  label: "Meilenstein updaten",    sub: "Jahresplanung" },
    { href: "/dokumente", icon: "📝", label: "Neue Notiz",             sub: "Second Brain" },
  ];

  return (
    <div className="bg-[#0E0E0E] border border-[#1A1A1A] rounded-2xl p-5 h-full">
      <h2 className="text-[10px] font-semibold text-[#333333] uppercase tracking-[0.18em] mb-4">Schnellzugriff</h2>
      <div className="space-y-1.5">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-[#1E1E1E] hover:bg-[#141414] transition-all group"
          >
            <span className="text-base w-6 text-center shrink-0">{a.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#BBBBBB] group-hover:text-[#EDEDED] transition-colors font-medium truncate">{a.label}</p>
              <p className="text-[10px] text-[#333333]">{a.sub}</p>
            </div>
            <span className="text-[#2A2A2A] group-hover:text-[#E8FF6B] transition-colors text-xs">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
