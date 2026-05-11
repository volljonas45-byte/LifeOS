"use client";

import { TodayHabitsSummary } from "@/components/dashboard/TodayHabitsSummary";
import { GoalsSummary } from "@/components/dashboard/GoalsSummary";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { FocusWidget } from "@/components/dashboard/FocusWidget";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <DashboardHero />

      <div className="px-8 pb-8 space-y-4 mt-6">

        {/* ROW 1: Habits (wide) + Ziele */}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <TodayHabitsSummary />
          </div>
          <div className="col-span-2">
            <GoalsSummary />
          </div>
        </div>

        {/* ROW 2: Fokus + Dokumente + Routinen */}
        <div className="grid grid-cols-3 gap-4">
          <FocusWidget />
          <RecentDocuments />
          <div className="space-y-4">
            <RoutinesCard />
            <QuickNavCard />
          </div>
        </div>

      </div>
    </div>
  );
}

function RoutinesCard() {
  return (
    <div className="bg-[#161616] border border-[#262626] rounded-2xl p-5">
      <h2 className="text-xs font-semibold text-[#777777] uppercase tracking-widest mb-4">Routinen</h2>
      <div className="space-y-2.5">
        <Link href="/habits" className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <span className="text-base">☀️</span>
            <span className="text-sm text-[#BBBBBB] group-hover:text-[#EDEDED] transition-colors">Morgenroutine</span>
          </div>
          <span className="text-[10px] text-[#E8FF6B] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </Link>
        <Link href="/habits" className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <span className="text-base">🌙</span>
            <span className="text-sm text-[#BBBBBB] group-hover:text-[#EDEDED] transition-colors">Abendroutine</span>
          </div>
          <span className="text-[10px] text-[#E8FF6B] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </Link>
      </div>
    </div>
  );
}

function QuickNavCard() {
  const items = [
    { href: "/habits",    icon: "○", label: "Habits" },
    { href: "/ziele",     icon: "◎", label: "Ziele" },
    { href: "/sport",     icon: "◈", label: "Sport" },
    { href: "/dokumente", icon: "≡", label: "Docs" },
  ];
  return (
    <div className="bg-[#161616] border border-[#262626] rounded-2xl p-5">
      <h2 className="text-xs font-semibold text-[#777777] uppercase tracking-widest mb-3">Navigation</h2>
      <div className="grid grid-cols-2 gap-1.5">
        {items.map((item) => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-2 px-3 py-2 bg-[#111111] hover:bg-[#1A1A1A] border border-[#222222] rounded-xl text-sm text-[#888888] hover:text-[#CCCCCC] transition-all">
            <span className="text-[#666666]">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
