"use client";

import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/utils/dates";
import type { Goal, Milestone } from "@/lib/types";

interface MilestonesTableProps {
  goals: Goal[];
  onAddProject: (milestoneId: string, title: string) => Promise<void>;
  onUpdateProgress: (id: string, progress: number) => Promise<void>;
  onUpdateStatus?: (id: string, status: Milestone["status"]) => Promise<void>;
}

const STATUS_OPTIONS: Milestone["status"][] = ["not_started", "on_track", "at_risk", "achieved"];
const STATUS_LABELS: Record<string, string> = {
  not_started: "Offen",
  on_track: "On Track",
  at_risk: "At Risk",
  achieved: "Erreicht",
};

export function MilestonesTable({ goals, onAddProject, onUpdateProgress, onUpdateStatus }: MilestonesTableProps) {
  const [editingProgress, setEditingProgress] = useState<string | null>(null);
  const [progressInput, setProgressInput] = useState("");
  const [addingProjectFor, setAddingProjectFor] = useState<string | null>(null);
  const [newProject, setNewProject] = useState("");

  const allMilestones = goals.flatMap((g) =>
    (g.milestones ?? []).map((m) => ({ ...m, goalTitle: g.title }))
  );

  if (allMilestones.length === 0) return null;

  async function saveProgress(id: string) {
    const val = Math.min(100, Math.max(0, parseInt(progressInput) || 0));
    await onUpdateProgress(id, val);
    setEditingProgress(null);
  }

  async function saveProject(milestoneId: string) {
    if (!newProject.trim()) return;
    await onAddProject(milestoneId, newProject.trim());
    setNewProject("");
    setAddingProjectFor(null);
  }

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1A1A1A]">
        <h2 className="text-[10px] font-semibold text-[#444444] uppercase tracking-[0.12em]">
          Alle Meilensteine
        </h2>
      </div>
      <div className="divide-y divide-[#161616]">
        {allMilestones.map((m) => (
          <div key={m.id} className="px-5 py-4 hover:bg-[#131313] transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[#444444]">{m.goalTitle}</span>
                <p className="text-sm font-medium text-[#DDDDDD] mt-0.5">{m.title}</p>

                {/* Projects */}
                {(m.projects ?? []).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {(m.projects ?? []).map((p) => (
                      <div key={p.id} className="flex items-center gap-2 text-xs text-[#666666]">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.status === "achieved" ? "bg-[#4ADE80]" : "bg-[#2A2A2A]"}`} />
                        {p.title}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add project */}
                {addingProjectFor === m.id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      autoFocus
                      value={newProject}
                      onChange={(e) => setNewProject(e.target.value)}
                      placeholder="Projekt-Titel"
                      onKeyDown={(e) => { if (e.key === "Enter") saveProject(m.id); if (e.key === "Escape") setAddingProjectFor(null); }}
                      className="flex-1 px-2 py-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded text-xs text-[#EDEDED] placeholder:text-[#333333] focus:outline-none focus:border-[#E8FF6B]/40"
                    />
                    <button onClick={() => saveProject(m.id)} className="text-[10px] px-2 py-1 bg-[#E8FF6B] text-[#0F0F0F] rounded font-semibold">OK</button>
                    <button onClick={() => setAddingProjectFor(null)} className="text-[#555555] text-xs">✕</button>
                  </div>
                ) : (
                  <button onClick={() => setAddingProjectFor(m.id)} className="text-[10px] text-[#333333] hover:text-[#E8FF6B] transition-colors mt-2">
                    + Projekt
                  </button>
                )}
              </div>

              {/* Right: deadline, progress, status */}
              <div className="flex items-center gap-4 shrink-0">
                {m.deadline && (
                  <span className="text-[10px] text-[#444444]">
                    {formatDate(m.deadline, "d. MMM yy")}
                  </span>
                )}

                {/* Progress */}
                {editingProgress === m.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      type="number"
                      min={0}
                      max={100}
                      value={progressInput}
                      onChange={(e) => setProgressInput(e.target.value)}
                      onBlur={() => saveProgress(m.id)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveProgress(m.id); if (e.key === "Escape") setEditingProgress(null); }}
                      className="w-12 px-1.5 py-0.5 bg-[#0F0F0F] border border-[#2A2A2A] rounded text-xs text-[#EDEDED] text-center focus:outline-none focus:border-[#E8FF6B]/40"
                    />
                    <span className="text-[10px] text-[#444444]">%</span>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingProgress(m.id); setProgressInput(String(m.progress)); }}
                    className="flex items-center gap-1.5 group"
                  >
                    <div className="w-16 h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className="h-full bg-[#E8FF6B] rounded-full transition-all" style={{ width: `${m.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-[#444444] group-hover:text-[#888888] transition-colors tabular-nums w-6">{m.progress}%</span>
                  </button>
                )}

                {/* Status */}
                {onUpdateStatus ? (
                  <select
                    value={m.status}
                    onChange={(e) => onUpdateStatus(m.id, e.target.value as Milestone["status"])}
                    className="bg-transparent text-[10px] text-[#555555] border-0 outline-none cursor-pointer hover:text-[#888888] transition-colors"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-[#111111] text-[#EDEDED]">{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={m.status} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
