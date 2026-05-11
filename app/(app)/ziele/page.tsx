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

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Topbar title="Ziele" subtitle="Jahresplanung 2026" />

      <div className="px-8 py-8 max-w-6xl mx-auto space-y-10">

        {/* ── Goal Cards ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-semibold text-[#444444] uppercase tracking-[0.15em]">
              Jahresziele
            </span>
            {!loading && goals.length < 3 && (
              <button
                onClick={() => setModalOpen(true)}
                className="text-[11px] text-[#555555] hover:text-[#E8FF6B] transition-colors"
              >
                + Ziel hinzufügen
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-40 bg-[#111111] rounded-2xl animate-pulse" />
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
                  <button
                    key={i}
                    onClick={() => setModalOpen(true)}
                    className="h-40 border border-dashed border-[#1E1E1E] rounded-2xl text-[#333333] hover:border-[#2A2A2A] hover:text-[#555555] transition-all text-sm flex flex-col items-center justify-center gap-2"
                  >
                    <span className="text-2xl opacity-40">+</span>
                    <span className="text-xs">Ziel {goals.length + i + 1} hinzufügen</span>
                  </button>
                ))}
            </div>
          )}
        </section>

        {/* ── Goal Detail: milestones + projects ── */}
        {activeGoal && (
          <GoalDetail
            goal={activeGoal}
            onAddMilestone={addMilestone}
            onUpdateMilestone={updateMilestone}
            onDeleteMilestone={deleteMilestone}
            onAddProject={addProject}
            onUpdateProjectStatus={updateProjectStatus}
            onDeleteProject={deleteProject}
          />
        )}

        {/* ── All milestones overview when no goal selected ── */}
        {!activeGoal && !loading && goals.length > 0 && (
          <section>
            <div className="mb-4">
              <span className="text-[11px] font-semibold text-[#444444] uppercase tracking-[0.15em]">
                Alle Meilensteine
              </span>
            </div>
            <div className="space-y-2">
              {goals.flatMap((g) =>
                (g.milestones ?? []).map((m) => ({...m, goalTitle: g.title, goalId: g.id}))
              ).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-4 px-4 py-3 bg-[#111111] border border-[#1A1A1A] rounded-xl hover:border-[#222222] transition-colors"
                >
                  <MilestoneStatusDot status={m.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#444444] mb-0.5">{m.goalTitle}</p>
                    <p className="text-sm text-[#CCCCCC] font-medium truncate">{m.title}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className="h-full bg-[#E8FF6B] rounded-full" style={{ width: `${m.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-[#444444] w-8 text-right tabular-nums">
                      {m.progress_type === "value" && m.target_value
                        ? `${m.current_value ?? 0}/${m.target_value}`
                        : `${m.progress}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
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

function MilestoneStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    achieved: "bg-[#4ADE80]",
    on_track: "bg-[#4D9EFF]",
    at_risk: "bg-[#FB923C]",
    not_started: "bg-[#2A2A2A]",
  };
  return <div className={`w-2 h-2 rounded-full shrink-0 ${colors[status] ?? colors.not_started}`} />;
}
