"use client";

import Link from "next/link";
import { useGoals } from "@/lib/hooks/useGoals";
import { StatusBadge } from "@/components/ziele/StatusBadge";

export function GoalsSummary() {
  const { goals, loading } = useGoals();

  return (
    <div className="bg-[#161616] border border-[#262626] rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-semibold text-[#777777] uppercase tracking-widest">Jahresziele {new Date().getFullYear()}</h2>
        <Link href="/ziele" className="text-[10px] text-[#E8FF6B] hover:text-[#D4EB5A] transition-colors">Alle →</Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-14 bg-[#1A1A1A] rounded-xl animate-pulse" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-3xl mb-3 opacity-30">◎</span>
          <p className="text-sm text-[#555555] mb-4">Noch keine Ziele definiert</p>
          <Link href="/ziele" className="px-4 py-2 bg-[#E8FF6B] text-[#0F0F0F] rounded-lg text-xs font-semibold hover:bg-[#D4EB5A] transition-colors">
            Ziele anlegen
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {goals.slice(0, 3).map((g, i) => {
            const milestones = g.milestones ?? [];
            const done = milestones.filter(m => m.status === "achieved").length;
            return (
              <Link key={g.id} href="/ziele"
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#161616] transition-colors group">
                <span className="w-5 h-5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[10px] font-bold text-[#555555] shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#DDDDDD] truncate group-hover:text-[#EDEDED] transition-colors">{g.title}</p>
                  {milestones.length > 0 && (
                    <p className="text-[11px] text-[#666666] mt-0.5">{done}/{milestones.length} Meilensteine</p>
                  )}
                </div>
                <StatusBadge status={g.status} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
