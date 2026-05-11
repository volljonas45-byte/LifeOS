"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getToday, formatShortDate, getWeekDays } from "@/lib/utils/dates";
import type { Habit, HabitLog } from "@/lib/types";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchHabits = useCallback(async () => {
    const { data } = await supabase
      .from("habits")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (data) setHabits(data);
  }, []);

  const fetchLogsForWeek = useCallback(async () => {
    const days = getWeekDays();
    const from = formatShortDate(days[0]);
    const to = formatShortDate(days[6]);

    const { data } = await supabase
      .from("habit_logs")
      .select("*")
      .gte("logged_date", from)
      .lte("logged_date", to);
    if (data) setLogs(data);
  }, []);

  useEffect(() => {
    Promise.all([fetchHabits(), fetchLogsForWeek()]).finally(() =>
      setLoading(false)
    );
  }, [fetchHabits, fetchLogsForWeek]);

  const toggleHabit = useCallback(
    async (habitId: string, date: string) => {
      const existing = logs.find(
        (l) => l.habit_id === habitId && l.logged_date === date
      );

      if (existing) {
        // Optimistic remove
        setLogs((prev) => prev.filter((l) => l.id !== existing.id));
        await supabase.from("habit_logs").delete().eq("id", existing.id);
      } else {
        // Optimistic add
        const tempLog: HabitLog = {
          id: crypto.randomUUID(),
          user_id: "",
          habit_id: habitId,
          logged_date: date,
          completed: true,
          created_at: new Date().toISOString(),
        };
        setLogs((prev) => [...prev, tempLog]);

        const { data: inserted } = await supabase
          .from("habit_logs")
          .upsert({ habit_id: habitId, logged_date: date, completed: true }, { onConflict: "habit_id,logged_date" })
          .select()
          .single();

        if (inserted) {
          setLogs((prev) =>
            prev.map((l) => (l.id === tempLog.id ? inserted : l))
          );
        }
      }
    },
    [logs]
  );

  const addHabit = useCallback(
    async (habit: Omit<Habit, "id" | "user_id" | "created_at">) => {
      const { data } = await supabase
        .from("habits")
        .insert(habit)
        .select()
        .single();
      if (data) setHabits((prev) => [...prev, data]);
    },
    []
  );

  const deleteHabit = useCallback(async (id: string) => {
    await supabase.from("habits").update({ is_active: false }).eq("id", id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const isCompleted = useCallback(
    (habitId: string, date: string) =>
      logs.some((l) => l.habit_id === habitId && l.logged_date === date && l.completed),
    [logs]
  );

  const todayCompletionRate = useCallback(() => {
    const today = getToday();
    const dailyHabits = habits.filter((h) => h.frequency === "daily");
    if (dailyHabits.length === 0) return 0;
    const done = dailyHabits.filter((h) => isCompleted(h.id, today)).length;
    return Math.round((done / dailyHabits.length) * 100);
  }, [habits, logs, isCompleted]);

  return {
    habits,
    logs,
    loading,
    toggleHabit,
    addHabit,
    deleteHabit,
    isCompleted,
    todayCompletionRate,
    refetch: () => Promise.all([fetchHabits(), fetchLogsForWeek()]),
  };
}
