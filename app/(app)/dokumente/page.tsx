"use client";

import { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { CategorySidebar } from "@/components/dokumente/CategorySidebar";
import { DocumentCard } from "@/components/dokumente/DocumentCard";
import { NewDocumentModal } from "@/components/dokumente/NewDocumentModal";
import { useDocuments } from "@/lib/hooks/useDocuments";

export default function DokumentePage() {
  const [selected, setSelected] = useState<string | null>("recent");
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

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

  return (
    <div className="flex flex-col min-h-screen bg-[#0F0F0F]">
      <Topbar title="Dokumente" subtitle="Second Brain" />
      <div className="flex flex-1">
        <CategorySidebar selected={selected} onSelect={(k) => { setSelected(k); setSearch(""); }} />

        <div className="flex-1 px-8 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xs font-semibold text-[#777777] uppercase tracking-widest shrink-0">
              {sectionTitle}
              {search && <span className="text-[#555555] normal-case ml-1">· "{search}"</span>}
            </h2>

            {/* Search */}
            <div className="flex-1 relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555] text-xs">⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Suchen…"
                className="w-full pl-7 pr-3 py-1.5 bg-[#161616] border border-[#262626] rounded-lg text-xs text-[#DDDDDD] placeholder:text-[#555555] focus:outline-none focus:border-[#333333]"
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
              {[1,2,3,4,5,6].map((i) => <div key={i} className="h-28 bg-[#1A1A1A] rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#161616] border border-[#262626] rounded-xl p-10 text-center">
              <p className="text-[#777777] text-sm mb-4">
                {search ? `Keine Treffer für "${search}".` : "Noch nichts hier."}
              </p>
              {!search && (
                <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-[#E8FF6B] text-[#0F0F0F] rounded-lg text-xs font-semibold hover:bg-[#D4EB5A] transition-colors">
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
      </div>

      <NewDocumentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={createDocument}
      />
    </div>
  );
}
