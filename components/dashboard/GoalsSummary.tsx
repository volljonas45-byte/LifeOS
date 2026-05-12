"use client";

import Link from "next/link";
import { useGoals } from "@/lib/hooks/useGoals";

const ACCENTS = ["#E8FF6B", "#4D9EFF", "#4ADE80"];

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  achieved:    { label: "Erreicht",  color: "#4ADE80" },
  on_track:    { label: "On Track",  color: "#4D9EFF" },
  at_risk:     { label: "At Risk",   color: "#FB923C" },
  not_started: { label: "Offen",     color: "#444444" },
};

export function GoalsSummary() {
  const { goals, loading } = useGoals();

  const totalMilestones = goals.flatMap(g => g.milestones ?? []);
  const achievedMilestones = totalMilestones.filter(m => m.status === "achieved").length;
  const overallPct = totalMilestones.length > 0
    ? Math.round(totalMilestones.reduce((s, m) => s + m.progress, 0) / totalMilestones.length)
    : 0;

  return (
    <div className="bg-[#0C0C0C] border border-[#161616] rounded-2xl p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold text-[#333333] uppercase tracking-[0.18em]">Jahresziele 2026</h2>
        <Link href="/ziele" className="text-[10px] text-[#2A2A2A] hover:text-[#E8FF6B] transition-colors">
          Alle →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 flex-1">
          {[1, 2, 3].map(i => <div key={i} className="h-14 bg-[#111111] rounded-xl animate-pulse" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <span className="text-2xl mb-3 opacity-20">◎</span>
          <p className="text-sm text-[#444444] mb-4">Noch keine Ziele</p>
          <Link href="/ziele" className="px-4 py-2 bg-[#E8FF6B] text-[#0A0A0A] rounded-xl text-xs font-bold hover:bg-[#D4EB5A] transition-colors">
            Ziele anlegen
          </Link>
        </div>
      ) : (
        <>
          {/* Overall progress mini-bar */}
          {totalMilestones.length > 0 && (
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className="flex-1 h-1 bg-[#141414] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${overallPct}%`, background: "#E8FF6B" }}
                />
              </div>
              <span className="text-[10px] text-[#333333] tabular-nums shrink-0">
                {achievedMilestones}/{totalMilestones.length} Meilensteine
              </span>
            </div>
          )}

          {/* Goal rows */}
          <div className="space-y-2 flex-1">
            {goals.slice(0, 3).map((g, i) => {
              const milestones = g.milestones ?? [];
              const done = milestones.filter(m => m.status === "achieved").length;
              const pct = milestones.length > 0
                ? Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length)
                : 0;
              const accent = ACCENTS[i % 3];
              const statusCfg = STATUS_LABEL[g.status] ?? STATUS_LABEL.not_started;

              return (
                <Link
                  key={g.id}
                  href="/ziele"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#111111] border border-transparent hover:border-[#1A1A1A] transition-all group"
                >
                  {/* Color stripe */}
                  <div className="w-0.5 h-8 rounded-full shrink-0" style={{ background: `${accent}50` }} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#CCCCCC] group-hover:text-[#EDEDED] transition-colors truncate">
                      {g.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Mini progress bar */}
                      <div className="w-20 h-0.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent }} />
                      </div>
                      <span className="text-[10px] text-[#333333] tabular-nums">
                        {milestones.length > 0 ? `${done}/${milestones.length}` : "0 Meilensteine"}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <span className="text-[10px] shrink-0 font-medium" style={{ color: statusCfg.color }}>
                    {statusCfg.label}
                  </span>
                </Link>
              );
            })}

            {/* Empty slots */}
            {goals.length < 3 &&
              Array.from({ length: 3 - goals.length }).map((_, i) => (
                <Link
                  key={`empty-${i}`}
                  href="/ziele"
                  className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-[#141414] hover:border-[#222222] transition-colors group"
                >
                  <div className="w-0.5 h-8 rounded-full bg-[#1A1A1A] shrink-0" />
                  <p className="text-[12px] text-[#222222] group-hover:text-[#333333] transition-colors">
                    Ziel {goals.length + i + 1} hinzufügen
                  </p>
                </Link>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
