"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Goal, GoalStatus } from "@/lib/types";

const STATUS_CONFIG: Record<GoalStatus, { label: string; color: string; dot: string }> = {
  achieved:    { label: "Erreicht",  color: "#4ADE80", dot: "#4ADE80" },
  on_track:    { label: "On Track",  color: "#4D9EFF", dot: "#4D9EFF" },
  at_risk:     { label: "At Risk",   color: "#FB923C", dot: "#FB923C" },
  not_started: { label: "Offen",     color: "#444444", dot: "#2A2A2A" },
};

export const GOAL_ACCENTS = ["#E8FF6B", "#4D9EFF", "#4ADE80"];

interface GoalCardProps {
  goal: Goal;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateStatus: (id: string, status: GoalStatus) => Promise<void>;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
}

/* SVG Ring Progress — 44px viewbox */
function RingProgress({ progress, accent, size = 52 }: { progress: number; accent: string; size?: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (progress / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="22" cy="22" r={r} fill="none" stroke="#1A1A1A" strokeWidth="3" />
      <circle
        cx="22" cy="22" r={r}
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.5s ease" }}
      />
    </svg>
  );
}

export function GoalCard({ goal, index, isSelected, onSelect, onUpdateStatus, onUpdateGoal, onDeleteGoal }: GoalCardProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(goal.title);
  const [hovered, setHovered] = useState(false);

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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative cursor-pointer rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-200",
        isSelected
          ? "border-[#252525] bg-[#111111]"
          : "border-[#161616] bg-[#0C0C0C] hover:border-[#222222] hover:bg-[#0F0F0F]"
      )}
      style={isSelected ? { boxShadow: `0 0 0 1px ${accent}18, 0 8px 32px rgba(0,0,0,0.5)` } : {}}
    >
      {/* Accent top border when selected */}
      {isSelected && (
        <div
          className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}60, transparent)` }}
        />
      )}

      {/* Header row: index badge + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-md"
            style={{ background: `${accent}12`, color: accent }}
          >
            ZIEL {index + 1}
          </span>
        </div>

        {/* Actions on hover */}
        <div
          className={cn("flex items-center gap-2 transition-all duration-150", hovered ? "opacity-100" : "opacity-0")}
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={goal.status}
            onChange={(e) => onUpdateStatus(goal.id, e.target.value as GoalStatus)}
            className="bg-transparent text-[10px] border-0 outline-none cursor-pointer"
            style={{ color: cfg.color }}
          >
            {(Object.keys(STATUS_CONFIG) as GoalStatus[]).map((s) => (
              <option key={s} value={s} className="bg-[#111111] text-[#EDEDED]">
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
          <button
            onClick={() => { if (confirm(`"${goal.title}" löschen?`)) onDeleteGoal(goal.id); }}
            className="text-[#2A2A2A] hover:text-[#F87171] transition-colors leading-none text-base"
          >
            ×
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="flex-1" onClick={(e) => e.stopPropagation()}>
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") { setEditingTitle(false); setTitleDraft(goal.title); }
            }}
            className="w-full bg-transparent border-b border-[#E8FF6B]/30 outline-none text-[17px] font-semibold text-[#EDEDED] leading-snug pb-0.5"
          />
        ) : (
          <h3
            className="font-semibold text-[17px] text-[#E0E0E0] leading-snug cursor-text"
            onDoubleClick={(e) => { e.stopPropagation(); setEditingTitle(true); setTitleDraft(goal.title); }}
            title="Doppelklick zum Bearbeiten"
          >
            {goal.title}
          </h3>
        )}
      </div>

      {/* Bottom: ring + stats */}
      <div className="flex items-center gap-4">
        {/* Milestone pills */}
        <div className="flex gap-1.5 flex-1">
          {[0, 1, 2].map((i) => {
            const ms = milestones[i];
            const filled = !!ms;
            const achieved = ms?.status === "achieved";
            const atRisk = ms?.status === "at_risk";
            const onTrack = ms?.status === "on_track";
            const pillColor = achieved ? "#4ADE80" : atRisk ? "#FB923C" : onTrack ? "#4D9EFF" : filled ? accent : "#1A1A1A";
            return (
              <div
                key={i}
                className="flex-1 h-1.5 rounded-full transition-all duration-300"
                style={{ background: filled ? `${pillColor}${achieved ? "FF" : "60"}` : "#1A1A1A" }}
                title={ms?.title}
              />
            );
          })}
        </div>

        {/* Ring */}
        <div className="relative shrink-0">
          <RingProgress progress={progress} accent={accent} size={48} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold tabular-nums" style={{ color: accent }}>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Status label + milestone count */}
      <div className="flex items-center justify-between -mt-2">
        <span className="text-[10px]" style={{ color: cfg.dot }}>
          ● {cfg.label}
        </span>
        {milestones.length > 0 && (
          <span className="text-[10px] text-[#333333]">
            {done}/{milestones.length} erreicht
          </span>
        )}
      </div>
    </div>
  );
}
