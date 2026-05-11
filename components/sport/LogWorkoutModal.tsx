"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getToday } from "@/lib/utils/dates";
import type { WorkoutExercise } from "@/lib/types";

interface LogWorkoutModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (
    workout: { workout_date: string; title: string | null; notes: string | null; duration_min: number | null },
    exercises: Omit<WorkoutExercise, "id" | "workout_id">[]
  ) => Promise<void>;
}

type ExerciseRow = { exercise: string; sets: string; reps: string; weight_kg: string; sort_order: number };

const inputCls = "px-2.5 py-1.5 bg-[#0A0A0A] border border-[#222222] rounded-lg text-sm text-[#EDEDED] placeholder:text-[#333333] focus:outline-none focus:border-[#E8FF6B]/40";

export function LogWorkoutModal({ open, onClose, onAdd }: LogWorkoutModalProps) {
  const [date, setDate] = useState(getToday());
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");
  const [exercises, setExercises] = useState<ExerciseRow[]>([
    { exercise: "", sets: "", reps: "", weight_kg: "", sort_order: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  function addExerciseRow() {
    setExercises((prev) => [...prev, { exercise: "", sets: "", reps: "", weight_kg: "", sort_order: prev.length }]);
  }

  function updateExercise(i: number, field: keyof ExerciseRow, value: string) {
    setExercises((prev) => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
  }

  function removeExercise(i: number) {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const validExercises = exercises
      .filter((e) => e.exercise.trim())
      .map((e, i) => ({
        exercise: e.exercise.trim(),
        sets: e.sets ? Number(e.sets) : null,
        reps: e.reps ? Number(e.reps) : null,
        weight_kg: e.weight_kg ? Number(e.weight_kg) : null,
        sort_order: i,
      }));

    await onAdd(
      { workout_date: date, title: title.trim() || null, notes: notes.trim() || null, duration_min: duration ? Number(duration) : null },
      validExercises
    );
    setTitle(""); setNotes(""); setDuration(""); setDate(getToday());
    setExercises([{ exercise: "", sets: "", reps: "", weight_kg: "", sort_order: 0 }]);
    setLoading(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111111] border-[#222222] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-[#EDEDED]">Workout loggen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#666666] mb-1.5">Datum</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className={`w-full ${inputCls}`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#666666] mb-1.5">Dauer (min)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="60"
                className={`w-full ${inputCls}`} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5">Titel</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. Push Day"
              className={`w-full ${inputCls}`} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#666666]">Übungen</label>
              <div className="grid grid-cols-[1fr_48px_48px_64px_20px] gap-2 text-[10px] text-[#444444]">
                <span />
                <span className="text-center">Sätze</span>
                <span className="text-center">Wdh</span>
                <span className="text-center">kg</span>
                <span />
              </div>
            </div>
            <div className="space-y-1.5">
              {exercises.map((ex, i) => (
                <div key={i} className="grid grid-cols-[1fr_48px_48px_64px_20px] gap-2 items-center">
                  <input value={ex.exercise} onChange={(e) => updateExercise(i, "exercise", e.target.value)}
                    placeholder="Übung" className={inputCls} />
                  <input value={ex.sets} onChange={(e) => updateExercise(i, "sets", e.target.value)}
                    placeholder="–" type="number" className={`${inputCls} text-center`} />
                  <input value={ex.reps} onChange={(e) => updateExercise(i, "reps", e.target.value)}
                    placeholder="–" type="number" className={`${inputCls} text-center`} />
                  <input value={ex.weight_kg} onChange={(e) => updateExercise(i, "weight_kg", e.target.value)}
                    placeholder="–" type="number" step="0.5" className={`${inputCls} text-center`} />
                  <button type="button" onClick={() => removeExercise(i)} className="text-[#333333] hover:text-[#888888] transition-colors text-lg leading-none">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addExerciseRow} className="mt-3 text-xs text-[#555555] hover:text-[#E8FF6B] transition-colors flex items-center gap-1">
              + Übung hinzufügen
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5">Notizen</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Wie war das Workout?" rows={2}
              className={`w-full ${inputCls} resize-none`} />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-[#222222] text-sm text-[#666666] hover:bg-[#1A1A1A] transition-colors">Abbrechen</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-[#E8FF6B] text-[#0F0F0F] text-sm font-semibold hover:bg-[#D4EB5A] disabled:opacity-40 transition-colors">
              {loading ? "Speichern..." : "Loggen"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
