"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Habit, HabitFrequency, HabitType } from "@/lib/types";

interface AddHabitModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (habit: Omit<Habit, "id" | "user_id" | "created_at">) => Promise<void>;
  defaultType?: HabitType;
}

const CATEGORIES = ["Sport", "Meditation", "Weiterbildung", "Gesundheit", "Finanzen", "Sonstiges"];

export function AddHabitModal({ open, onClose, onAdd, defaultType = "habit" }: AddHabitModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [type, setType] = useState<HabitType>(defaultType);

  // Sync defaultType when modal opens
  useState(() => { setType(defaultType); });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onAdd({
      name: name.trim(),
      category: category || null,
      frequency,
      type,
      target_count: 1,
      sort_order: 0,
      is_active: true,
    });
    setName("");
    setCategory("");
    setFrequency("daily");
    setType("habit");
    setLoading(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111111] border-[#222222] max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-[#EDEDED]">Habit hinzufügen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Meditation"
              required
              className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-sm text-[#EDEDED] placeholder:text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#E8FF6B]/40 focus:border-[#E8FF6B]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5">Typ</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["habit", "morning_routine", "evening_routine"] as HabitType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-1.5 rounded-lg text-xs border transition-colors ${
                    type === t
                      ? "bg-[#E8FF6B] text-[#0F0F0F] border-[#E8FF6B] font-semibold"
                      : "bg-[#0F0F0F] text-[#666666] border-[#222222] hover:border-[#333333]"
                  }`}
                >
                  {t === "habit" ? "Habit" : t === "morning_routine" ? "Morgen" : "Abend"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5">Frequenz</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(["daily", "weekly"] as HabitFrequency[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`py-1.5 rounded-lg text-xs border transition-colors ${
                    frequency === f
                      ? "bg-[#E8FF6B] text-[#0F0F0F] border-[#E8FF6B] font-semibold"
                      : "bg-[#0F0F0F] text-[#666666] border-[#222222] hover:border-[#333333]"
                  }`}
                >
                  {f === "daily" ? "Täglich" : "Wöchentlich"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5">Kategorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-sm text-[#EDEDED] focus:outline-none focus:ring-1 focus:ring-[#E8FF6B]/40 focus:border-[#E8FF6B]/50"
            >
              <option value="">Keine</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-[#222222] text-sm text-[#666666] hover:bg-[#1A1A1A] transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-2 rounded-lg bg-[#E8FF6B] text-[#0F0F0F] text-sm font-semibold hover:bg-[#D4EB5A] disabled:opacity-40 transition-colors"
            >
              {loading ? "Speichern..." : "Hinzufügen"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
