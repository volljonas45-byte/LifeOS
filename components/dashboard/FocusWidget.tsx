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

  const weekNumber = weekKey.split("-W")[1];

  return (
    <div className="bg-[#161616] border border-[#262626] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-semibold text-[#777777] uppercase tracking-widest">Fokus diese Woche</h2>
        <span className="text-[10px] text-[#444444]">KW {weekNumber}</span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center transition-colors ${
              item.trim() ? "border-[#E8FF6B]/40 bg-[#E8FF6B]/5" : "border-[#2A2A2A]"
            }`}>
              {item.trim() && <span className="w-1.5 h-1.5 rounded-full bg-[#E8FF6B]/60" />}
            </span>
            {editing === i ? (
              <input
                autoFocus
                value={item}
                onChange={(e) => handleChange(i, e.target.value)}
                onBlur={() => setEditing(null)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                placeholder={`Priorität ${i + 1}…`}
                className="flex-1 bg-transparent text-sm text-[#EDEDED] placeholder:text-[#2A2A2A] outline-none border-b border-[#E8FF6B]/30 pb-0.5"
              />
            ) : (
              <button
                onClick={() => setEditing(i)}
                className="flex-1 text-left text-sm transition-colors"
              >
                {item.trim()
                  ? <span className="text-[#DDDDDD]">{item}</span>
                  : <span className="text-[#444444] italic">Priorität {i + 1} eintragen…</span>
                }
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
