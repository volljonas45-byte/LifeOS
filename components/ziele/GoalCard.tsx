"use client";

import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import type { Goal, GoalStatus } from "@/lib/types";

interface GoalCardProps {
  goal: Goal;
  index: number;
  onAddMilestone: (goalId: string, title: string, deadline?: string) => Promise<void>;
  onUpdateStatus: (id: string, status: GoalStatus) => Promise<void>;
}

export function GoalCard({ goal, index, onAddMilestone, onUpdateStatus }: GoalCardProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDeadline, setNewDeadline] = useState("");

  const milestones = goal.milestones ?? [];
  const done = milestones.filter((m) => m.status === "achieved").length;

  async function handleAddMilestone() {
    if (!newTitle.trim()) return;
    await onAddMilestone(goal.id, newTitle.trim(), newDeadline || undefined);
    setNewTitle("");
    setNewDeadline("");
    setAdding(false);
  }

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] text-[#444444] font-medium uppercase tracking-wide">Ziel {index + 1}</span>
          <h3 className="font-display text-base font-semibold text-[#EDEDED] mt-1 leading-snug">
            {goal.title}
          </h3>
        </div>
        <select
          value={goal.status}
          onChange={(e) => onUpdateStatus(goal.id, e.target.value as GoalStatus)}
          className="bg-transparent text-[10px] border-0 outline-none cursor-pointer"
        >
          {(["on_track", "at_risk", "achieved", "not_started"] as GoalStatus[]).map((s) => (
            <option key={s} value={s} className="bg-[#111111] text-[#EDEDED]">
              {s === "on_track" ? "On Track" : s === "at_risk" ? "At Risk" : s === "achieved" ? "Erreicht" : "Offen"}
            </option>
          ))}
        </select>
      </div>

      {milestones.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-[#444444] uppercase tracking-[0.1em] mb-2">
            Meilensteine {done}/{milestones.length}
          </p>
          {milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.status === "achieved" ? "bg-[#4ADE80]" : m.status === "at_risk" ? "bg-[#FB923C]" : "bg-[#333333]"}`} />
              <span className="text-sm text-[#888888] truncate flex-1">{m.title}</span>
              {m.progress > 0 && (
                <span className="text-[10px] text-[#444444]">{m.progress}%</span>
              )}
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="space-y-2">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Meilenstein-Titel"
            className="w-full px-3 py-1.5 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-sm text-[#EDEDED] placeholder:text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#E8FF6B]/30 focus:border-[#E8FF6B]/40"
            onKeyDown={(e) => e.key === "Enter" && handleAddMilestone()}
          />
          <input
            type="date"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-sm text-[#666666] focus:outline-none focus:ring-1 focus:ring-[#E8FF6B]/30 focus:border-[#E8FF6B]/40"
          />
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 py-1.5 text-xs text-[#666666] border border-[#222222] rounded-lg hover:bg-[#1A1A1A] transition-colors">Abbrechen</button>
            <button onClick={handleAddMilestone} className="flex-1 py-1.5 text-xs text-[#0F0F0F] bg-[#E8FF6B] rounded-lg hover:bg-[#D4EB5A] font-semibold transition-colors">Hinzufügen</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-xs text-[#333333] hover:text-[#E8FF6B] transition-colors text-left mt-auto"
        >
          + Meilenstein
        </button>
      )}
    </div>
  );
}
