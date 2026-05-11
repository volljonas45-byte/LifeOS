"use client";

import { useState, useMemo, useEffect } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { CategorySidebar } from "@/components/dokumente/CategorySidebar";
import { DocumentCard } from "@/components/dokumente/DocumentCard";
import { NewDocumentModal } from "@/components/dokumente/NewDocumentModal";
import { Folder } from "@/components/ui/folder-components";
import { useDocuments } from "@/lib/hooks/useDocuments";

const STORAGE_KEY_DEFAULTS = "lifeos-doc-categories-defaults";

const FIXED_FOLDERS: { key: string; label: string; color: "blue" | "black" | "grey" | "yellow" | "orange" | "red" }[] = [
  { key: "inbox",     label: "Posteingang", color: "blue" },
  { key: "favorites", label: "Favoriten",   color: "yellow" },
  { key: "tagebuch",  label: "Tagebuch",    color: "orange" },
];

const CATEGORY_COLORS: ("blue" | "grey" | "yellow" | "orange" | "red" | "black")[] = [
  "grey", "blue", "orange", "red", "yellow", "black", "grey", "orange", "blue",
];

export default function DokumentePage() {
  const [selected, setSelected] = useState<string | null>("recent");
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [customCategories, setCustomCategories] = useState<{ key: string; label: string }[]>([]);

  useEffect(() => {
    setTimeout(() => setMounted(true), 40);
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DEFAULTS);
      if (stored) setCustomCategories(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const filter = selected === "inbox"
    ? { is_inbox: true }
    : selected === "favorites"
    ? { is_favorite: true }
    : selected === "tagebuch"
    ? { type: "tagebuch" as const }
    : selected === "recent" || selected === null
    ? {}
    : { category: selected };

  const { documents, loading, createDocument } = useDocuments(filter);

  const filtered = useMemo(() => {
    if (!search.trim()) return documents;
    const q = search.toLowerCase();
    return documents.filter((d) =>
      d.title.toLowerCase().includes(q) ||
      (d.content ?? "").toLowerCase().includes(q)
    );
  }, [documents, search]);

  const sectionTitle = selected === "inbox" ? "Posteingang"
    : selected === "favorites" ? "Favoriten"
    : selected === "tagebuch" ? "Tagebuch"
    : selected === "recent" ? "Kürzlich bearbeitet"
    : selected ?? "Alle Dokumente";

  const isOverview = selected === "recent";

  function handleFolderClick(key: string) {
    setSelected(key);
    setSearch("");
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#080808]">
      <Topbar title="Dokumente" subtitle="Second Brain" />
      <div className="flex flex-1">
        <CategorySidebar selected={selected} onSelect={(k) => { setSelected(k); setSearch(""); }} />

        <div className="flex-1 px-8 py-6">

          {/* ── Overview: Folder Grid ── */}
          {isOverview ? (
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#EDEDED]">Second Brain</h2>
                  <p className="text-sm text-[#444444] mt-0.5">Alle deine Kategorien auf einen Blick</p>
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-4 py-2 bg-[#E8FF6B] text-[#0F0F0F] rounded-xl text-sm font-semibold hover:bg-[#D4EB5A] transition-all active:scale-95 shadow-[0_0_20px_rgba(232,255,107,0.15)]"
                >
                  + Neu
                </button>
              </div>

              {/* Fixed folders */}
              <p className="text-[10px] font-medium text-[#333333] uppercase tracking-widest mb-4">Schnellzugriff</p>
              <div className="flex flex-wrap gap-6 mb-10">
                {FIXED_FOLDERS.map((f, i) => (
                  <button
                    key={f.key}
                    onClick={() => handleFolderClick(f.key)}
                    className="flex flex-col items-center gap-2.5 group"
                    style={{
                      opacity: mounted ? 1 : 0,
                      transform: mounted ? "translateY(0)" : "translateY(12px)",
                      transition: `opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s`,
                    }}
                  >
                    <Folder color={f.color} size="md" label={undefined} />
                    <span className="text-xs text-[#555555] group-hover:text-[#AAAAAA] transition-colors font-medium">{f.label}</span>
                  </button>
                ))}
              </div>

              {/* Custom category folders */}
              {customCategories.length > 0 && (
                <>
                  <p className="text-[10px] font-medium text-[#333333] uppercase tracking-widest mb-4">Kategorien</p>
                  <div className="flex flex-wrap gap-6">
                    {customCategories.map((cat, i) => (
                      <button
                        key={cat.key}
                        onClick={() => handleFolderClick(cat.key)}
                        className="flex flex-col items-center gap-2.5 group"
                        style={{
                          opacity: mounted ? 1 : 0,
                          transform: mounted ? "translateY(0)" : "translateY(12px)",
                          transition: `opacity 0.4s ease ${(i + FIXED_FOLDERS.length) * 0.06}s, transform 0.4s ease ${(i + FIXED_FOLDERS.length) * 0.06}s`,
                        }}
                      >
                        <Folder
                          color={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                          size="md"
                          label={undefined}
                        />
                        <span className="text-xs text-[#555555] group-hover:text-[#AAAAAA] transition-colors font-medium">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Recent docs below folders */}
              {!loading && filtered.length > 0 && (
                <div className="mt-10">
                  <p className="text-[10px] font-medium text-[#333333] uppercase tracking-widest mb-4">Zuletzt bearbeitet</p>
                  <div className="grid grid-cols-3 gap-4">
                    {filtered.slice(0, 6).map((doc) => <DocumentCard key={doc.id} doc={doc} />)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Category view ── */
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setSelected("recent")}
                  className="text-[#333333] hover:text-[#777777] transition-colors text-sm"
                >
                  ←
                </button>

                {/* Inline folder icon (sm) */}
                <Folder
                  color={
                    selected === "inbox" ? "blue" :
                    selected === "favorites" ? "yellow" :
                    selected === "tagebuch" ? "orange" :
                    CATEGORY_COLORS[(customCategories.findIndex(c => c.key === selected)) % CATEGORY_COLORS.length] ?? "grey"
                  }
                  size="sm"
                  label={undefined}
                />

                <h2 className="text-sm font-semibold text-[#777777] uppercase tracking-widest">
                  {sectionTitle}
                  {search && <span className="text-[#555555] normal-case ml-1">· "{search}"</span>}
                </h2>

                {/* Search */}
                <div className="flex-1 relative max-w-xs ml-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] text-xs">⌕</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Suchen…"
                    className="w-full pl-7 pr-3 py-1.5 bg-[#111111] border border-[#1E1E1E] rounded-lg text-xs text-[#DDDDDD] placeholder:text-[#444444] focus:outline-none focus:border-[#2A2A2A]"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#AAAAAA]">×</button>
                  )}
                </div>

                <button
                  onClick={() => setModalOpen(true)}
                  className="ml-auto px-3.5 py-1.5 bg-[#E8FF6B] text-[#0F0F0F] rounded-lg text-xs font-semibold hover:bg-[#D4EB5A] transition-colors shrink-0"
                >
                  + Neu
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-3 gap-4">
                  {[1,2,3,4,5,6].map((i) => <div key={i} className="h-28 bg-[#111111] rounded-xl animate-pulse" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Folder color="grey" size="lg" />
                  <p className="text-[#555555] text-sm mt-6 mb-1">
                    {search ? `Keine Treffer für "${search}".` : "Noch nichts in dieser Kategorie."}
                  </p>
                  {!search && (
                    <button onClick={() => setModalOpen(true)} className="mt-4 px-4 py-2 bg-[#E8FF6B] text-[#0F0F0F] rounded-lg text-xs font-semibold hover:bg-[#D4EB5A] transition-colors">
                      Erstes Dokument erstellen
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {filtered.map((doc) => <DocumentCard key={doc.id} doc={doc} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <NewDocumentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={createDocument}
      />
    </div>
  );
}
