"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddGoalModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, year: number) => Promise<void>;
}

const CURRENT_YEAR = 2026;

const EXAMPLES = [
  "Abitur mit 2,0 abschließen",
  "10 kg Muskelmasse aufbauen",
  "Erstes eigenes Unternehmen starten",
  "€10.000 ansparen",
  "Führerschein machen",
];

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
    } catch (err: unknown) {
      setError("Fehler beim Speichern. Bitte nochmal versuchen.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0D0D0D] border-[#1E1E1E] max-w-md p-0 overflow-hidden">
        {/* Top accent */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#E8FF6B]/50 to-transparent" />

        <div className="p-6">
          <DialogHeader className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#E8FF6B] uppercase tracking-widest">3×3×3 System</span>
            </div>
            <DialogTitle className="text-xl font-semibold text-[#EDEDED] leading-tight">
              Neues Jahresziel definieren
            </DialogTitle>
            <p className="text-[12px] text-[#444444] mt-1">
              Du kannst bis zu 3 Jahresziele setzen. Jedes Ziel bekommt bis zu 3 Meilensteine.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#444444] uppercase tracking-wider mb-2">
                Dein Ziel
              </label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Was willst du 2026 erreichen?"
                required
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl text-sm text-[#EDEDED] placeholder:text-[#2A2A2A] focus:outline-none focus:border-[#E8FF6B]/30 transition-colors"
              />

              {/* Example chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {EXAMPLES.slice(0, 3).map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setTitle(ex)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-[#111111] text-[#3A3A3A] hover:text-[#666666] hover:bg-[#161616] border border-[#1A1A1A] transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#444444] uppercase tracking-wider mb-2">
                Jahr
              </label>
              <div className="flex gap-2">
                {[2026, 2027, 2028].map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYear(y)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      year === y
                        ? "border-[#E8FF6B]/40 bg-[#E8FF6B]/8 text-[#E8FF6B]"
                        : "border-[#1E1E1E] text-[#444444] hover:border-[#2A2A2A]"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-[#F87171] bg-[#F87171]/8 border border-[#F87171]/20 px-3 py-2 rounded-lg">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#1E1E1E] text-sm text-[#555555] hover:bg-[#111111] transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#E8FF6B] text-[#0A0A0A] text-sm font-bold hover:bg-[#D4EB5A] disabled:opacity-30 transition-colors"
              >
                {loading ? "Speichern…" : "Ziel setzen →"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
