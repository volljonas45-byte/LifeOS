"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { CategorySidebar } from "@/components/dokumente/CategorySidebar";
import { DocumentCard } from "@/components/dokumente/DocumentCard";
import { NewDocumentModal } from "@/components/dokumente/NewDocumentModal";
import { useDocuments } from "@/lib/hooks/useDocuments";

export default function DokumentePage() {
  const [selected, setSelected] = useState<string | null>("recent");
  const [modalOpen, setModalOpen] = useState(false);

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

  const sectionTitle = selected === "inbox" ? "Posteingang"
    : selected === "favorites" ? "Favoriten"
    : selected === "tagebuch" ? "Tagebuch"
    : selected === "recent" ? "Kürzlich bearbeitet"
    : selected ?? "Alle Dokumente";

  return (
    <div className="flex flex-col min-h-screen bg-[#0F0F0F]">
      <Topbar title="Dokumente" subtitle="Second Brain" />
      <div className="flex flex-1">
        <CategorySidebar selected={selected} onSelect={setSelected} />

        <div className="flex-1 px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] font-semibold text-[#444444] uppercase tracking-[0.12em]">
              {sectionTitle}
            </h2>
            <button
              onClick={() => setModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#E8FF6B] text-[#0F0F0F] rounded-lg text-xs font-semibold hover:bg-[#D4EB5A] transition-colors"
            >
              + Neu
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map((i) => <div key={i} className="h-24 bg-[#1A1A1A] rounded-xl animate-pulse" />)}
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-10 text-center">
              <p className="text-[#555555] text-sm mb-4">Noch nichts hier.</p>
              <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-[#E8FF6B] text-[#0F0F0F] rounded-lg text-xs font-semibold hover:bg-[#D4EB5A] transition-colors">
                Erstes Dokument erstellen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {documents.map((doc) => <DocumentCard key={doc.id} doc={doc} />)}
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
