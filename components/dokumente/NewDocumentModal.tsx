"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { DocumentType } from "@/lib/types";

const TYPES: { value: DocumentType; label: string; emoji: string }[] = [
  { value: "notiz",     label: "Notiz",     emoji: "📝" },
  { value: "tagebuch",  label: "Tagebuch",  emoji: "📓" },
  { value: "artikel",   label: "Artikel",   emoji: "📄" },
  { value: "buch",      label: "Buch",      emoji: "📚" },
  { value: "ressource", label: "Ressource", emoji: "🔗" },
  { value: "sonstiges", label: "Sonstiges", emoji: "📁" },
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
  const [error, setError] = useState<string | null>(null);

  function handleTypeChange(t: DocumentType) {
    setType(t);
    if (t === "tagebuch" && !title.trim()) {
      const d = new Date();
      setTitle(d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    }
  }

  function reset() {
    setTitle("");
    setType("notiz");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const doc = await onCreate({ title: title.trim(), type });
      if (!doc?.id) {
        setError("Dokument konnte nicht erstellt werden. Bist du eingeloggt?");
        setLoading(false);
        return;
      }
      reset();
      onClose();
      router.push(`/dokumente/${doc.id}`);
    } catch (err) {
      setError("Ein unbekannter Fehler ist aufgetreten.");
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#111111] border-[#222222] max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-[#EDEDED]">Neues Dokument</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5">Titel</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titel eingeben..."
              required
              className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-sm text-[#EDEDED] placeholder:text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#E8FF6B]/40 focus:border-[#E8FF6B]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5">Typ</label>
            <div className="grid grid-cols-3 gap-1.5">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTypeChange(t.value)}
                  className={`py-1.5 px-2 rounded-lg text-xs border transition-colors flex items-center justify-center gap-1.5 ${
                    type === t.value
                      ? "bg-[#E8FF6B] text-[#0F0F0F] border-[#E8FF6B] font-semibold"
                      : "bg-[#0F0F0F] text-[#666666] border-[#222222] hover:border-[#333333] hover:text-[#AAAAAA]"
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-[#F87171] bg-[#1A0A0A] border border-[#2A1010] rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 rounded-lg border border-[#222222] text-sm text-[#666666] hover:bg-[#1A1A1A] transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 py-2 rounded-lg bg-[#E8FF6B] text-[#0F0F0F] text-sm font-semibold hover:bg-[#D4EB5A] disabled:opacity-40 transition-colors"
            >
              {loading ? "Erstellen..." : "Erstellen →"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
