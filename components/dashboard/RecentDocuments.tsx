"use client";

import Link from "next/link";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { formatDate } from "@/lib/utils/dates";

const TYPE_ICON: Record<string, { icon: string; color: string }> = {
  notiz:     { icon: "✎", color: "#E8FF6B" },
  tagebuch:  { icon: "◉", color: "#4D9EFF" },
  artikel:   { icon: "≡", color: "#C084FC" },
  buch:      { icon: "▣", color: "#FB923C" },
  film:      { icon: "▶", color: "#F87171" },
  podcast:   { icon: "◎", color: "#4ADE80" },
  ressource: { icon: "⬡", color: "#67E8F9" },
  sonstiges: { icon: "●", color: "#555555" },
};

export function RecentDocuments() {
  const { documents, loading } = useDocuments({});

  return (
    <div className="bg-[#0C0C0C] border border-[#161616] rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold text-[#333333] uppercase tracking-[0.18em]">Zuletzt bearbeitet</h2>
        <Link href="/dokumente" className="text-[10px] text-[#2A2A2A] hover:text-[#E8FF6B] transition-colors">
          Alle →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2 flex-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-9 bg-[#111111] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <span className="text-2xl mb-3 opacity-20">▣</span>
          <p className="text-sm text-[#444444] mb-4">Noch keine Dokumente</p>
          <Link href="/dokumente" className="px-4 py-2 bg-[#E8FF6B] text-[#0A0A0A] rounded-xl text-xs font-bold hover:bg-[#D4EB5A] transition-colors">
            Erstellen
          </Link>
        </div>
      ) : (
        <div className="space-y-0.5 flex-1">
          {documents.slice(0, 7).map((doc) => {
            const typeConfig = TYPE_ICON[doc.type] ?? TYPE_ICON.sonstiges;
            return (
              <Link
                key={doc.id}
                href={`/dokumente/${doc.id}`}
                className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[#111111] border border-transparent hover:border-[#181818] transition-all group"
              >
                <span
                  className="text-[12px] w-5 text-center shrink-0 font-mono leading-none"
                  style={{ color: typeConfig.color }}
                >
                  {typeConfig.icon}
                </span>
                <span className="flex-1 text-[13px] text-[#999999] group-hover:text-[#DDDDDD] transition-colors truncate">
                  {doc.title}
                </span>
                <span className="text-[10px] text-[#2A2A2A] shrink-0 tabular-nums">
                  {formatDate(doc.updated_at, "d. MMM")}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
