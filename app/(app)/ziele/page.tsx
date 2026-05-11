"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { GoalCard } from "@/components/ziele/GoalCard";
import { MilestonesTable } from "@/components/ziele/MilestonesTable";
import { AddGoalModal } from "@/components/ziele/AddGoalModal";
import { useGoals } from "@/lib/hooks/useGoals";

export default function ZielePage() {
  const { goals, loading, addGoal, updateGoalStatus, addMilestone, updateMilestoneProgress, updateMilestoneStatus, addProject } = useGoals();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Topbar title="Ziele" subtitle={`Jahresplanung ${new Date().getFullYear()}`} />
      <div className="px-8 py-8 space-y-8">

        {/* Jahresziele Grid */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold text-[#777777] uppercase tracking-widest">
              Jahresziele
            </h2>
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs text-[#777777] hover:text-[#E8FF6B] transition-colors flex items-center gap-1"
            >
              + Ziel hinzufügen
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-[#1A1A1A] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : goals.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {goals.map((goal, i) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  index={i}
                  onAddMilestone={addMilestone}
                  onUpdateStatus={updateGoalStatus}
                />
              ))}
              {goals.length < 3 &&
                Array.from({ length: 3 - goals.length }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setModalOpen(true)}
                    className="h-44 border border-dashed border-[#2A2A2A] rounded-xl text-[#555555] hover:border-[#3A3A3A] hover:text-[#777777] transition-colors text-sm"
                  >
                    + Ziel {goals.length + i + 1}
                  </button>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => setModalOpen(true)}
                  className="h-44 border border-dashed border-[#2A2A2A] rounded-xl text-[#555555] hover:border-[#3A3A3A] hover:text-[#777777] transition-colors text-sm"
                >
                  + Ziel {i}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Meilensteine */}
        <MilestonesTable
          goals={goals}
          onAddProject={addProject}
          onUpdateProgress={updateMilestoneProgress}
          onUpdateStatus={updateMilestoneStatus}
        />
      </div>

      <AddGoalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addGoal}
      />
    </div>
  );
}
