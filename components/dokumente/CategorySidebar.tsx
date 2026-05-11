"use client";

import { cn } from "@/lib/utils";

export const CATEGORIES = [
  { key: "recent",    label: "Kürzlich",     emoji: "🕐", special: true },
  { key: "inbox",     label: "Posteingang",  emoji: "📥", special: true },
  { key: "favorites", label: "Favoriten",    emoji: "⭐", special: true },
  { key: "tagebuch",  label: "Tagebuch",     emoji: "📓", special: true },
  { key: null,        label: "",             emoji: "",   special: true, divider: true },
  { key: "notiz",     label: "Notizen",      emoji: "📝" },
  { key: "schule",    label: "Schule",       emoji: "🎓" },
  { key: "arbeit",    label: "Arbeit",       emoji: "💼" },
  { key: "coding",    label: "Coding",       emoji: "💻" },
  { key: "buch",      label: "Bücher",       emoji: "📚" },
  { key: "film",      label: "Filme",        emoji: "🎬" },
  { key: "podcast",   label: "Podcasts",     emoji: "🎙️" },
  { key: "ressource", label: "Ressourcen",   emoji: "🔗" },
  { key: "sonstiges", label: "Sonstiges",    emoji: "📁" },
];

interface CategorySidebarProps {
  selected: string | null;
  onSelect: (key: string | null) => void;
}

export function CategorySidebar({ selected, onSelect }: CategorySidebarProps) {
  return (
    <aside className="w-44 shrink-0 border-r border-[#1A1A1A] bg-[#0A0A0A] py-4 min-h-full">
      <div className="px-3 space-y-0.5">
        {CATEGORIES.map((cat, i) => {
          if ((cat as any).divider) return <div key={i} className="my-2 border-t border-[#1A1A1A]" />;
          const isActive = selected === cat.key;
          return (
            <button
              key={cat.key ?? i}
              onClick={() => onSelect(cat.key)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left",
                isActive
                  ? "bg-[#1A1A1A] text-[#EDEDED] font-medium"
                  : "text-[#555555] hover:text-[#AAAAAA] hover:bg-[#141414]"
              )}
            >
              <span className="text-sm leading-none opacity-70">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
