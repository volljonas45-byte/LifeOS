"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils/dates";
import type { Goal, Milestone, Project } from "@/lib/types";

interface MilestonesTableProps {
  goals: Goal[];
  onAddProject: (milestoneId: string, title: string) => Promise<void>;
  onUpdateMilestone: (id: string, updates: Partial<Milestone>) => Promise<void>;
  onDeleteMilestone: (id: string) => Promise<void>;
  onUpdateProjectStatus: (id: string, status: Project["status"]) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

const STATUS_OPTIONS: Milestone["status"][] = ["not_started", "on_track", "at_risk", "achieved"];
const STATUS_LABELS: Record<string, string> = {
  not_started: "Offen", on_track: "On Track", at_risk: "At Risk", achieved: "Erreicht",
};
const STATUS_DOT: Record<string, string> = {
  not_started: "bg-[#333333]", on_track: "bg-[#4D9EFF]", at_risk: "bg-[#FB923C]", achieved: "bg-[#4ADE80]",
};

export function MilestonesTable({
  goals,
  onAddProject,
  onUpdateMilestone,
  onDeleteMilestone,
  onUpdateProjectStatus,
  onDeleteProject,
}: MilestonesTableProps) {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [editingProgress, setEditingProgress] = useState<string | null>(null);
  const [progressInput, setProgressInput] = useState("");
  const [addingProjectFor, setAddingProjectFor] = useState<string | null>(null);
  const [newProject, setNewProject] = useState("");

  const allMilestones = goals.flatMap((g) =>
    (g.milestones ?? []).map((m) => ({ ...m, goalTitle: g.title }))
  );

  if (allMilestones.length === 0) return null;

  async function saveProgress(m: typeof allMilestones[0]) {
    const raw = parseFloat(progressInput);
    if (isNaN(raw)) { setEditingProgress(null); return; }

    if (m.progress_type === "value" && m.target_value != null) {
      const val = Math.max(0, raw);
      const pct = Math.min(100, Math.round((val / m.target_value) * 100));
      await onUpdateMilestone(m.id, { current_value: val, progress: pct });
    } else {
      const pct = Math.min(100, Math.max(0, Math.round(raw)));
      await onUpdateMilestone(m.id, { progress: pct });
    }
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
        {allMilestones.map((m) => {
          const isExpanded = expandedMilestone === m.id;
          const projects = m.projects ?? [];
          const doneProjects = projects.filter((p) => p.status === "achieved").length;

          const progressLabel = m.progress_type === "value" && m.target_value != null
            ? `${m.current_value ?? 0} / ${m.target_value}${m.value_unit ? ` ${m.value_unit}` : ""}`
            : `${m.progress}%`;

          const editPlaceholder = m.progress_type === "value" && m.target_value != null
            ? `aktuell (${m.value_unit ?? ""})`
            : "0–100";

          const editInitial = m.progress_type === "value"
            ? String(m.current_value ?? 0)
            : String(m.progress);

          return (
            <div key={m.id}>
              <div
                className="px-5 py-4 hover:bg-[#131313] transition-colors cursor-pointer"
                onClick={() => setExpandedMilestone(isExpanded ? null : m.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[m.status]}`} />
                      <span className="text-[10px] text-[#444444]">{m.goalTitle}</span>
                    </div>
                    <p className="text-sm font-medium text-[#DDDDDD] mt-0.5">{m.title}</p>
                    {projects.length > 0 && (
                      <p className="text-[10px] text-[#444444] mt-0.5">
                        {doneProjects}/{projects.length} Projekte
                      </p>
                    )}
                  </div>

                  {/* Right: deadline, progress, status */}
                  <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
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
                          value={progressInput}
                          onChange={(e) => setProgressInput(e.target.value)}
                          onBlur={() => saveProgress(m)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveProgress(m); if (e.key === "Escape") setEditingProgress(null); }}
                          placeholder={editPlaceholder}
                          className="w-20 px-1.5 py-0.5 bg-[#0F0F0F] border border-[#2A2A2A] rounded text-xs text-[#EDEDED] text-center focus:outline-none focus:border-[#E8FF6B]/40"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingProgress(m.id); setProgressInput(editInitial); }}
                        className="flex items-center gap-1.5 group"
                      >
                        <div className="w-16 h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                          <div className="h-full bg-[#E8FF6B] rounded-full transition-all" style={{ width: `${m.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-[#444444] group-hover:text-[#888888] transition-colors tabular-nums w-auto whitespace-nowrap">
                          {progressLabel}
                        </span>
                      </button>
                    )}

                    {/* Status */}
                    <select
                      value={m.status}
                      onChange={(e) => onUpdateMilestone(m.id, { status: e.target.value as Milestone["status"] })}
                      className="bg-transparent text-[10px] text-[#555555] border-0 outline-none cursor-pointer hover:text-[#888888] transition-colors"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-[#111111] text-[#EDEDED]">{STATUS_LABELS[s]}</option>
                      ))}
                    </select>

                    {/* Delete milestone */}
                    <button
                      onClick={() => { if (confirm(`Meilenstein "${m.title}" löschen?`)) onDeleteMilestone(m.id); }}
                      className="text-[#2A2A2A] hover:text-[#F87171] transition-colors text-sm"
                      title="Meilenstein löschen"
                    >
                      ×
                    </button>

                    {/* Expand toggle */}
                    <span className="text-[#333333] text-xs">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>
              </div>

              {/* Expanded: projects */}
              {isExpanded && (
                <div className="px-5 pb-4 bg-[#0D0D0D] border-t border-[#161616]">
                  <div className="pt-3 space-y-1.5">
                    {projects.length > 0 ? (
                      projects.map((p) => (
                        <div key={p.id} className="flex items-center gap-2 group/proj">
                          <button
                            onClick={() => onUpdateProjectStatus(p.id, p.status === "achieved" ? "not_started" : "achieved")}
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              p.status === "achieved"
                                ? "bg-[#4ADE80]/20 border-[#4ADE80]/60"
                                : "border-[#2A2A2A] hover:border-[#3A3A3A]"
                            }`}
                          >
                            {p.status === "achieved" && (
                              <span className="text-[8px] text-[#4ADE80]">✓</span>
                            )}
                          </button>
                          <span className={`flex-1 text-sm transition-colors ${p.status === "achieved" ? "line-through text-[#444444]" : "text-[#AAAAAA]"}`}>
                            {p.title}
                          </span>
                          <button
                            onClick={() => onDeleteProject(p.id)}
                            className="opacity-0 group-hover/proj:opacity-100 text-[#333333] hover:text-[#F87171] transition-all text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#333333] py-1">Noch keine Projekte.</p>
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
                          className="flex-1 px-2 py-1 bg-[#111111] border border-[#2A2A2A] rounded text-xs text-[#EDEDED] placeholder:text-[#333333] focus:outline-none focus:border-[#E8FF6B]/40"
                        />
                        <button onClick={() => saveProject(m.id)} className="text-[10px] px-2 py-1 bg-[#E8FF6B] text-[#0F0F0F] rounded font-semibold">OK</button>
                        <button onClick={() => setAddingProjectFor(null)} className="text-[#555555] text-xs">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingProjectFor(m.id)}
                        className="text-[10px] text-[#333333] hover:text-[#E8FF6B] transition-colors mt-1"
                      >
                        + Projekt hinzufügen
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
