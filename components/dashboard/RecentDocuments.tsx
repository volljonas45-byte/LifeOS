"use client";

import Link from "next/link";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { formatDate } from "@/lib/utils/dates";

const TYPE_EMOJI: Record<string, string> = {
  notiz: "📝", tagebuch: "📓", artikel: "📄",
  buch: "📚", film: "🎬", podcast: "🎙️",
  ressource: "🔗", sonstiges: "📁",
};

export function RecentDocuments() {
  const { documents, loading } = useDocuments({});

  return (
    <div className="bg-[#161616] border border-[#262626] rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-semibold text-[#777777] uppercase tracking-widest">Zuletzt bearbeitet</h2>
        <Link href="/dokumente" className="text-[10px] text-[#E8FF6B] hover:text-[#D4EB5A] transition-colors">Alle →</Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="h-9 bg-[#1A1A1A] rounded-lg animate-pulse" />)}
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-3xl mb-3 opacity-20">▣</span>
          <p className="text-sm text-[#555555] mb-4">Noch keine Dokumente</p>
          <Link href="/dokumente" className="px-4 py-2 bg-[#E8FF6B] text-[#0F0F0F] rounded-lg text-xs font-semibold hover:bg-[#D4EB5A] transition-colors">
            Erstellen
          </Link>
        </div>
      ) : (
        <div className="space-y-0.5">
          {documents.slice(0, 6).map((doc) => (
            <Link key={doc.id} href={`/dokumente/${doc.id}`}
              className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[#161616] transition-colors group">
              <span className="text-sm shrink-0 opacity-70">{TYPE_EMOJI[doc.type] ?? "📁"}</span>
              <span className="text-sm text-[#AAAAAA] group-hover:text-[#EDEDED] transition-colors truncate flex-1">
                {doc.title}
              </span>
              <span className="text-[10px] text-[#555555] shrink-0">
                {formatDate(doc.updated_at, "d. MMM")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
