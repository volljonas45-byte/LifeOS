"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Goal, Milestone, Project } from "@/lib/types";

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchGoals = useCallback(async () => {
    const { data, error } = await supabase
      .from("goals")
      .select(`*, milestones(*, projects(*))`)
      .order("sort_order");
    if (error) console.error("fetchGoals:", error);
    if (data) setGoals(data);
  }, []);

  useEffect(() => {
    fetchGoals().finally(() => setLoading(false));
  }, [fetchGoals]);

  const addGoal = useCallback(async (title: string, year: number) => {
    const { data, error } = await supabase
      .from("goals")
      .insert({ title, year, status: "on_track", sort_order: goals.length })
      .select()
      .single();
    if (error) { console.error("addGoal error:", error); return; }
    if (data) setGoals((prev) => [...prev, { ...data, milestones: [] }]);
  }, [goals.length]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    const { error } = await supabase.from("goals").update(updates).eq("id", id);
    if (error) { console.error("updateGoal:", error); return; }
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  }, []);

  const updateGoalStatus = useCallback(async (id: string, status: Goal["status"]) => {
    await updateGoal(id, { status });
  }, [updateGoal]);

  const deleteGoal = useCallback(async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) { console.error("deleteGoal:", error); return; }
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const addMilestone = useCallback(async (
    goalId: string,
    title: string,
    deadline?: string,
    progressType: Milestone["progress_type"] = "percent",
    targetValue?: number,
    valueUnit?: string,
  ) => {
    const { data, error } = await supabase
      .from("milestones")
      .insert({
        goal_id: goalId,
        title,
        deadline: deadline || null,
        status: "not_started",
        progress: 0,
        progress_type: progressType,
        current_value: 0,
        target_value: targetValue ?? null,
        value_unit: valueUnit ?? null,
        sort_order: 0,
      })
      .select()
      .single();
    if (error) { console.error("addMilestone error:", error); return; }
    if (data) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? { ...g, milestones: [...(g.milestones || []), { ...data, projects: [] }] }
            : g
        )
      );
    }
  }, []);

  const updateMilestone = useCallback(async (id: string, updates: Partial<Milestone>) => {
    const { error } = await supabase.from("milestones").update(updates).eq("id", id);
    if (error) { console.error("updateMilestone:", error); return; }
    setGoals((prev) =>
      prev.map((g) => ({
        ...g,
        milestones: (g.milestones || []).map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
      }))
    );
  }, []);

  const updateMilestoneProgress = useCallback(async (id: string, progress: number) => {
    await updateMilestone(id, { progress });
  }, [updateMilestone]);

  const updateMilestoneStatus = useCallback(async (id: string, status: Milestone["status"]) => {
    await updateMilestone(id, { status });
  }, [updateMilestone]);

  const deleteMilestone = useCallback(async (id: string) => {
    const { error } = await supabase.from("milestones").delete().eq("id", id);
    if (error) { console.error("deleteMilestone:", error); return; }
    setGoals((prev) =>
      prev.map((g) => ({
        ...g,
        milestones: (g.milestones || []).filter((m) => m.id !== id),
      }))
    );
  }, []);

  const addProject = useCallback(async (milestoneId: string, title: string) => {
    const { data, error } = await supabase
      .from("projects")
      .insert({ milestone_id: milestoneId, title, status: "not_started", sort_order: 0 })
      .select()
      .single();
    if (error) { console.error("addProject error:", error); return; }
    if (data) {
      setGoals((prev) =>
        prev.map((g) => ({
          ...g,
          milestones: (g.milestones || []).map((m) =>
            m.id === milestoneId
              ? { ...m, projects: [...(m.projects || []), data] }
              : m
          ),
        }))
      );
    }
  }, []);

  const updateProjectStatus = useCallback(async (id: string, status: Project["status"]) => {
    const { error } = await supabase.from("projects").update({ status }).eq("id", id);
    if (error) { console.error("updateProjectStatus:", error); return; }
    setGoals((prev) =>
      prev.map((g) => ({
        ...g,
        milestones: (g.milestones || []).map((m) => ({
          ...m,
          projects: (m.projects || []).map((p) =>
            p.id === id ? { ...p, status } : p
          ),
        })),
      }))
    );
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) { console.error("deleteProject:", error); return; }
    setGoals((prev) =>
      prev.map((g) => ({
        ...g,
        milestones: (g.milestones || []).map((m) => ({
          ...m,
          projects: (m.projects || []).filter((p) => p.id !== id),
        })),
      }))
    );
  }, []);

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    updateGoalStatus,
    deleteGoal,
    addMilestone,
    updateMilestone,
    updateMilestoneProgress,
    updateMilestoneStatus,
    deleteMilestone,
    addProject,
    updateProjectStatus,
    deleteProject,
    refetch: fetchGoals,
  };
}
