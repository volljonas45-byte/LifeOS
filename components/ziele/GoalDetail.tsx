"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/dates";
import type { Goal, Milestone, Project } from "@/lib/types";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  achieved:    { label: "Erreicht",  color: "#4ADE80", bg: "#0A1A0F", border: "#1A3020" },
  on_track:    { label: "On Track",  color: "#4D9EFF", bg: "#0A1220", border: "#0F2040" },
  at_risk:     { label: "At Risk",   color: "#FB923C", bg: "#1A0F0A", border: "#2A1810" },
  not_started: { label: "Offen",     color: "#555555", bg: "#141414", border: "#222222" },
};

const GOAL_ACCENTS = ["#E8FF6B", "#4D9EFF", "#4ADE80"];

export { GOAL_ACCENTS };

interface GoalDetailProps {
  goal: Goal;
  goalIndex: number;
  onAddMilestone: (goalId: string, title: string, deadline?: string, progressType?: Milestone["progress_type"], targetValue?: number, valueUnit?: string) => Promise<void>;
  onUpdateMilestone: (id: string, updates: Partial<Milestone>) => Promise<void>;
  onDeleteMilestone: (id: string) => Promise<void>;
  onAddProject: (milestoneId: string, title: string) => Promise<void>;
  onUpdateProjectStatus: (id: string, status: Project["status"]) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

export function GoalDetail({
  goal,
  goalIndex,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  onAddProject,
  onUpdateProjectStatus,
  onDeleteProject,
}: GoalDetailProps) {
  const milestones = goal.milestones ?? [];
  const accent = GOAL_ACCENTS[goalIndex % GOAL_ACCENTS.length];

  const [expandedId, setExpandedId] = useState<string | null>(
    milestones.length > 0 ? milestones[0].id : null
  );
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [mForm, setMForm] = useState({ title: "", deadline: "", progressType: "percent" as Milestone["progress_type"], targetValue: "", valueUnit: "" });

  async function submitMilestone() {
    if (!mForm.title.trim()) return;
    await onAddMilestone(
      goal.id,
      mForm.title.trim(),
      mForm.deadline || undefined,
      mForm.progressType,
      mForm.progressType === "value" && mForm.targetValue ? Number(mForm.targetValue) : undefined,
      mForm.progressType === "value" && mForm.valueUnit ? mForm.valueUnit : undefined,
    );
    setMForm({ title: "", deadline: "", progressType: "percent", targetValue: "", valueUnit: "" });
    setAddingMilestone(false);
  }

  return (
    <section className="animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-[#1A1A1A]" />
        <span className="text-[11px] font-semibold text-[#444444] uppercase tracking-[0.15em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
          {goal.title}
        </span>
        <div className="h-px flex-1 bg-[#1A1A1A]" />
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* ── LEFT: Milestones ── */}
        <div className="space-y-2">
          {milestones.length === 0 && !addingMilestone && (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#1A1A1A] rounded-2xl">
              <span className="text-3xl mb-3 opacity-20">◎</span>
              <p className="text-sm text-[#444444] mb-4">Noch keine Meilensteine</p>
              <button
                onClick={() => setAddingMilestone(true)}
                className="px-4 py-2 text-xs bg-[#E8FF6B] text-[#0F0F0F] rounded-lg font-semibold hover:bg-[#D4EB5A] transition-colors"
              >
                + Meilenstein hinzufügen
              </button>
            </div>
          )}

          {milestones.map((m, mi) => (
            <MilestoneRow
              key={m.id}
              milestone={m}
              index={mi}
              isExpanded={expandedId === m.id}
              onToggle={() => setExpandedId(expandedId === m.id ? null : m.id)}
              onUpdate={onUpdateMilestone}
              onDelete={onDeleteMilestone}
              onAddProject={onAddProject}
              onUpdateProjectStatus={onUpdateProjectStatus}
              onDeleteProject={onDeleteProject}
            />
          ))}

          {/* Add milestone form */}
          {addingMilestone ? (
            <div className="bg-[#111111] border border-[#E8FF6B]/20 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-semibold text-[#E8FF6B] uppercase tracking-widest">Neuer Meilenstein</p>
              <input
                autoFocus
                value={mForm.title}
                onChange={(e) => setMForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Titel des Meilensteins…"
                onKeyDown={(e) => e.key === "Enter" && submitMilestone()}
                className="w-full px-4 py-2.5 bg-[#0A0A0A] border border-[#222222] rounded-xl text-sm text-[#EDEDED] placeholder:text-[#333333] focus:outline-none focus:border-[#E8FF6B]/40"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#444444] mb-1 block uppercase tracking-wider">Deadline</label>
                  <input
                    type="date"
                    value={mForm.deadline}
                    onChange={(e) => setMForm((f) => ({ ...f, deadline: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#222222] rounded-xl text-sm text-[#666666] focus:outline-none focus:border-[#E8FF6B]/40"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#444444] mb-1 block uppercase tracking-wider">Fortschritt</label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setMForm((f) => ({ ...f, progressType: "percent" }))}
                      className={cn("flex-1 py-2 text-xs rounded-xl border transition-colors", mForm.progressType === "percent" ? "border-[#E8FF6B]/40 bg-[#E8FF6B]/10 text-[#E8FF6B]" : "border-[#222222] text-[#555555]")}
                    >
                      %
                    </button>
                    <button
                      onClick={() => setMForm((f) => ({ ...f, progressType: "value" }))}
                      className={cn("flex-1 py-2 text-xs rounded-xl border transition-colors", mForm.progressType === "value" ? "border-[#E8FF6B]/40 bg-[#E8FF6B]/10 text-[#E8FF6B]" : "border-[#222222] text-[#555555]")}
                    >
                      Wert
                    </button>
                  </div>
                </div>
              </div>
              {mForm.progressType === "value" && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={mForm.targetValue}
                    onChange={(e) => setMForm((f) => ({ ...f, targetValue: e.target.value }))}
                    placeholder="Zielwert (z.B. 80)"
                    className="px-3 py-2 bg-[#0A0A0A] border border-[#222222] rounded-xl text-sm text-[#EDEDED] placeholder:text-[#333333] focus:outline-none focus:border-[#E8FF6B]/40"
                  />
                  <input
                    value={mForm.valueUnit}
                    onChange={(e) => setMForm((f) => ({ ...f, valueUnit: e.target.value }))}
                    placeholder="Einheit (kg, km, …)"
                    className="px-3 py-2 bg-[#0A0A0A] border border-[#222222] rounded-xl text-sm text-[#EDEDED] placeholder:text-[#333333] focus:outline-none focus:border-[#E8FF6B]/40"
                  />
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setAddingMilestone(false)}
                  className="flex-1 py-2 text-xs text-[#555555] border border-[#222222] rounded-xl hover:bg-[#1A1A1A] transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={submitMilestone}
                  disabled={!mForm.title.trim()}
                  className="flex-1 py-2 text-xs text-[#0F0F0F] bg-[#E8FF6B] rounded-xl font-semibold hover:bg-[#D4EB5A] disabled:opacity-40 transition-colors"
                >
                  Hinzufügen
                </button>
              </div>
            </div>
          ) : (
            milestones.length > 0 && milestones.length < 3 && (
              <button
                onClick={() => setAddingMilestone(true)}
                className="w-full py-3 border border-dashed border-[#1E1E1E] rounded-2xl text-xs text-[#333333] hover:border-[#2A2A2A] hover:text-[#555555] hover:bg-[#0D0D0D] transition-all"
              >
                + Meilenstein hinzufügen
              </button>
            )
          )}
        </div>

        {/* ── RIGHT: Summary sidebar ── */}
        <div className="space-y-3">
          {/* Overall progress */}
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4">
            <p className="text-[10px] text-[#444444] uppercase tracking-widest mb-3">Gesamtfortschritt</p>
            {milestones.length > 0 ? (
              <>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-3xl font-bold text-[#EDEDED] tabular-nums leading-none">
                    {Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length)}
                  </span>
                  <span className="text-sm text-[#444444] mb-0.5">%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length)}%`, background: accent }}
                  />
                </div>
                <p className="text-[10px] text-[#444444] mt-2">
                  {milestones.filter(m => m.status === "achieved").length} von {milestones.length} erreicht
                </p>
              </>
            ) : (
              <p className="text-xs text-[#333333]">Keine Meilensteine</p>
            )}
          </div>

          {/* Milestone status list */}
          {milestones.length > 0 && (
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-4 space-y-2">
              <p className="text-[10px] text-[#444444] uppercase tracking-widest mb-3">Meilensteine</p>
              {milestones.map((m) => {
                const cfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.not_started;
                return (
                  <button
                    key={m.id}
                    onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors",
                      expandedId === m.id ? "bg-[#1A1A1A]" : "hover:bg-[#141414]"
                    )}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: cfg.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#CCCCCC] truncate">{m.title}</p>
                      <p className="text-[10px] tabular-nums" style={{ color: cfg.color }}>
                        {m.progress_type === "value" && m.target_value
                          ? `${m.current_value ?? 0} / ${m.target_value} ${m.value_unit ?? ""}`
                          : `${m.progress}%`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── MilestoneRow ─────────────────────────────── */

interface MilestoneRowProps {
  milestone: Milestone & { projects?: Project[] };
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, updates: Partial<Milestone>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddProject: (milestoneId: string, title: string) => Promise<void>;
  onUpdateProjectStatus: (id: string, status: Project["status"]) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

function MilestoneRow({
  milestone: m,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onAddProject,
  onUpdateProjectStatus,
  onDeleteProject,
}: MilestoneRowProps) {
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressInput, setProgressInput] = useState("");
  const [addingProject, setAddingProject] = useState(false);
  const [newProject, setNewProject] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  const projects = m.projects ?? [];
  const cfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.not_started;
  const doneProjects = projects.filter((p) => p.status === "achieved").length;

  async function saveProgress() {
    const raw = parseFloat(progressInput);
    if (isNaN(raw)) { setEditingProgress(false); return; }
    if (m.progress_type === "value" && m.target_value != null) {
      const val = Math.max(0, raw);
      const pct = Math.min(100, Math.round((val / m.target_value) * 100));
      await onUpdate(m.id, { current_value: val, progress: pct });
    } else {
      await onUpdate(m.id, { progress: Math.min(100, Math.max(0, Math.round(raw))) });
    }
    setEditingProgress(false);
  }

  async function saveProject() {
    if (!newProject.trim()) return;
    await onAddProject(m.id, newProject.trim());
    setNewProject("");
    setAddingProject(false);
  }

  const progressLabel = m.progress_type === "value" && m.target_value != null
    ? `${m.current_value ?? 0} / ${m.target_value}${m.value_unit ? ` ${m.value_unit}` : ""}`
    : `${m.progress}%`;

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200 overflow-hidden",
        isExpanded ? "border-[#252525] bg-[#111111]" : "border-[#1A1A1A] bg-[#0E0E0E] hover:border-[#222222]"
      )}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {/* Milestone header row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={onToggle}
      >
        {/* Index + status */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
        >
          {index + 1}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#DDDDDD] truncate">{m.title}</p>
          <div className="flex items-center gap-3 mt-0.5">
            {m.deadline && (
              <span className="text-[10px] text-[#444444]">
                {formatDate(m.deadline, "d. MMM yy")}
              </span>
            )}
            {projects.length > 0 && (
              <span className="text-[10px] text-[#444444]">
                {doneProjects}/{projects.length} Projekte
              </span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          {editingProgress ? (
            <input
              autoFocus
              type="number"
              min={0}
              value={progressInput}
              onChange={(e) => setProgressInput(e.target.value)}
              onBlur={saveProgress}
              onKeyDown={(e) => { if (e.key === "Enter") saveProgress(); if (e.key === "Escape") setEditingProgress(false); }}
              className="w-20 px-2 py-1 bg-[#0A0A0A] border border-[#E8FF6B]/30 rounded-lg text-xs text-[#EDEDED] text-center focus:outline-none"
            />
          ) : (
            <button
              onClick={() => { setEditingProgress(true); setProgressInput(m.progress_type === "value" ? String(m.current_value ?? 0) : String(m.progress)); }}
              className="flex items-center gap-2 group/prog"
            >
              <div className="w-20 h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                <div className="h-full bg-[#E8FF6B] rounded-full transition-all" style={{ width: `${m.progress}%` }} />
              </div>
              <span className="text-[10px] text-[#555555] group-hover/prog:text-[#888888] tabular-nums w-16 text-left transition-colors">
                {progressLabel}
              </span>
            </button>
          )}

          {/* Status select */}
          <select
            value={m.status}
            onChange={(e) => onUpdate(m.id, { status: e.target.value as Milestone["status"] })}
            className="bg-transparent text-[10px] border-0 outline-none cursor-pointer transition-colors"
            style={{ color: cfg.color }}
          >
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k} className="bg-[#111111] text-[#EDEDED]">{v.label}</option>
            ))}
          </select>

          {/* Delete */}
          <button
            onClick={() => { if (confirm(`"${m.title}" löschen?`)) onDelete(m.id); }}
            className={cn("text-base leading-none transition-all", showDelete ? "text-[#333333] hover:text-[#F87171]" : "text-transparent")}
          >
            ×
          </button>

          {/* Chevron */}
          <span className={cn("text-[#333333] text-xs transition-transform duration-200", isExpanded ? "rotate-180" : "")}>
            ▾
          </span>
        </div>
      </div>

      {/* Expanded: project list */}
      {isExpanded && (
        <div className="border-t border-[#1A1A1A] px-5 py-4">
          <div className="space-y-1.5 mb-3">
            {projects.length === 0 && !addingProject && (
              <p className="text-xs text-[#333333] py-1">Noch keine Projekte für diesen Meilenstein.</p>
            )}
            {projects.map((p) => (
              <ProjectRow
                key={p.id}
                project={p}
                onToggle={() => onUpdateProjectStatus(p.id, p.status === "achieved" ? "not_started" : "achieved")}
                onDelete={() => onDeleteProject(p.id)}
              />
            ))}
          </div>

          {/* Add project */}
          {addingProject ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                autoFocus
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                placeholder="Projekt-Titel…"
                onKeyDown={(e) => { if (e.key === "Enter") saveProject(); if (e.key === "Escape") setAddingProject(false); }}
                className="flex-1 px-3 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-xs text-[#EDEDED] placeholder:text-[#333333] focus:outline-none focus:border-[#E8FF6B]/40"
              />
              <button onClick={saveProject} className="px-3 py-2 text-[10px] bg-[#E8FF6B] text-[#0F0F0F] rounded-xl font-semibold">
                OK
              </button>
              <button onClick={() => setAddingProject(false)} className="text-[#555555] hover:text-[#888888] text-sm">
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingProject(true)}
              className="flex items-center gap-1.5 text-[10px] text-[#333333] hover:text-[#E8FF6B] transition-colors mt-1"
            >
              <span className="text-sm leading-none">+</span>
              <span>Projekt hinzufügen</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────── ProjectRow ─────────────────────────────── */

function ProjectRow({ project: p, onToggle, onDelete }: { project: Project; onToggle: () => void; onDelete: () => void }) {
  const done = p.status === "achieved";
  return (
    <div className="flex items-center gap-3 group/proj py-1 px-1 rounded-lg hover:bg-[#151515] transition-colors">
      <button
        onClick={onToggle}
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
          done ? "bg-[#4ADE80]/20 border-[#4ADE80]/50" : "border-[#2A2A2A] hover:border-[#3A3A3A]"
        )}
      >
        {done && <span className="text-[8px] text-[#4ADE80] font-bold">✓</span>}
      </button>
      <span className={cn(
        "flex-1 text-xs transition-colors",
        done ? "text-[#3A3A3A] line-through" : "text-[#999999]"
      )}>
        {p.title}
      </span>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover/proj:opacity-100 text-[#2A2A2A] hover:text-[#F87171] transition-all text-sm"
      >
        ×
      </button>
    </div>
  );
}
