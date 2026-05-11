"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { GoalCard } from "@/components/ziele/GoalCard";
import { GoalDetail } from "@/components/ziele/GoalDetail";
import { AddGoalModal } from "@/components/ziele/AddGoalModal";
import { useGoals } from "@/lib/hooks/useGoals";
import type { Goal } from "@/lib/types";

export default function ZielePage() {
  const {
    goals, loading,
    addGoal, updateGoal, updateGoalStatus, deleteGoal,
    addMilestone, updateMilestone, deleteMilestone,
    addProject, updateProjectStatus, deleteProject,
  } = useGoals();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const activeGoal = selectedGoal
    ? goals.find((g) => g.id === selectedGoal.id) ?? null
    : null;

  const totalMilestones = goals.flatMap(g => g.milestones ?? []);
  const achievedMilestones = totalMilestones.filter(m => m.status === "achieved").length;
  const overallProgress = totalMilestones.length > 0
    ? Math.round(totalMilestones.reduce((s, m) => s + m.progress, 0) / totalMilestones.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#080808]">
      <Topbar title="Ziele" subtitle="Jahresplanung 2026" />

      <div className="px-8 py-8 max-w-5xl mx-auto space-y-8">

        {/* ── System Header ── */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-[11px] font-semibold text-[#3A3A3A] uppercase tracking-[0.2em] mb-1">
              3 × 3 × 3 System
            </h2>
            <p className="text-[13px] text-[#555555]">
              3 Jahresziele · je 3 Meilensteine · je 3 Projekte
            </p>
          </div>

          <div className="flex items-center gap-6">
            {!loading && goals.length > 0 && (
              <>
                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-2xl font-bold text-[#EDEDED] tabular-nums leading-none">{overallProgress}</span>
                    <span className="text-sm text-[#444444]">%</span>
                  </div>
                  <p className="text-[10px] text-[#3A3A3A] mt-0.5">Gesamtfortschritt</p>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-2xl font-bold text-[#EDEDED] tabular-nums leading-none">{achievedMilestones}</span>
                    <span className="text-sm text-[#444444]">/{totalMilestones.length}</span>
                  </div>
                  <p className="text-[10px] text-[#3A3A3A] mt-0.5">Meilensteine</p>
                </div>
              </>
            )}

            {!loading && goals.length < 3 && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E8FF6B] text-[#0A0A0A] text-xs font-bold hover:bg-[#D4EB5A] transition-colors"
              >
                <span className="text-sm leading-none">+</span>
                Ziel hinzufügen
              </button>
            )}
          </div>
        </div>

        {/* ── Goal Cards: always 3 slots ── */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-52 bg-[#0F0F0F] rounded-2xl animate-pulse border border-[#161616]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {goals.map((goal, i) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={i}
                isSelected={activeGoal?.id === goal.id}
                onSelect={() => setSelectedGoal(activeGoal?.id === goal.id ? null : goal)}
                onUpdateStatus={updateGoalStatus}
                onUpdateGoal={updateGoal}
                onDeleteGoal={deleteGoal}
              />
            ))}
            {goals.length < 3 &&
              Array.from({ length: 3 - goals.length }).map((_, i) => (
                <EmptyGoalSlot
                  key={i}
                  number={goals.length + i + 1}
                  onClick={() => setModalOpen(true)}
                />
              ))}
          </div>
        )}

        {/* ── Goal Detail ── */}
        {activeGoal && (
          <GoalDetail
            goal={activeGoal}
            goalIndex={goals.findIndex(g => g.id === activeGoal.id)}
            onAddMilestone={addMilestone}
            onUpdateMilestone={updateMilestone}
            onDeleteMilestone={deleteMilestone}
            onAddProject={addProject}
            onUpdateProjectStatus={updateProjectStatus}
            onDeleteProject={deleteProject}
          />
        )}

        {/* ── No goal selected: overview ── */}
        {!activeGoal && !loading && goals.length > 0 && (
          <AllMilestonesOverview goals={goals} />
        )}

        {/* ── Empty state ── */}
        {!loading && goals.length === 0 && (
          <EmptyState onAdd={() => setModalOpen(true)} />
        )}
      </div>

      <AddGoalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addGoal}
      />
    </div>
  );
}

/* ─── Empty Goal Slot ─── */
function EmptyGoalSlot({ number, onClick }: { number: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-52 rounded-2xl border border-dashed border-[#1C1C1C] hover:border-[#2A2A2A] hover:bg-[#0C0C0C] transition-all group flex flex-col items-center justify-center gap-3 text-center"
    >
      <div className="w-10 h-10 rounded-xl border border-dashed border-[#222222] group-hover:border-[#333333] flex items-center justify-center transition-colors">
        <span className="text-[#2A2A2A] group-hover:text-[#444444] text-xl font-light leading-none transition-colors">+</span>
      </div>
      <div>
        <p className="text-[11px] text-[#2A2A2A] group-hover:text-[#404040] font-medium transition-colors">Ziel {number}</p>
        <p className="text-[10px] text-[#222222] group-hover:text-[#333333] mt-0.5 transition-colors">Klicken um hinzufügen</p>
      </div>
    </button>
  );
}

/* ─── All Milestones Overview ─── */
const GOAL_ACCENTS = ["#E8FF6B", "#4D9EFF", "#4ADE80"];

function AllMilestonesOverview({ goals }: { goals: import("@/lib/types").Goal[] }) {
  const allMilestones = goals.flatMap((g, gi) =>
    (g.milestones ?? []).map((m) => ({ ...m, goalTitle: g.title, accent: GOAL_ACCENTS[gi % 3] }))
  );

  if (allMilestones.length === 0) return null;

  return (
    <section>
      <p className="text-[11px] font-semibold text-[#333333] uppercase tracking-[0.2em] mb-4">
        Alle Meilensteine
      </p>
      <div className="space-y-2">
        {allMilestones.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-4 px-4 py-3.5 bg-[#0D0D0D] border border-[#161616] rounded-xl hover:border-[#1E1E1E] transition-colors"
          >
            <div className="w-1 h-8 rounded-full shrink-0" style={{ background: `${m.accent}30` }} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] mb-0.5" style={{ color: `${m.accent}60` }}>{m.goalTitle}</p>
              <p className="text-sm text-[#CCCCCC] font-medium truncate">{m.title}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-28 h-1 bg-[#161616] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${m.progress}%`, background: m.accent }} />
              </div>
              <span className="text-[10px] text-[#3A3A3A] w-10 text-right tabular-nums">
                {m.progress_type === "value" && m.target_value
                  ? `${m.current_value ?? 0}/${m.target_value}`
                  : `${m.progress}%`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Full Empty State ─── */
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#0F0F0F] border border-[#1A1A1A] flex items-center justify-center mb-6">
        <span className="text-2xl opacity-30">◎</span>
      </div>
      <h3 className="text-lg font-semibold text-[#444444] mb-2">Noch keine Jahresziele</h3>
      <p className="text-sm text-[#2A2A2A] mb-8 max-w-xs">
        Definiere bis zu 3 Ziele für 2026. Jedes Ziel bekommt 3 Meilensteine — dein 3×3×3-System.
      </p>
      <button
        onClick={onAdd}
        className="px-6 py-3 rounded-xl bg-[#E8FF6B] text-[#0A0A0A] text-sm font-bold hover:bg-[#D4EB5A] transition-colors"
      >
        Erstes Ziel definieren
      </button>
    </div>
  );
}
