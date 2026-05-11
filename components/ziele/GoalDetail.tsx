"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/dates";
import type { Goal, Milestone, Project } from "@/lib/types";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  achieved:    { label: "Erreicht",  color: "#4ADE80", bg: "#4ADE8012" },
  on_track:    { label: "On Track",  color: "#4D9EFF", bg: "#4D9EFF12" },
  at_risk:     { label: "At Risk",   color: "#FB923C", bg: "#FB923C12" },
  not_started: { label: "Offen",     color: "#444444", bg: "#44444412" },
};

export const GOAL_ACCENTS = ["#E8FF6B", "#4D9EFF", "#4ADE80"];

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
  goal, goalIndex,
  onAddMilestone, onUpdateMilestone, onDeleteMilestone,
  onAddProject, onUpdateProjectStatus, onDeleteProject,
}: GoalDetailProps) {
  const milestones = goal.milestones ?? [];
  const accent = GOAL_ACCENTS[goalIndex % GOAL_ACCENTS.length];
  const [expandedId, setExpandedId] = useState<string | null>(
    milestones.length > 0 ? milestones[0].id : null
  );
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [mForm, setMForm] = useState({
    title: "", deadline: "",
    progressType: "percent" as Milestone["progress_type"],
    targetValue: "", valueUnit: "",
  });

  const overallProgress = milestones.length > 0
    ? Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length)
    : 0;
  const achieved = milestones.filter(m => m.status === "achieved").length;

  async function submitMilestone() {
    if (!mForm.title.trim()) return;
    await onAddMilestone(
      goal.id, mForm.title.trim(),
      mForm.deadline || undefined,
      mForm.progressType,
      mForm.progressType === "value" && mForm.targetValue ? Number(mForm.targetValue) : undefined,
      mForm.progressType === "value" && mForm.valueUnit ? mForm.valueUnit : undefined,
    );
    setMForm({ title: "", deadline: "", progressType: "percent", targetValue: "", valueUnit: "" });
    setAddingMilestone(false);
  }

  const canAddMore = milestones.length < 3;

  return (
    <section className="animate-in fade-in slide-in-from-top-2 duration-250">
      {/* Divider with goal label */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-[#141414]" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F0F0F] border border-[#1A1A1A]">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
          <span className="text-[11px] font-semibold text-[#555555] uppercase tracking-widest">{goal.title}</span>
        </div>
        <div className="h-px flex-1 bg-[#141414]" />
      </div>

      <div className="grid grid-cols-[1fr_260px] gap-5">

        {/* ── LEFT: 3 Milestone slots ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-semibold text-[#333333] uppercase tracking-[0.15em]">
              Meilensteine <span className="text-[#222222]">({milestones.length}/3)</span>
            </p>
          </div>

          {/* 3 slots */}
          {[0, 1, 2].map((slotIndex) => {
            const m = milestones[slotIndex];
            if (m) {
              return (
                <MilestoneRow
                  key={m.id}
                  milestone={m}
                  index={slotIndex}
                  accent={accent}
                  isExpanded={expandedId === m.id}
                  onToggle={() => setExpandedId(expandedId === m.id ? null : m.id)}
                  onUpdate={onUpdateMilestone}
                  onDelete={onDeleteMilestone}
                  onAddProject={onAddProject}
                  onUpdateProjectStatus={onUpdateProjectStatus}
                  onDeleteProject={onDeleteProject}
                />
              );
            }

            if (slotIndex === milestones.length) {
              if (addingMilestone) {
                return (
                  <AddMilestoneForm
                    key="add-form"
                    form={mForm}
                    onChange={setMForm}
                    onSubmit={submitMilestone}
                    onCancel={() => setAddingMilestone(false)}
                    accent={accent}
                  />
                );
              }
              return (
                <button
                  key={`empty-${slotIndex}`}
                  onClick={() => setAddingMilestone(true)}
                  className="w-full h-16 rounded-xl border border-dashed border-[#1C1C1C] hover:border-[#2A2A2A] hover:bg-[#0C0C0C] transition-all flex items-center justify-center gap-2 text-[#2A2A2A] hover:text-[#444444]"
                >
                  <span className="text-lg leading-none font-light">+</span>
                  <span className="text-xs">Meilenstein {slotIndex + 1} hinzufügen</span>
                </button>
              );
            }

            return (
              <div
                key={`locked-${slotIndex}`}
                className="w-full h-16 rounded-xl border border-[#111111] bg-[#090909] flex items-center justify-center"
              >
                <span className="text-[10px] text-[#1E1E1E]">Meilenstein {slotIndex + 1} — erst Meilenstein {slotIndex} abschließen</span>
              </div>
            );
          })}
        </div>

        {/* ── RIGHT: Summary Panel ── */}
        <div className="space-y-3">
          {/* Overall progress card */}
          <div className="bg-[#0D0D0D] border border-[#161616] rounded-2xl p-4">
            <p className="text-[10px] text-[#333333] uppercase tracking-widest mb-4">Zielfortschritt</p>

            {/* Big circle progress */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#161616" strokeWidth="5" />
                  <circle
                    cx="40" cy="40" r="32"
                    fill="none"
                    stroke={accent}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${(overallProgress / 100) * 2 * Math.PI * 32} ${2 * Math.PI * 32}`}
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold tabular-nums leading-none" style={{ color: accent }}>{overallProgress}</span>
                  <span className="text-[9px] text-[#444444] font-medium">%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-[#111111] rounded-xl py-2.5">
                <p className="text-lg font-bold text-[#EDEDED] tabular-nums">{achieved}</p>
                <p className="text-[9px] text-[#333333] uppercase tracking-wider">Erreicht</p>
              </div>
              <div className="bg-[#111111] rounded-xl py-2.5">
                <p className="text-lg font-bold text-[#EDEDED] tabular-nums">{milestones.length - achieved}</p>
                <p className="text-[9px] text-[#333333] uppercase tracking-wider">Offen</p>
              </div>
            </div>
          </div>

          {/* Milestone quick-nav */}
          {milestones.length > 0 && (
            <div className="bg-[#0D0D0D] border border-[#161616] rounded-2xl p-4 space-y-1.5">
              <p className="text-[10px] text-[#333333] uppercase tracking-widest mb-3">Navigation</p>
              {milestones.map((m, i) => {
                const cfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.not_started;
                const isActive = expandedId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setExpandedId(isActive ? null : m.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all",
                      isActive ? "bg-[#161616] border border-[#222222]" : "hover:bg-[#111111] border border-transparent"
                    )}
                  >
                    <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-bold"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-[#AAAAAA] truncate">{m.title}</p>
                      <div className="w-full h-0.5 bg-[#161616] rounded-full mt-1 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${m.progress}%`, background: cfg.color }} />
                      </div>
                    </div>
                    <span className="text-[10px] tabular-nums shrink-0" style={{ color: cfg.color }}>{m.progress}%</span>
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

/* ─────────────────────────────── AddMilestoneForm ─────────────────────────────── */
interface FormState {
  title: string; deadline: string;
  progressType: Milestone["progress_type"];
  targetValue: string; valueUnit: string;
}

function AddMilestoneForm({ form, onChange, onSubmit, onCancel, accent }: {
  form: FormState;
  onChange: (f: FormState) => void;
  onSubmit: () => void;
  onCancel: () => void;
  accent: string;
}) {
  return (
    <div className="bg-[#0D0D0D] border rounded-xl p-4 space-y-3" style={{ borderColor: `${accent}20` }}>
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent }}>Neuer Meilenstein</p>
      <input
        autoFocus
        value={form.title}
        onChange={(e) => onChange({ ...form, title: e.target.value })}
        placeholder="Was willst du erreichen?"
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg text-sm text-[#EDEDED] placeholder:text-[#2A2A2A] focus:outline-none focus:border-[#333333]"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-[#333333] mb-1 block uppercase tracking-wider">Deadline</label>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => onChange({ ...form, deadline: e.target.value })}
            className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg text-xs text-[#666666] focus:outline-none focus:border-[#333333]"
          />
        </div>
        <div>
          <label className="text-[10px] text-[#333333] mb-1 block uppercase tracking-wider">Fortschritt</label>
          <div className="flex gap-1">
            <button
              onClick={() => onChange({ ...form, progressType: "percent" })}
              className={cn("flex-1 py-2 text-[10px] rounded-lg border transition-colors font-medium", form.progressType === "percent" ? "border-[#E8FF6B]/40 text-[#E8FF6B] bg-[#E8FF6B]/8" : "border-[#1E1E1E] text-[#444444]")}
            >%</button>
            <button
              onClick={() => onChange({ ...form, progressType: "value" })}
              className={cn("flex-1 py-2 text-[10px] rounded-lg border transition-colors font-medium", form.progressType === "value" ? "border-[#E8FF6B]/40 text-[#E8FF6B] bg-[#E8FF6B]/8" : "border-[#1E1E1E] text-[#444444]")}
            >Wert</button>
          </div>
        </div>
      </div>
      {form.progressType === "value" && (
        <div className="grid grid-cols-2 gap-2">
          <input type="number" value={form.targetValue} onChange={(e) => onChange({ ...form, targetValue: e.target.value })}
            placeholder="Zielwert (80)" className="px-3 py-2 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg text-xs text-[#EDEDED] placeholder:text-[#2A2A2A] focus:outline-none" />
          <input value={form.valueUnit} onChange={(e) => onChange({ ...form, valueUnit: e.target.value })}
            placeholder="Einheit (kg, km)" className="px-3 py-2 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg text-xs text-[#EDEDED] placeholder:text-[#2A2A2A] focus:outline-none" />
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 text-xs text-[#444444] border border-[#1E1E1E] rounded-lg hover:bg-[#111111] transition-colors">Abbrechen</button>
        <button onClick={onSubmit} disabled={!form.title.trim()}
          className="flex-1 py-2 text-xs font-bold rounded-lg transition-colors disabled:opacity-30"
          style={{ background: accent, color: "#0A0A0A" }}
        >Hinzufügen</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────── MilestoneRow ─────────────────────────────── */
interface MilestoneRowProps {
  milestone: Milestone & { projects?: Project[] };
  index: number;
  accent: string;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, updates: Partial<Milestone>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddProject: (milestoneId: string, title: string) => Promise<void>;
  onUpdateProjectStatus: (id: string, status: Project["status"]) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

function MilestoneRow({ milestone: m, index, accent, isExpanded, onToggle, onUpdate, onDelete, onAddProject, onUpdateProjectStatus, onDeleteProject }: MilestoneRowProps) {
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressInput, setProgressInput] = useState("");
  const [addingProject, setAddingProject] = useState(false);
  const [newProject, setNewProject] = useState("");
  const [hovered, setHovered] = useState(false);

  const projects = m.projects ?? [];
  const cfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.not_started;
  const doneProjects = projects.filter((p) => p.status === "achieved").length;

  const progressLabel = m.progress_type === "value" && m.target_value != null
    ? `${m.current_value ?? 0}/${m.target_value}${m.value_unit ? ` ${m.value_unit}` : ""}`
    : `${m.progress}%`;

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

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200 overflow-hidden",
        isExpanded ? "border-[#222222] bg-[#0E0E0E]" : "border-[#161616] bg-[#0C0C0C] hover:border-[#1E1E1E]"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3.5 cursor-pointer" onClick={onToggle}>
        {/* Number badge */}
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {index + 1}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#DDDDDD] truncate">{m.title}</p>
          <div className="flex items-center gap-3 mt-0.5">
            {m.deadline && (
              <span className="text-[10px] text-[#333333]">{formatDate(m.deadline, "d. MMM yy")}</span>
            )}
            {projects.length > 0 && (
              <span className="text-[10px] text-[#333333]">{doneProjects}/{projects.length} Projekte</span>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Progress */}
          {editingProgress ? (
            <input
              autoFocus type="number" min={0}
              value={progressInput}
              onChange={(e) => setProgressInput(e.target.value)}
              onBlur={saveProgress}
              onKeyDown={(e) => { if (e.key === "Enter") saveProgress(); if (e.key === "Escape") setEditingProgress(false); }}
              className="w-16 px-2 py-1 bg-[#0A0A0A] border border-[#333333] rounded-lg text-[11px] text-[#EDEDED] text-center focus:outline-none"
            />
          ) : (
            <button
              onClick={() => { setEditingProgress(true); setProgressInput(m.progress_type === "value" ? String(m.current_value ?? 0) : String(m.progress)); }}
              className="flex items-center gap-2"
            >
              <div className="w-16 h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-400" style={{ width: `${m.progress}%`, background: accent }} />
              </div>
              <span className="text-[10px] text-[#444444] hover:text-[#666666] tabular-nums w-14 text-left transition-colors">{progressLabel}</span>
            </button>
          )}

          {/* Status */}
          <select
            value={m.status}
            onChange={(e) => onUpdate(m.id, { status: e.target.value as Milestone["status"] })}
            className="bg-transparent text-[10px] border-0 outline-none cursor-pointer"
            style={{ color: cfg.color }}
          >
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k} className="bg-[#111111] text-[#EDEDED]">{v.label}</option>
            ))}
          </select>

          {/* Delete */}
          <button
            onClick={() => { if (confirm(`"${m.title}" löschen?`)) onDelete(m.id); }}
            className={cn("leading-none text-base transition-all", hovered ? "text-[#2A2A2A] hover:text-[#F87171]" : "text-transparent")}
          >×</button>

          {/* Chevron */}
          <span className={cn("text-[#2A2A2A] text-[10px] transition-transform duration-200", isExpanded ? "rotate-180" : "")}>▾</span>
        </div>
      </div>

      {/* Expanded: Projects */}
      {isExpanded && (
        <div className="border-t border-[#141414] px-4 py-3.5">
          {/* 3 project slots */}
          <div className="space-y-1 mb-3">
            <p className="text-[10px] text-[#2A2A2A] uppercase tracking-wider mb-2">Projekte ({projects.length}/3)</p>
            {projects.length === 0 && !addingProject && (
              <p className="text-[11px] text-[#252525] py-2">Noch keine Projekte — füge bis zu 3 hinzu.</p>
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
          {projects.length < 3 && (
            addingProject ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  placeholder="Projekt beschreiben…"
                  onKeyDown={(e) => { if (e.key === "Enter") saveProject(); if (e.key === "Escape") setAddingProject(false); }}
                  className="flex-1 px-3 py-2 bg-[#0A0A0A] border border-[#222222] rounded-lg text-xs text-[#EDEDED] placeholder:text-[#2A2A2A] focus:outline-none focus:border-[#333333]"
                />
                <button onClick={saveProject} className="px-3 py-2 text-[10px] font-bold rounded-lg" style={{ background: accent, color: "#0A0A0A" }}>OK</button>
                <button onClick={() => setAddingProject(false)} className="text-[#333333] hover:text-[#666666] text-sm leading-none">✕</button>
              </div>
            ) : (
              <button
                onClick={() => setAddingProject(true)}
                className="flex items-center gap-1.5 text-[10px] text-[#2A2A2A] hover:text-[#555555] transition-colors"
              >
                <span className="text-sm leading-none font-light">+</span>
                <span>Projekt hinzufügen</span>
              </button>
            )
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
    <div className="flex items-center gap-3 group/proj py-1 px-1 rounded-lg hover:bg-[#111111] transition-colors">
      <button
        onClick={onToggle}
        className={cn(
          "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all",
          done ? "bg-[#4ADE80]/15 border-[#4ADE80]/40" : "border-[#222222] hover:border-[#333333]"
        )}
      >
        {done && <span className="text-[7px] text-[#4ADE80] font-bold leading-none">✓</span>}
      </button>
      <span className={cn("flex-1 text-[12px] transition-colors", done ? "text-[#333333] line-through" : "text-[#888888]")}>
        {p.title}
      </span>
      {p.due_date && !done && (
        <span className="text-[10px] text-[#2A2A2A]">{formatDate(p.due_date, "d. MMM")}</span>
      )}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover/proj:opacity-100 text-[#2A2A2A] hover:text-[#F87171] transition-all text-sm leading-none"
      >×</button>
    </div>
  );
}
