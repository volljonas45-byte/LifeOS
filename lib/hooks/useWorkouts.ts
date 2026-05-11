"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Workout, WorkoutExercise } from "@/lib/types";

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchWorkouts = useCallback(async () => {
    const { data } = await supabase
      .from("workouts")
      .select(`*, exercises:workout_exercises(*)`)
      .order("workout_date", { ascending: false })
      .limit(50);
    if (data) setWorkouts(data);
  }, []);

  useEffect(() => {
    fetchWorkouts().finally(() => setLoading(false));
  }, [fetchWorkouts]);

  const addWorkout = useCallback(
    async (
      workout: Omit<Workout, "id" | "user_id" | "created_at" | "exercises">,
      exercises: Omit<WorkoutExercise, "id" | "workout_id">[]
    ) => {
      const { data: w } = await supabase
        .from("workouts")
        .insert(workout)
        .select()
        .single();
      if (!w) return;

      if (exercises.length > 0) {
        await supabase
          .from("workout_exercises")
          .insert(exercises.map((e, i) => ({ ...e, workout_id: w.id, sort_order: i })));
      }
      await fetchWorkouts();
    },
    [fetchWorkouts]
  );

  const deleteWorkout = useCallback(async (id: string) => {
    await supabase.from("workouts").delete().eq("id", id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return { workouts, loading, addWorkout, deleteWorkout, refetch: fetchWorkouts };
}
