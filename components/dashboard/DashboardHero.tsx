"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/dates";
import { useHabits } from "@/lib/hooks/useHabits";
import { getToday } from "@/lib/utils/dates";

function ProgressRing({ rate, size = 64 }: { rate: number; size?: number }) {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const dash = (rate / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1A1A1A" strokeWidth="3.5" />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke="#E8FF6B" strokeWidth="3.5" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 1s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

export function DashboardHero() {
  const [time, setTime] = useState<Date | null>(null);
  const { habits, loading, isCompleted, todayCompletionRate } = useHabits();
  const today = getToday();

  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = time?.getHours() ?? 9;
  const greeting = hour < 5 ? "Noch wach?" : hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";
  const greetingEmoji = hour < 5 ? "🌙" : hour < 12 ? "☀️" : hour < 18 ? "⚡" : "🌙";
  const dateStr = time ? formatDate(time, "EEEE, d. MMMM yyyy") : "";
  const timeStr = time ? time.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "--:--";

  const dailyHabits = habits.filter((h) => h.frequency === "daily");
  const done = dailyHabits.filter((h) => isCompleted(h.id, today)).length;
  const rate = todayCompletionRate();
  const allDone = dailyHabits.length > 0 && done === dailyHabits.length;

  return (
    <div className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-48 bg-[#E8FF6B] opacity-[0.03] blur-3xl rounded-full pointer-events-none" />

      <div className="px-8 pt-9 pb-7">
        {/* Main row */}
        <div className="flex items-start justify-between gap-8">

          {/* LEFT: Greeting */}
          <div className="flex-1">
            <p className="text-[11px] font-medium text-[#3A3A3A] uppercase tracking-[0.18em] mb-2.5 tabular-nums">
              {dateStr}
            </p>
            <h1 className="font-display text-[2.6rem] font-semibold text-[#EDEDED] tracking-tight leading-none">
              {greeting}
              <span className="ml-3 text-3xl">{greetingEmoji}</span>
            </h1>
            <p className="text-[#3A3A3A] text-sm mt-2.5">
              {allDone
                ? "Alle Habits heute erledigt — stark! 💪"
                : dailyHabits.length > 0
                ? `${dailyHabits.length - done} Habit${dailyHabits.length - done !== 1 ? "s" : ""} noch offen heute.`
                : "Leg deine ersten Habits an."}
            </p>
          </div>

          {/* RIGHT: Clock + Ring */}
          <div className="flex items-center gap-8 shrink-0">
            {/* Habit ring */}
            {!loading && dailyHabits.length > 0 && (
              <Link href="/habits" className="relative flex items-center justify-center group">
                <ProgressRing rate={rate} size={72} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-bold text-[#EDEDED] leading-none">{done}</span>
                  <span className="text-[9px] text-[#444444] leading-none mt-0.5">/{dailyHabits.length}</span>
                </div>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-[#333333] group-hover:text-[#E8FF6B] transition-colors whitespace-nowrap">
                  Habits
                </span>
              </Link>
            )}

            {/* Clock */}
            <div className="text-right">
              <p className="text-[2.8rem] font-semibold text-[#EDEDED] tabular-nums tracking-tight leading-none font-display">
                {timeStr}
              </p>
              <p className="text-[10px] text-[#333333] mt-1.5 uppercase tracking-[0.18em]">
                {hour < 12 ? "Vormittag" : hour < 17 ? "Nachmittag" : "Abend"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick actions row */}
        <div className="flex items-center gap-2 mt-7">
          <QuickAction href="/habits" icon="☀" label="Morgenroutine" />
          <QuickAction href="/dokumente" icon="+" label="Neue Notiz" accent />
          <QuickAction href="/sport" icon="⚡" label="Workout" />
          <QuickAction href="/ziele" icon="★" label="Ziele" />
          <div className="flex-1" />
          <span className="text-[10px] text-[#222222] uppercase tracking-widest">KW {getWeekNumber()}</span>
        </div>
      </div>

      {/* Bottom border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#1E1E1E] to-transparent" />
    </div>
  );
}

function QuickAction({ href, icon, label, accent }: { href: string; icon: string; label: string; accent?: boolean }) {
  return (
    <Link href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all duration-150 ${
        accent
          ? "bg-[#E8FF6B] text-[#0F0F0F] border-[#E8FF6B] hover:bg-[#D4EB5A] shadow-[0_0_20px_rgba(232,255,107,0.15)]"
          : "bg-[#111111] text-[#666666] border-[#1E1E1E] hover:border-[#2A2A2A] hover:text-[#AAAAAA] hover:bg-[#141414]"
      }`}>
      <span className="text-sm leading-none">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function getWeekNumber() {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7);
}
