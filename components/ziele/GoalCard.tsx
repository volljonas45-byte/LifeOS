"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Goal, GoalStatus } from "@/lib/types";

const STATUS_CONFIG: Record<GoalStatus, { label: string; color: string; dot: string }> = {
  achieved:    { label: "Erreicht",  color: "text-[#4ADE80]", dot: "bg-[#4ADE80]" },
  on_track:    { label: "On Track",  color: "text-[#4D9EFF]", dot: "bg-[#4D9EFF]" },
  at_risk:     { label: "At Risk",   color: "text-[#FB923C]", dot: "bg-[#FB923C]" },
  not_started: { label: "Offen",     color: "text-[#555555]", dot: "bg-[#333333]" },
};

const GOAL_ACCENTS = ["#E8FF6B", "#4D9EFF", "#4ADE80"];

interface GoalCardProps {
  goal: Goal;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateStatus: (id: string, status: GoalStatus) => Promise<void>;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
}

export function GoalCard({ goal, index, isSelected, onSelect, onUpdateStatus, onUpdateGoal, onDeleteGoal }: GoalCardProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(goal.title);
  const [showActions, setShowActions] = useState(false);

  const milestones = goal.milestones ?? [];
  const done = milestones.filter((m) => m.status === "achieved").length;
  const progress = milestones.length > 0
    ? Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length)
    : 0;
  const accent = GOAL_ACCENTS[index % GOAL_ACCENTS.length];
  const cfg = STATUS_CONFIG[goal.status] ?? STATUS_CONFIG.not_started;

  async function commitTitle() {
    setEditingTitle(false);
    if (titleDraft.trim() && titleDraft !== goal.title) {
      await onUpdateGoal(goal.id, { title: titleDraft.trim() });
    }
  }

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        "relative group cursor-pointer rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-200",
        isSelected
          ? "border-[#2A2A2A] bg-[#151515] shadow-lg shadow-black/40"
          : "border-[#1A1A1A] bg-[#111111] hover:border-[#252525] hover:bg-[#131313]"
      )}
    >
      {/* Selected indicator stripe */}
      {isSelected && (
        <div
          className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full"
          style={{ background: accent }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}
          >
            {index + 1}
          </span>
          <span className="text-[10px] text-[#444444] uppercase tracking-widest font-medium">Ziel</span>
        </div>

        {/* Actions */}
        <div
          className={cn("flex items-center gap-2 transition-opacity", showActions ? "opacity-100" : "opacity-0")}
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={goal.status}
            onChange={(e) => onUpdateStatus(goal.id, e.target.value as GoalStatus)}
            className="bg-transparent text-[10px] text-[#555555] border-0 outline-none cursor-pointer hover:text-[#888888] transition-colors"
          >
            {(Object.keys(STATUS_CONFIG) as GoalStatus[]).map((s) => (
              <option key={s} value={s} className="bg-[#111111] text-[#EDEDED]">
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
          <button
            onClick={() => { if (confirm(`"${goal.title}" löschen?`)) onDeleteGoal(goal.id); }}
            className="text-[#2A2A2A] hover:text-[#F87171] transition-colors text-base leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* Title */}
      <div onClick={(e) => e.stopPropagation()}>
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => { if (e.key === "Enter") commitTitle(); if (e.key === "Escape") { setEditingTitle(false); setTitleDraft(goal.title); } }}
            className="w-full bg-transparent border-b border-[#E8FF6B]/30 outline-none text-lg font-semibold text-[#EDEDED] font-display leading-snug pb-0.5"
          />
        ) : (
          <h3
            className="font-display text-lg font-semibold text-[#EDEDED] leading-snug cursor-text"
            onDoubleClick={(e) => { e.stopPropagation(); setEditingTitle(true); setTitleDraft(goal.title); }}
          >
            {goal.title}
          </h3>
        )}
      </div>

      {/* Progress + status */}
      <div className="mt-auto space-y-2.5">
        {milestones.length > 0 && (
          <>
            <div className="w-full h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: accent }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#444444]">
                {done}/{milestones.length} Meilensteine
              </span>
              <span className={cn("text-[10px] font-medium flex items-center gap-1", cfg.color)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                {cfg.label}
              </span>
            </div>
          </>
        )}
        {milestones.length === 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#333333]">Klicken um Details zu sehen</span>
            <span className={cn("text-[10px] font-medium flex items-center gap-1", cfg.color)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
              {cfg.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
