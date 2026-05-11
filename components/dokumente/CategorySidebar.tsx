"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lifeos-doc-categories";

const FIXED_CATEGORIES = [
  { key: "recent",    label: "Kürzlich",    emoji: "🕐", special: true },
  { key: "inbox",     label: "Posteingang", emoji: "📥", special: true },
  { key: "favorites", label: "Favoriten",   emoji: "⭐", special: true },
  { key: "tagebuch",  label: "Tagebuch",    emoji: "📓", special: true },
];

const DEFAULT_CATEGORIES = [
  { key: "notiz",     label: "Notizen",   emoji: "📝" },
  { key: "schule",    label: "Schule",    emoji: "🎓" },
  { key: "arbeit",    label: "Arbeit",    emoji: "💼" },
  { key: "coding",    label: "Coding",    emoji: "💻" },
  { key: "buch",      label: "Bücher",    emoji: "📚" },
  { key: "film",      label: "Filme",     emoji: "🎬" },
  { key: "podcast",   label: "Podcasts",  emoji: "🎙️" },
  { key: "ressource", label: "Ressourcen",emoji: "🔗" },
  { key: "sonstiges", label: "Sonstiges", emoji: "📁" },
];

interface Category { key: string; label: string; emoji: string }

interface CategorySidebarProps {
  selected: string | null;
  onSelect: (key: string | null) => void;
}

export function CategorySidebar({ selected, onSelect }: CategorySidebarProps) {
  const [custom, setCustom] = useState<Category[]>([]);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCustom(JSON.parse(stored));
    } catch {}
  }, []);

  function saveCustom(cats: Category[]) {
    setCustom(cats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
  }

  function addCategory() {
    if (!newLabel.trim()) return;
    const key = newLabel.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const cat: Category = {
      key: `custom-${key}-${Date.now()}`,
      label: newLabel.trim(),
      emoji: newEmoji.trim() || "📂",
    };
    saveCustom([...custom, cat]);
    setNewLabel("");
    setNewEmoji("");
    setAdding(false);
  }

  function deleteCategory(key: string) {
    saveCustom(custom.filter((c) => c.key !== key));
    if (selected === key) onSelect("recent");
  }

  const allCategories = [...DEFAULT_CATEGORIES, ...custom];

  return (
    <aside className="w-44 shrink-0 border-r border-[#1A1A1A] bg-[#0A0A0A] py-4 min-h-full flex flex-col">
      <div className="px-3 space-y-0.5 flex-1">
        {/* Fixed special categories */}
        {FIXED_CATEGORIES.map((cat) => {
          const isActive = selected === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => onSelect(cat.key)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left",
                isActive ? "bg-[#1A1A1A] text-[#EDEDED] font-medium" : "text-[#555555] hover:text-[#AAAAAA] hover:bg-[#141414]"
              )}
            >
              <span className="text-sm leading-none">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="my-2 border-t border-[#1A1A1A]" />

        {/* All categories (default + custom) */}
        {allCategories.map((cat) => {
          const isActive = selected === cat.key;
          return (
            <div key={cat.key} className="flex items-center gap-1">
              <button
                onClick={() => onSelect(cat.key)}
                className={cn(
                  "flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left",
                  isActive ? "bg-[#1A1A1A] text-[#EDEDED] font-medium" : "text-[#555555] hover:text-[#AAAAAA] hover:bg-[#141414]"
                )}
              >
                <span className="text-sm leading-none opacity-70">{cat.emoji}</span>
                <span className="truncate">{cat.label}</span>
              </button>
              {deleteMode && custom.find((c) => c.key === cat.key) && (
                <button
                  onClick={() => deleteCategory(cat.key)}
                  className="text-[#333333] hover:text-[#F87171] transition-colors text-sm w-4 shrink-0"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}

        {/* Add category form */}
        {adding ? (
          <div className="mt-2 space-y-1.5 px-1">
            <div className="flex gap-1.5">
              <input
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                placeholder="📂"
                maxLength={2}
                className="w-10 px-2 py-1 bg-[#111111] border border-[#2A2A2A] rounded text-sm text-center focus:outline-none focus:border-[#E8FF6B]/40"
              />
              <input
                autoFocus
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Name…"
                onKeyDown={(e) => { if (e.key === "Enter") addCategory(); if (e.key === "Escape") setAdding(false); }}
                className="flex-1 px-2 py-1 bg-[#111111] border border-[#2A2A2A] rounded text-xs text-[#EDEDED] placeholder:text-[#333333] focus:outline-none focus:border-[#E8FF6B]/40"
              />
            </div>
            <div className="flex gap-1">
              <button onClick={addCategory} disabled={!newLabel.trim()}
                className="flex-1 py-1 text-[10px] bg-[#E8FF6B] text-[#0F0F0F] rounded font-semibold disabled:opacity-40">
                Hinzufügen
              </button>
              <button onClick={() => { setAdding(false); setNewLabel(""); setNewEmoji(""); }}
                className="px-2 py-1 text-[10px] text-[#555555] border border-[#222222] rounded hover:bg-[#1A1A1A]">
                ✕
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#333333] hover:text-[#666666] transition-colors mt-1"
          >
            <span>+</span>
            <span>Kategorie</span>
          </button>
        )}
      </div>

      {/* Edit/done button at bottom */}
      {custom.length > 0 && (
        <div className="px-4 pb-1 pt-2 border-t border-[#141414]">
          <button
            onClick={() => setDeleteMode((v) => !v)}
            className={`text-[10px] transition-colors ${deleteMode ? "text-[#F87171]" : "text-[#333333] hover:text-[#555555]"}`}
          >
            {deleteMode ? "Fertig" : "Bearbeiten"}
          </button>
        </div>
      )}
    </aside>
  );
}
