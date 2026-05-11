"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Goal, Milestone, Project } from "@/lib/types";

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchGoals = useCallback(async () => {
    const { data } = await supabase
      .from("goals")
      .select(`*, milestones(*, projects(*))`)
      .order("sort_order");
    if (data) setGoals(data);
  }, []);

  useEffect(() => {
    fetchGoals().finally(() => setLoading(false));
  }, [fetchGoals]);

  const addGoal = useCallback(async (title: string, year: number) => {
    const { data } = await supabase
      .from("goals")
      .insert({ title, year, status: "on_track", sort_order: goals.length })
      .select()
      .single();
    if (data) setGoals((prev) => [...prev, { ...data, milestones: [] }]);
  }, [goals.length]);

  const updateGoalStatus = useCallback(async (id: string, status: Goal["status"]) => {
    await supabase.from("goals").update({ status }).eq("id", id);
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, status } : g)));
  }, []);

  const addMilestone = useCallback(async (goalId: string, title: string, deadline?: string) => {
    const { data } = await supabase
      .from("milestones")
      .insert({ goal_id: goalId, title, deadline: deadline || null, status: "not_started", progress: 0, sort_order: 0 })
      .select()
      .single();
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

  const updateMilestoneProgress = useCallback(async (id: string, progress: number) => {
    await supabase.from("milestones").update({ progress }).eq("id", id);
    setGoals((prev) =>
      prev.map((g) => ({
        ...g,
        milestones: (g.milestones || []).map((m) =>
          m.id === id ? { ...m, progress } : m
        ),
      }))
    );
  }, []);

  const updateMilestoneStatus = useCallback(async (id: string, status: Milestone["status"]) => {
    await supabase.from("milestones").update({ status }).eq("id", id);
    setGoals((prev) =>
      prev.map((g) => ({
        ...g,
        milestones: (g.milestones || []).map((m) =>
          m.id === id ? { ...m, status } : m
        ),
      }))
    );
  }, []);

  const addProject = useCallback(async (milestoneId: string, title: string) => {
    const { data } = await supabase
      .from("projects")
      .insert({ milestone_id: milestoneId, title, status: "not_started", sort_order: 0 })
      .select()
      .single();
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
    await supabase.from("projects").update({ status }).eq("id", id);
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

  return {
    goals,
    loading,
    addGoal,
    updateGoalStatus,
    addMilestone,
    updateMilestoneProgress,
    updateMilestoneStatus,
    addProject,
    updateProjectStatus,
    refetch: fetchGoals,
  };
}
