"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/dates";
import { useHabits } from "@/lib/hooks/useHabits";
import { getToday } from "@/lib/utils/dates";

function ProgressRing({ rate, size = 56 }: { rate: number; size?: number }) {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const dash = (rate / 100) * circ;
  const color = rate === 100 ? "#4ADE80" : "#E8FF6B";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#161616" strokeWidth="3.5" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

function getWeekNumber() {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - start.getTime()) / 86400000) + start.getDay() + 1) / 7);
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
  const greeting =
    hour < 5  ? "Noch wach?" :
    hour < 12 ? "Guten Morgen" :
    hour < 18 ? "Guten Tag" : "Guten Abend";
  const greetingEmoji =
    hour < 5  ? "🌙" :
    hour < 12 ? "☀️" :
    hour < 18 ? "⚡" : "🌙";

  const dateStr = time ? formatDate(time, "EEEE, d. MMMM yyyy") : "";
  const timeStr = time
    ? time.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    : "--:--";
  const secondsStr = time
    ? String(time.getSeconds()).padStart(2, "0")
    : "00";

  const dailyHabits = habits.filter((h) => h.frequency === "daily");
  const done = dailyHabits.filter((h) => isCompleted(h.id, today)).length;
  const rate = todayCompletionRate();
  const allDone = dailyHabits.length > 0 && done === dailyHabits.length;

  const statusMsg = allDone
    ? "Alle Habits erledigt — perfekter Tag 💪"
    : dailyHabits.length > 0
    ? `Noch ${dailyHabits.length - done} Habit${dailyHabits.length - done !== 1 ? "s" : ""} heute`
    : "Starte mit deinen ersten Habits";

  return (
    <div className="relative overflow-hidden border-b border-[#111111]">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 bg-[#E8FF6B] opacity-[0.025] blur-3xl pointer-events-none" />

      <div className="px-8 pt-8 pb-6">
        <div className="flex items-center justify-between gap-8">

          {/* LEFT: date + greeting */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-[#2E2E2E] uppercase tracking-[0.2em] mb-3 tabular-nums">
              {dateStr} · KW {getWeekNumber()}
            </p>
            <h1 className="font-display text-[2.2rem] font-semibold text-[#E8E8E8] tracking-tight leading-none flex items-center gap-3">
              {greeting}
              <span className="text-2xl">{greetingEmoji}</span>
            </h1>
            <p className="text-[13px] text-[#3A3A3A] mt-2.5">{statusMsg}</p>
          </div>

          {/* RIGHT: habit ring + clock */}
          <div className="flex items-center gap-8 shrink-0">
            {/* Habit progress ring */}
            {!loading && dailyHabits.length > 0 && (
              <Link href="/habits" className="relative flex items-center justify-center group" title="Habits">
                <ProgressRing rate={rate} size={60} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[15px] font-bold text-[#EDEDED] leading-none tabular-nums">{done}</span>
                  <span className="text-[8px] text-[#333333] mt-0.5">/{dailyHabits.length}</span>
                </div>
              </Link>
            )}

            {/* Clock */}
            <div className="text-right">
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-[2.6rem] font-semibold text-[#E8E8E8] tabular-nums tracking-tight leading-none font-display">
                  {timeStr}
                </span>
                <span className="text-sm text-[#2A2A2A] tabular-nums mb-0.5">{secondsStr}</span>
              </div>
              <p className="text-[10px] text-[#2A2A2A] mt-1.5 uppercase tracking-[0.15em]">
                {hour < 12 ? "Vormittag" : hour < 17 ? "Nachmittag" : "Abend"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-6">
          <QuickAction href="/habits"    icon="☀"  label="Habits"      />
          <QuickAction href="/dokumente" icon="+"   label="Neue Notiz"  accent />
          <QuickAction href="/sport"     icon="⚡"  label="Workout"     />
          <QuickAction href="/ziele"     icon="◎"  label="Ziele"       />
          <QuickAction href="/aufgaben"  icon="✓"   label="Aufgaben"    />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label, accent }: { href: string; icon: string; label: string; accent?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium border transition-all duration-150 ${
        accent
          ? "bg-[#E8FF6B] text-[#0A0A0A] border-[#E8FF6B] hover:bg-[#D4EB5A]"
          : "bg-transparent text-[#555555] border-[#181818] hover:border-[#252525] hover:text-[#999999] hover:bg-[#111111]"
      }`}
    >
      <span className="text-[13px] leading-none">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
