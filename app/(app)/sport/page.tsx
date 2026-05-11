"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { LogWorkoutModal } from "@/components/sport/LogWorkoutModal";
import { WorkoutHeatmap } from "@/components/sport/WorkoutHeatmap";
import { useWorkouts } from "@/lib/hooks/useWorkouts";
import { formatDate } from "@/lib/utils/dates";

export default function SportPage() {
  const { workouts, loading, addWorkout, deleteWorkout } = useWorkouts();
  const [modalOpen, setModalOpen] = useState(false);

  // Stats
  const thisWeek = getThisWeekWorkouts(workouts);
  const totalVolume = workouts.slice(0, 20).reduce((sum, w) =>
    sum + (w.exercises ?? []).reduce((s, e) => s + ((e.sets ?? 0) * (e.reps ?? 0) * (e.weight_kg ?? 0)), 0), 0
  );

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Topbar title="Sport" subtitle="Workout-Log" />
      <div className="px-8 py-8 max-w-2xl">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard label="Diese Woche" value={thisWeek.length} unit="Workouts" />
          <StatCard label="Gesamt" value={workouts.length} unit="Einträge" />
          <StatCard label="Volumen (20)" value={totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}t` : "–"} />
        </div>

        {!loading && workouts.length > 0 && (
          <div className="mb-6">
            <WorkoutHeatmap workouts={workouts} />
          </div>
        )}

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[10px] font-semibold text-[#444444] uppercase tracking-[0.12em]">
            Workouts
          </h2>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-[#E8FF6B] text-[#0F0F0F] rounded-lg text-sm font-semibold hover:bg-[#D4EB5A] transition-colors"
          >
            + Workout loggen
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-[#1A1A1A] rounded-xl animate-pulse" />)}
          </div>
        ) : workouts.length === 0 ? (
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-10 text-center">
            <span className="text-4xl opacity-20 block mb-3">◈</span>
            <p className="text-[#555555] text-sm mb-4">Noch kein Workout geloggt.</p>
            <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-[#E8FF6B] text-[#0F0F0F] rounded-lg text-sm font-semibold hover:bg-[#D4EB5A] transition-colors">
              Erstes Workout loggen
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((w) => (
              <WorkoutCard key={w.id} workout={w} onDelete={deleteWorkout} />
            ))}
          </div>
        )}
      </div>

      <LogWorkoutModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={addWorkout} />
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-4">
      <p className="text-[10px] text-[#444444] uppercase tracking-[0.1em] mb-1">{label}</p>
      <p className="text-2xl font-semibold text-[#EDEDED] leading-none">{value}</p>
      {unit && <p className="text-[10px] text-[#555555] mt-1">{unit}</p>}
    </div>
  );
}

function WorkoutCard({ workout: w, onDelete }: { workout: any; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const exerciseCount = (w.exercises ?? []).length;

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#161616] transition-colors"
      >
        <div>
          <p className="text-sm font-semibold text-[#EDEDED]">{w.title || "Workout"}</p>
          <p className="text-xs text-[#555555] mt-0.5">
            {formatDate(w.workout_date, "EEEE, d. MMMM")}
            {w.duration_min && ` · ${w.duration_min} min`}
            {exerciseCount > 0 && ` · ${exerciseCount} Übungen`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm("Workout löschen?")) onDelete(w.id); }}
            className="text-[#2A2A2A] hover:text-[#F87171] transition-colors text-sm"
          >
            ×
          </button>
          <span className={`text-[#444444] text-sm transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>▾</span>
        </div>
      </button>

      {expanded && exerciseCount > 0 && (
        <div className="border-t border-[#1A1A1A] px-5 py-3">
          <div className="space-y-1.5">
            {/* Header */}
            <div className="grid grid-cols-[1fr_56px_56px_64px] gap-2 text-[9px] text-[#333333] uppercase tracking-wider pb-1">
              <span>Übung</span>
              <span className="text-center">Sätze</span>
              <span className="text-center">Wdh</span>
              <span className="text-center">kg</span>
            </div>
            {(w.exercises ?? []).map((ex: any) => (
              <div key={ex.id} className="grid grid-cols-[1fr_56px_56px_64px] gap-2 items-center">
                <span className="text-sm text-[#AAAAAA]">{ex.exercise}</span>
                <span className="text-sm text-[#666666] text-center tabular-nums">{ex.sets ?? "–"}</span>
                <span className="text-sm text-[#666666] text-center tabular-nums">{ex.reps ?? "–"}</span>
                <span className="text-sm text-[#666666] text-center tabular-nums">{ex.weight_kg ?? "–"}</span>
              </div>
            ))}
          </div>
          {w.notes && <p className="text-xs text-[#444444] mt-3 italic border-t border-[#1A1A1A] pt-3">{w.notes}</p>}
        </div>
      )}
    </div>
  );
}

function getThisWeekWorkouts(workouts: any[]) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return workouts.filter((w) => new Date(w.workout_date) >= monday);
}
