"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "lifeos-weekly-focus";

function getWeekKey() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const wn = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${wn}`;
}

export function FocusWidget() {
  const [items, setItems] = useState(["", "", ""]);
  const [editing, setEditing] = useState<number | null>(null);
  const weekKey = getWeekKey();
  const weekNumber = weekKey.split("-W")[1];

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}-${weekKey}`);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, [weekKey]);

  function save(newItems: string[]) {
    setItems(newItems);
    localStorage.setItem(`${STORAGE_KEY}-${weekKey}`, JSON.stringify(newItems));
  }

  function handleChange(i: number, value: string) {
    const next = [...items];
    next[i] = value;
    save(next);
  }

  function handleKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key === "Enter" || e.key === "Escape") setEditing(null);
    if (e.key === "ArrowDown" && i < 2) setEditing(i + 1);
    if (e.key === "ArrowUp" && i > 0) setEditing(i - 1);
  }

  const filled = items.filter(i => i.trim()).length;

  return (
    <div className="bg-[#0E0E0E] border border-[#1A1A1A] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[10px] font-semibold text-[#333333] uppercase tracking-[0.18em]">Wochenfokus</h2>
        </div>
        <span className="text-[10px] text-[#2A2A2A] border border-[#1A1A1A] px-2 py-0.5 rounded-full">
          KW {weekNumber}
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => {
          const hasFilled = !!item.trim();
          return (
            <div key={i} className="flex items-center gap-3 group">
              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                hasFilled
                  ? "border-[#E8FF6B]/30 bg-[#E8FF6B]/8"
                  : "border-[#1E1E1E] bg-transparent"
              }`}>
                {hasFilled
                  ? <span className="text-[8px] font-bold text-[#E8FF6B]">{i + 1}</span>
                  : <span className="text-[10px] text-[#2A2A2A]">{i + 1}</span>
                }
              </div>

              {editing === i ? (
                <input
                  autoFocus
                  value={item}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onBlur={() => setEditing(null)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  placeholder={`Priorität ${i + 1}…`}
                  className="flex-1 bg-transparent text-sm text-[#EDEDED] placeholder:text-[#222222] outline-none border-b border-[#E8FF6B]/25 pb-0.5"
                />
              ) : (
                <button
                  onClick={() => setEditing(i)}
                  className="flex-1 text-left text-sm transition-colors"
                >
                  {hasFilled
                    ? <span className="text-[#CCCCCC] group-hover:text-[#EDEDED] transition-colors">{item}</span>
                    : <span className="text-[#252525] group-hover:text-[#333333] transition-colors italic">Klicken zum Eintragen…</span>
                  }
                </button>
              )}
            </div>
          );
        })}
      </div>

      {filled === 3 && (
        <div className="mt-4 pt-3 border-t border-[#141414]">
          <p className="text-[10px] text-[#333333]">Top-3 für diese Woche gesetzt ✓</p>
        </div>
      )}
    </div>
  );
}
