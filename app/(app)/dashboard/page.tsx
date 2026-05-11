"use client";

import Link from "next/link";
import { TodayHabitsSummary } from "@/components/dashboard/TodayHabitsSummary";
import { GoalsSummary } from "@/components/dashboard/GoalsSummary";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { FocusWidget } from "@/components/dashboard/FocusWidget";
import { formatDate } from "@/lib/utils/dates";

export default function DashboardPage() {
  const today = formatDate(new Date(), "EEEE, d. MMMM yyyy");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  return (
    <div className="min-h-screen bg-[#0F0F0F]">

      {/* Hero */}
      <div className="px-8 pt-10 pb-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#444444] uppercase tracking-[0.15em] mb-2">{today}</p>
            <h1 className="font-display text-4xl font-semibold text-[#EDEDED] tracking-tight leading-none">
              {greeting}
            </h1>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <QuickPill href="/habits" label="Morgenroutine" icon="☀" />
            <QuickPill href="/dokumente" label="Neue Notiz" icon="+" accent />
            <QuickPill href="/sport" label="Workout" icon="◈" />
          </div>
        </div>

        {/* Accent line */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#1A1A1A]" />
          <span className="text-[10px] text-[#333333] uppercase tracking-widest">Heute</span>
          <div className="h-px flex-1 bg-[#1A1A1A]" />
        </div>
      </div>

      <div className="px-8 pb-8 space-y-5">

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

          {/* Dokumente */}
          <RecentDocuments />

          {/* Routinen + Nav */}
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
    <div className="bg-[#111111] border border-[#E8FF6B]/10 rounded-2xl p-5">
      <h2 className="text-[10px] font-semibold text-[#E8FF6B]/50 uppercase tracking-[0.12em] mb-4">Routinen</h2>
      <div className="space-y-2.5">
        <Link href="/habits" className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <span className="text-base">☀️</span>
            <span className="text-sm text-[#AAAAAA] group-hover:text-[#EDEDED] transition-colors">Morgenroutine</span>
          </div>
          <span className="text-[10px] text-[#E8FF6B] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </Link>
        <Link href="/habits" className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <span className="text-base">🌙</span>
            <span className="text-sm text-[#AAAAAA] group-hover:text-[#EDEDED] transition-colors">Abendroutine</span>
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
    { href: "/dokumente", icon: "▣", label: "Docs" },
  ];
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-5">
      <h2 className="text-[10px] font-semibold text-[#444444] uppercase tracking-[0.12em] mb-3">Navigation</h2>
      <div className="grid grid-cols-2 gap-1.5">
        {items.map((item) => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-2 px-3 py-2 bg-[#0F0F0F] hover:bg-[#161616] border border-[#1E1E1E] rounded-xl text-sm text-[#666666] hover:text-[#CCCCCC] transition-all">
            <span className="text-[#444444]">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function QuickPill({ href, label, icon, accent }: { href: string; label: string; icon: string; accent?: boolean }) {
  return (
    <Link href={href}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
        accent
          ? "bg-[#E8FF6B] text-[#0F0F0F] border-[#E8FF6B] hover:bg-[#D4EB5A]"
          : "bg-transparent text-[#666666] border-[#222222] hover:border-[#333333] hover:text-[#AAAAAA]"
      }`}>
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

