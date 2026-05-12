"use client";

import { useState, useEffect } from "react";
import { useTodos } from "@/lib/hooks/useTodos";
import type { Todo, TodoPriority, TodoStatus } from "@/lib/types";

const PRIORITY_COLORS: Record<TodoPriority, string> = {
  high: "#FF6B6B",
  medium: "#E8FF6B",
  low: "#4D9EFF",
};

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  high: "Hoch",
  medium: "Mittel",
  low: "Niedrig",
};

const STATUS_LABELS: Record<TodoStatus, string> = {
  open: "Offen",
  in_progress: "In Bearbeitung",
  done: "Erledigt",
};

const TABS: { key: "all" | TodoStatus; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "open", label: "Offen" },
  { key: "in_progress", label: "In Bearbeitung" },
  { key: "done", label: "Erledigt" },
];

/* ─── Add-Todo Modal ─── */
function AddTodoModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (input: { title: string; notes?: string; priority?: TodoPriority; due_date?: string | null }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onAdd({ title: title.trim(), notes: notes.trim() || undefined, priority, due_date: dueDate || null });
    setSaving(false);
    setTitle(""); setNotes(""); setPriority("medium"); setDueDate("");
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-[#EDEDED]">Neue Aufgabe</h2>
          <button onClick={onClose} className="text-[#444444] hover:text-[#888888] transition-colors text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-[#444444] uppercase tracking-widest mb-1.5">Titel *</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Was muss erledigt werden?"
              className="w-full bg-[#111111] border border-[#1E1E1E] rounded-xl px-4 py-3 text-sm text-[#EDEDED] placeholder-[#333333] focus:outline-none focus:border-[#E8FF6B44] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#444444] uppercase tracking-widest mb-1.5">Notizen</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optionale Details..."
              rows={3}
              className="w-full bg-[#111111] border border-[#1E1E1E] rounded-xl px-4 py-3 text-sm text-[#EDEDED] placeholder-[#333333] focus:outline-none focus:border-[#E8FF6B44] transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#444444] uppercase tracking-widest mb-1.5">Priorität</label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as TodoPriority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className="flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all"
                    style={{
                      background: priority === p ? PRIORITY_COLORS[p] + "20" : "#111111",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: priority === p ? PRIORITY_COLORS[p] + "60" : "#1E1E1E",
                      color: priority === p ? PRIORITY_COLORS[p] : "#444444",
                    }}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#444444] uppercase tracking-widest mb-1.5">Fällig am</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-[#111111] border border-[#1E1E1E] rounded-xl px-3 py-2.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#E8FF6B44] transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#555555] border border-[#1E1E1E] hover:bg-[#111111] transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-[#0A0A0A] transition-all disabled:opacity-40"
              style={{ background: "#E8FF6B", boxShadow: title.trim() ? "0 0 20px rgba(232,255,107,0.2)" : "none" }}
            >
              {saving ? "Speichern..." : "Hinzufügen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Todo Card ─── */
function TodoCard({
  todo,
  onToggle,
  onDelete,
  onStatusChange,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TodoStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isDone = todo.status === "done";
  const isOverdue = todo.due_date && !isDone && todo.due_date < new Date().toISOString().slice(0, 10);
  const accent = PRIORITY_COLORS[todo.priority];

  return (
    <div
      className="group relative rounded-2xl border transition-all duration-200"
      style={{
        background: "#0C0C0C",
        borderColor: isDone ? "#141414" : expanded ? accent + "22" : "#161616",
        opacity: isDone ? 0.55 : 1,
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(todo.id)}
          className="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{
            borderColor: isDone ? "#4ADE80" : accent + "80",
            background: isDone ? "#4ADE80" : "transparent",
            boxShadow: isDone ? "0 0 8px rgba(74,222,128,0.3)" : "none",
          }}
        >
          {isDone && (
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => setExpanded(e => !e)}>
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-sm font-medium leading-snug"
              style={{
                color: isDone ? "#444444" : "#CCCCCC",
                textDecoration: isDone ? "line-through" : "none",
              }}
            >
              {todo.title}
            </p>

            {/* Priority badge */}
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0"
              style={{ background: accent + "15", color: accent + "CC" }}
            >
              {PRIORITY_LABELS[todo.priority]}
            </span>

            {/* Overdue badge */}
            {isOverdue && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#FF6B6B15] text-[#FF6B6B99] shrink-0">
                Überfällig
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1">
            {todo.due_date && (
              <span
                className="text-[10px] tabular-nums"
                style={{ color: isOverdue ? "#FF6B6B80" : "#333333" }}
              >
                {new Date(todo.due_date).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
            {todo.notes && (
              <span className="text-[10px] text-[#2A2A2A]">Notiz vorhanden</span>
            )}
          </div>

          {/* Expanded notes */}
          {expanded && todo.notes && (
            <p className="mt-2 text-xs text-[#555555] leading-relaxed border-t border-[#141414] pt-2">
              {todo.notes}
            </p>
          )}
        </div>

        {/* Status selector + menu */}
        <div className="flex items-center gap-2 shrink-0">
          {!isDone && (
            <select
              value={todo.status}
              onChange={e => onStatusChange(todo.id, e.target.value as TodoStatus)}
              onClick={e => e.stopPropagation()}
              className="text-[10px] font-medium px-2 py-1 rounded-lg border transition-colors bg-[#111111] border-[#1E1E1E] text-[#555555] focus:outline-none cursor-pointer"
            >
              <option value="open">Offen</option>
              <option value="in_progress">In Arbeit</option>
              <option value="done">Erledigt</option>
            </select>
          )}

          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setShowMenu(m => !m); }}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-[#2A2A2A] hover:text-[#666666] hover:bg-[#161616] transition-all opacity-0 group-hover:opacity-100"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="3" r="1" fill="currentColor"/>
                <circle cx="7" cy="7" r="1" fill="currentColor"/>
                <circle cx="7" cy="11" r="1" fill="currentColor"/>
              </svg>
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-7 z-20 w-32 rounded-xl border border-[#1E1E1E] bg-[#111111] shadow-xl overflow-hidden"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => { onDelete(todo.id); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2.5 text-xs text-[#FF6B6B] hover:bg-[#1A1A1A] transition-colors"
                >
                  Löschen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AufgabenPage() {
  const { todos, loading, addTodo, deleteTodo, toggleStatus, updateTodo, openCount, doneCount } = useTodos();
  const [activeTab, setActiveTab] = useState<"all" | TodoStatus>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const filtered = activeTab === "all" ? todos : todos.filter(t => t.status === activeTab);
  const inProgressCount = todos.filter(t => t.status === "in_progress").length;

  const highPrio = filtered.filter(t => t.priority === "high");
  const mediumPrio = filtered.filter(t => t.priority === "medium" || t.priority === "low");

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">

      {/* ── Header ── */}
      <div
        className="px-8 pt-8 pb-6 border-b border-[#111111]"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div className="flex items-start justify-between gap-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-[#EDEDED] mb-1">Aufgaben</h1>
            <p className="text-sm text-[#3A3A3A]">
              {openCount > 0 ? `${openCount} offen` : "Alles erledigt"}
              {inProgressCount > 0 && ` · ${inProgressCount} in Arbeit`}
              {doneCount > 0 && ` · ${doneCount} erledigt`}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-stretch gap-2.5 shrink-0">
            {[
              { label: "Offen", value: todos.filter(t => t.status === "open").length, color: "#E8FF6B" },
              { label: "In Arbeit", value: inProgressCount, color: "#4D9EFF" },
              { label: "Erledigt", value: doneCount, color: "#4ADE80" },
            ].map((s, i) => (
              <div
                key={s.label}
                className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl border"
                style={{
                  background: "#0C0C0C",
                  borderColor: s.value > 0 ? s.color + "30" : "#1A1A1A",
                  minWidth: "72px",
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(6px)",
                  transition: `opacity 0.4s ease ${0.1 + i * 0.08}s, transform 0.4s ease ${0.1 + i * 0.08}s`,
                }}
              >
                <span className="text-2xl font-bold tabular-nums leading-none" style={{ color: s.value > 0 ? s.color : "#2A2A2A" }}>
                  {s.value}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider mt-1" style={{ color: "#333333" }}>
                  {s.label}
                </span>
              </div>
            ))}

            <button
              onClick={() => setModalOpen(true)}
              className="flex flex-col items-center justify-center gap-1.5 px-5 rounded-2xl font-semibold transition-all duration-200 hover:scale-[1.04] active:scale-95"
              style={{
                background: "#E8FF6B",
                minWidth: "72px",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.4s ease 0.34s, transform 0.4s ease 0.34s",
                boxShadow: "0 0 24px rgba(232,255,107,0.2)",
              }}
            >
              <span className="text-2xl font-light text-black leading-none">+</span>
              <span className="text-[10px] font-bold text-black tracking-wide">NEU</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        className="px-8 pt-5 pb-0"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.4s ease 0.2s" }}
      >
        <div className="flex items-center gap-1 border-b border-[#111111]">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 pb-3 text-sm font-medium transition-all duration-200 relative"
              style={{ color: activeTab === tab.key ? "#EDEDED" : "#444444" }}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ background: "#E8FF6B", boxShadow: "0 0 8px rgba(232,255,107,0.4)" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-8 py-7">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-14 bg-[#0E0E0E] rounded-2xl animate-pulse border border-[#141414]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-64 text-center"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] flex items-center justify-center mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-20">
                <path d="M9 11l3 3L22 4" stroke="#E8FF6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#EDEDED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[#555555] text-sm mb-1">
              {activeTab === "done" ? "Noch nichts erledigt" : "Keine Aufgaben vorhanden"}
            </p>
            <p className="text-[#2A2A2A] text-xs mb-6">
              {activeTab === "all" || activeTab === "open" ? "Füge deine erste Aufgabe hinzu" : ""}
            </p>
            {(activeTab === "all" || activeTab === "open") && (
              <button
                onClick={() => setModalOpen(true)}
                className="px-5 py-2.5 bg-[#E8FF6B] text-[#0F0F0F] rounded-xl text-sm font-semibold hover:bg-[#D4EB5A] transition-all active:scale-95 shadow-[0_0_20px_rgba(232,255,107,0.2)]"
              >
                + Erste Aufgabe anlegen
              </button>
            )}
          </div>
        ) : (
          <div
            className="space-y-6"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            {/* High priority section */}
            {highPrio.length > 0 && (
              <section>
                <p className="text-[11px] font-semibold text-[#FF6B6B60] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] inline-block" />
                  Hohe Priorität
                </p>
                <div className="space-y-2">
                  {highPrio.map(todo => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      onToggle={toggleStatus}
                      onDelete={deleteTodo}
                      onStatusChange={(id, status) => updateTodo(id, { status })}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Other tasks */}
            {mediumPrio.length > 0 && (
              <section>
                {highPrio.length > 0 && (
                  <p className="text-[11px] font-semibold text-[#333333] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#333333] inline-block" />
                    Weitere Aufgaben
                  </p>
                )}
                <div className="space-y-2">
                  {mediumPrio.map(todo => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      onToggle={toggleStatus}
                      onDelete={deleteTodo}
                      onStatusChange={(id, status) => updateTodo(id, { status })}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <AddTodoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addTodo}
      />
    </div>
  );
}
