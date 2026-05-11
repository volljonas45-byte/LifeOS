"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddGoalModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, year: number) => Promise<void>;
}

const CURRENT_YEAR = 2026;

export function AddGoalModal({ open, onClose, onAdd }: AddGoalModalProps) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(CURRENT_YEAR);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onAdd(title.trim(), year);
      setTitle("");
      onClose();
    } catch (err: any) {
      setError("Fehler beim Speichern. Bitte nochmal versuchen.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111111] border-[#222222] max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-[#EDEDED]">Jahresziel hinzufügen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5">Ziel</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Abitur bestehen"
              required
              className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-sm text-[#EDEDED] placeholder:text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#E8FF6B]/40 focus:border-[#E8FF6B]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5">Jahr</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={2024}
              max={2030}
              className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-sm text-[#EDEDED] focus:outline-none focus:ring-1 focus:ring-[#E8FF6B]/40 focus:border-[#E8FF6B]/50"
            />
          </div>
          {error && <p className="text-xs text-[#F87171]">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-[#222222] text-sm text-[#666666] hover:bg-[#1A1A1A] transition-colors">
              Abbrechen
            </button>
            <button type="submit" disabled={loading || !title.trim()} className="flex-1 py-2 rounded-lg bg-[#E8FF6B] text-[#0F0F0F] text-sm font-semibold hover:bg-[#D4EB5A] disabled:opacity-40 transition-colors">
              {loading ? "Speichern..." : "Hinzufügen"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
