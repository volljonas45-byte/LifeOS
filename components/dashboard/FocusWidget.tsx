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
  const allFilled = filled === 3;

  return (
    <div className="bg-[#0C0C0C] border border-[#161616] rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[11px] font-semibold text-[#333333] uppercase tracking-[0.18em]">Wochenfokus</h2>
          {allFilled && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8FF6B]/10 text-[#E8FF6B] border border-[#E8FF6B]/20 font-medium">
              ✓ Gesetzt
            </span>
          )}
        </div>
        <span className="text-[10px] text-[#222222] bg-[#111111] border border-[#181818] px-2 py-0.5 rounded-full">
          KW {weekNumber}
        </span>
      </div>

      <div className="space-y-2 flex-1">
        {items.map((item, i) => {
          const hasFilled = !!item.trim();
          const isEditing = editing === i;

          return (
            <div
              key={i}
              onClick={() => !isEditing && setEditing(i)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all cursor-pointer group ${
                isEditing
                  ? "border-[#E8FF6B]/20 bg-[#0F0F0F]"
                  : hasFilled
                  ? "border-[#161616] hover:border-[#1E1E1E] bg-[#0A0A0A] hover:bg-[#0E0E0E]"
                  : "border-dashed border-[#141414] hover:border-[#1E1E1E] hover:bg-[#0C0C0C]"
              }`}
            >
              {/* Number badge */}
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0 transition-all ${
                  hasFilled
                    ? "bg-[#E8FF6B]/10 text-[#E8FF6B] border border-[#E8FF6B]/20"
                    : "bg-transparent text-[#252525] border border-[#1A1A1A]"
                }`}
              >
                {i + 1}
              </div>

              {/* Input / display */}
              {isEditing ? (
                <input
                  autoFocus
                  value={item}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onBlur={() => setEditing(null)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  placeholder={`Priorität ${i + 1} diese Woche…`}
                  className="flex-1 bg-transparent text-[13px] text-[#EDEDED] placeholder:text-[#222222] outline-none"
                />
              ) : (
                <span className={`flex-1 text-[13px] transition-colors ${
                  hasFilled
                    ? "text-[#BBBBBB] group-hover:text-[#DDDDDD]"
                    : "text-[#1E1E1E] group-hover:text-[#2E2E2E] italic"
                }`}>
                  {hasFilled ? item : `Priorität ${i + 1} eintragen…`}
                </span>
              )}

              {hasFilled && !isEditing && (
                <span className="text-[10px] text-[#222222] group-hover:text-[#E8FF6B] transition-colors">✎</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom hint */}
      <div className="mt-3 pt-3 border-t border-[#111111]">
        <p className="text-[10px] text-[#222222]">
          {allFilled
            ? "Top-3 Prioritäten für diese Woche gesetzt."
            : `${3 - filled} Priorität${3 - filled !== 1 ? "en" : ""} noch offen — klicken um einzutragen.`}
        </p>
      </div>
    </div>
  );
}
