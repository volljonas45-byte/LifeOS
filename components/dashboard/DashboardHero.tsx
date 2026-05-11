"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/dates";
import { useHabits } from "@/lib/hooks/useHabits";
import { getToday } from "@/lib/utils/dates";

function ProgressRing({ rate }: { rate: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (rate / 100) * circ;

  return (
    <svg width="72" height="72" className="rotate-[-90deg]">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1A1A1A" strokeWidth="4" />
      <circle
        cx="36" cy="36" r={r}
        fill="none"
        stroke="#E8FF6B"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

export function DashboardHero() {
  const [time, setTime] = useState(new Date());
  const { habits, loading, isCompleted, todayCompletionRate } = useHabits();
  const today = getToday();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = time.getHours();
  const greeting = hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";
  const dateStr = formatDate(time, "EEEE, d. MMMM yyyy");
  const timeStr = time.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  const dailyHabits = habits.filter((h) => h.frequency === "daily");
  const done = dailyHabits.filter((h) => isCompleted(h.id, today)).length;
  const rate = todayCompletionRate();

  return (
    <div className="px-8 pt-10 pb-6">
      <div className="flex items-center justify-between">
        {/* Left: greeting */}
        <div>
          <p className="text-[11px] font-medium text-[#333333] uppercase tracking-[0.15em] mb-2">{dateStr}</p>
          <h1 className="font-display text-4xl font-semibold text-[#EDEDED] tracking-tight leading-none">
            {greeting}
          </h1>
        </div>

        {/* Right: clock + habit ring */}
        <div className="flex items-center gap-6">
          {/* Habit ring */}
          {!loading && dailyHabits.length > 0 && (
            <Link href="/habits" className="relative flex items-center justify-center group">
              <ProgressRing rate={rate} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-[#EDEDED] leading-none">{done}</span>
                <span className="text-[9px] text-[#555555] leading-none mt-0.5">/{dailyHabits.length}</span>
              </div>
              <span className="absolute -bottom-5 text-[9px] text-[#444444] group-hover:text-[#E8FF6B] transition-colors whitespace-nowrap">Habits</span>
            </Link>
          )}

          {/* Clock */}
          <div className="text-right">
            <p className="text-3xl font-semibold text-[#EDEDED] tabular-nums tracking-tight leading-none font-display">
              {timeStr}
            </p>
            <p className="text-[10px] text-[#333333] mt-1 uppercase tracking-widest">
              {hour < 12 ? "Vormittag" : hour < 17 ? "Nachmittag" : "Abend"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Pills */}
      <div className="flex items-center gap-2 mt-6">
        <QuickPill href="/habits" label="Morgenroutine" icon="☀" />
        <QuickPill href="/dokumente" label="Neue Notiz" icon="+" accent />
        <QuickPill href="/sport" label="Workout loggen" icon="◈" />
        <QuickPill href="/ziele" label="Ziele" icon="◎" />
      </div>

      {/* Divider */}
      <div className="mt-6 h-px bg-[#161616]" />
    </div>
  );
}

function QuickPill({ href, label, icon, accent }: { href: string; label: string; icon: string; accent?: boolean }) {
  return (
    <Link href={href}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
        accent
          ? "bg-[#E8FF6B] text-[#0F0F0F] border-[#E8FF6B] hover:bg-[#D4EB5A]"
          : "bg-transparent text-[#555555] border-[#1E1E1E] hover:border-[#2A2A2A] hover:text-[#AAAAAA]"
      }`}>
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
