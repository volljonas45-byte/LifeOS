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
          <QuickAction href="/habits" gradient="linear-gradient(145deg,#34D399,#059669)" label="Morgenroutine" icon={
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="3" fill="white"/>
              <path d="M6.5 1.5V2.5M6.5 10.5V11.5M1.5 6.5H2.5M10.5 6.5H11.5M3 3L3.7 3.7M9.3 9.3L10 10M3 10L3.7 9.3M9.3 3.7L10 3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          } />
          <QuickAction href="/dokumente" gradient="linear-gradient(145deg,#E8FF6B,#C8DF3B)" label="Neue Notiz" accent icon={
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 2V11M2 6.5H11" stroke="#0F0F0F" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          } />
          <QuickAction href="/sport" gradient="linear-gradient(145deg,#F87171,#DC2626)" label="Workout" icon={
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1.5 6.5H3L4 4L5.5 9.5L7.5 3.5L9 7.5L10 5.5H11.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          } />
          <QuickAction href="/ziele" gradient="linear-gradient(145deg,#FBBF24,#D97706)" label="Ziele" icon={
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1.5L7.8 4.8L11.5 5.3L8.9 7.8L9.6 11.5L6.5 9.8L3.4 11.5L4.1 7.8L1.5 5.3L5.2 4.8L6.5 1.5Z" fill="white" opacity="0.9"/>
            </svg>
          } />
          <div className="flex-1" />
          <span className="text-[10px] text-[#222222] uppercase tracking-widest">KW {getWeekNumber()}</span>
        </div>
      </div>

      {/* Bottom border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#1E1E1E] to-transparent" />
    </div>
  );
}

function QuickAction({ href, gradient, icon, label, accent }: {
  href: string;
  gradient: string;
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <Link href={href}
      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-150 active:scale-95 ${
        accent
          ? "bg-[#E8FF6B]/10 text-[#D4EB5A] border-[#E8FF6B]/20 hover:bg-[#E8FF6B]/15 shadow-[0_0_16px_rgba(232,255,107,0.08)]"
          : "bg-[#111111] text-[#666666] border-[#1E1E1E] hover:border-[#2A2A2A] hover:text-[#AAAAAA] hover:bg-[#141414]"
      }`}>
      <div
        className="w-6 h-6 rounded-[7px] flex items-center justify-center shrink-0"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
}

function getWeekNumber() {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7);
}
