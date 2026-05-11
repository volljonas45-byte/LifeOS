"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils/dates";
import type { Document } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  notiz: "Notiz", tagebuch: "Tagebuch", artikel: "Artikel",
  buch: "Buch", film: "Film", podcast: "Podcast",
  ressource: "Ressource", sonstiges: "Sonstiges",
};

const TYPE_ICONS: Record<string, string> = {
  notiz: "📝", tagebuch: "📓", artikel: "📄",
  buch: "📚", film: "🎬", podcast: "🎙️",
  ressource: "🔗", sonstiges: "📁",
};

export function DocumentCard({ doc }: { doc: Document }) {
  return (
    <Link
      href={`/dokumente/${doc.id}`}
      className="block bg-[#111111] border border-[#1E1E1E] rounded-xl p-4 hover:bg-[#161616] hover:border-[#2A2A2A] transition-all group"
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-lg shrink-0 opacity-60 mt-0.5">{TYPE_ICONS[doc.type] ?? "📁"}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-[#DDDDDD] group-hover:text-[#EDEDED] leading-snug line-clamp-2 transition-colors">
            {doc.title}
          </h3>
          {doc.content && (
            <p className="text-xs text-[#444444] mt-1 line-clamp-1">
              {doc.content.slice(0, 80)}
            </p>
          )}
        </div>
        {doc.is_favorite && <span className="text-xs shrink-0 opacity-60">⭐</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] px-1.5 py-0.5 bg-[#1A1A1A] text-[#555555] rounded border border-[#242424]">
          {TYPE_LABELS[doc.type] ?? doc.type}
        </span>
        {doc.category && (
          <span className="text-[10px] text-[#444444]">{doc.category}</span>
        )}
        <span className="text-[10px] text-[#333333] ml-auto">
          {formatDate(doc.updated_at, "d. MMM")}
        </span>
      </div>
    </Link>
  );
}
