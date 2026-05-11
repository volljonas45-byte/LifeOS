"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { DocumentType } from "@/lib/types";

const TYPES: { value: DocumentType; label: string }[] = [
  { value: "notiz",     label: "Notiz" },
  { value: "tagebuch",  label: "Tagebuch" },
  { value: "artikel",   label: "Artikel" },
  { value: "buch",      label: "Buch" },
  { value: "ressource", label: "Ressource" },
  { value: "sonstiges", label: "Sonstiges" },
];

interface NewDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (doc: { title: string; type: DocumentType; is_inbox?: boolean }) => Promise<{ id: string } | null | undefined>;
}

export function NewDocumentModal({ open, onClose, onCreate }: NewDocumentModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocumentType>("notiz");
  const [loading, setLoading] = useState(false);

  function handleTypeChange(t: DocumentType) {
    setType(t);
    if (t === "tagebuch" && !title.trim()) {
      const d = new Date();
      setTitle(`${d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const doc = await onCreate({ title: title.trim(), type });
    setTitle("");
    setLoading(false);
    onClose();
    if (doc?.id) router.push(`/dokumente/${doc.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111111] border-[#222222] max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-[#EDEDED]">Neues Dokument</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5">Titel</label>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titel eingeben..."
              required className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-sm text-[#EDEDED] placeholder:text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#E8FF6B]/40 focus:border-[#E8FF6B]/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5">Typ</label>
            <div className="grid grid-cols-3 gap-1.5">
              {TYPES.map((t) => (
                <button key={t.value} type="button" onClick={() => handleTypeChange(t.value)}
                  className={`py-1.5 rounded-lg text-xs border transition-colors ${
                    type === t.value
                      ? "bg-[#E8FF6B] text-[#0F0F0F] border-[#E8FF6B] font-semibold"
                      : "bg-[#0F0F0F] text-[#666666] border-[#222222] hover:border-[#333333]"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-[#222222] text-sm text-[#666666] hover:bg-[#1A1A1A] transition-colors">Abbrechen</button>
            <button type="submit" disabled={loading || !title.trim()} className="flex-1 py-2 rounded-lg bg-[#E8FF6B] text-[#0F0F0F] text-sm font-semibold hover:bg-[#D4EB5A] disabled:opacity-40 transition-colors">
              {loading ? "Erstellen..." : "Erstellen"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
