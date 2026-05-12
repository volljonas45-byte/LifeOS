"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Todo, TodoPriority, TodoStatus } from "@/lib/types";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchTodos = useCallback(async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (!error && data) setTodos(data as Todo[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  async function addTodo(input: {
    title: string;
    notes?: string;
    priority?: TodoPriority;
    due_date?: string | null;
    tags?: string[];
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const maxOrder = todos.length > 0 ? Math.max(...todos.map(t => t.sort_order)) : -1;
    const { data, error } = await supabase
      .from("todos")
      .insert({
        user_id: user.id,
        title: input.title,
        notes: input.notes ?? null,
        priority: input.priority ?? "medium",
        status: "open" as TodoStatus,
        due_date: input.due_date ?? null,
        tags: input.tags ?? [],
        sort_order: maxOrder + 1,
        completed_at: null,
      })
      .select()
      .single();
    if (!error && data) setTodos(prev => [data as Todo, ...prev]);
  }

  async function updateTodo(id: string, changes: Partial<Pick<Todo, "title" | "notes" | "priority" | "status" | "due_date" | "tags">>) {
    const extra: Record<string, string | null> = {};
    if (changes.status === "done") extra.completed_at = new Date().toISOString();
    else if (changes.status) extra.completed_at = null;

    const { data, error } = await supabase
      .from("todos")
      .update({ ...changes, ...extra })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) setTodos(prev => prev.map(t => t.id === id ? data as Todo : t));
  }

  async function deleteTodo(id: string) {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (!error) setTodos(prev => prev.filter(t => t.id !== id));
  }

  async function toggleStatus(id: string) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const next: TodoStatus = todo.status === "done" ? "open" : "done";
    await updateTodo(id, { status: next });
  }

  function getByStatus(status: TodoStatus) {
    return todos.filter(t => t.status === status);
  }

  const openCount = todos.filter(t => t.status !== "done").length;
  const doneCount = todos.filter(t => t.status === "done").length;

  return {
    todos, loading,
    addTodo, updateTodo, deleteTodo, toggleStatus,
    getByStatus, openCount, doneCount,
  };
}
