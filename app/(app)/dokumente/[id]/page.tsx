"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/dates";
import type { Document, DocumentType } from "@/lib/types";

const TYPE_LABELS: Record<DocumentType, string> = {
  notiz: "Notiz", tagebuch: "Tagebuch", artikel: "Artikel",
  buch: "Buch", film: "Film", podcast: "Podcast",
  ressource: "Ressource", sonstiges: "Sonstiges",
};

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("documents").select("*").eq("id", id).single();
      if (data) {
        setDoc(data);
        setTitle(data.title);
        setContent(data.content ?? "");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const save = useCallback(async (updates: Partial<Document>) => {
    setSaving(true);
    await supabase.from("documents").update(updates).eq("id", id);
    setDoc((prev) => prev ? { ...prev, ...updates } : prev);
    setSaving(false);
  }, [id]);

  useEffect(() => {
    if (!doc) return;
    const t = setTimeout(() => {
      if (content !== doc.content) save({ content });
    }, 1000);
    return () => clearTimeout(t);
  }, [content, doc, save]);

  async function handleTitleBlur() {
    if (doc && title !== doc.title) await save({ title });
  }

  async function toggleFavorite() {
    if (!doc) return;
    await save({ is_favorite: !doc.is_favorite });
  }

  async function handleDelete() {
    if (!confirm("Dokument wirklich löschen?")) return;
    await supabase.from("documents").delete().eq("id", id);
    router.push("/dokumente");
  }

  if (loading) return <div className="p-8 text-[#555555] text-sm">Laden...</div>;
  if (!doc) return <div className="p-8 text-[#555555] text-sm">Dokument nicht gefunden.</div>;

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Toolbar */}
      <div className="border-b border-[#1A1A1A] px-8 py-3.5 flex items-center justify-between bg-[#0A0A0A] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dokumente" className="text-[#555555] hover:text-[#AAAAAA] transition-colors text-sm">
            ← Dokumente
          </Link>
          <span className="text-[#333333]">|</span>
          <span className="text-[10px] px-2 py-0.5 bg-[#1E1E1E] text-[#888888] rounded border border-[#2A2A2A]">
            {TYPE_LABELS[doc.type]}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {saving && <span className="text-[10px] text-[#777777]">Speichern…</span>}
          <span className="text-[10px] text-[#666666]">
            {formatDate(doc.updated_at, "d. MMM yyyy, HH:mm")}
          </span>
          <button onClick={toggleFavorite} className={`text-sm transition-colors ${doc.is_favorite ? "text-[#E8FF6B]" : "text-[#555555] hover:text-[#888888]"}`}>
            {doc.is_favorite ? "⭐" : "☆"}
          </button>
          <button onClick={handleDelete} className="text-[10px] text-[#666666] hover:text-[#F87171] transition-colors">
            Löschen
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-3xl mx-auto px-8 py-12">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="w-full font-display text-4xl font-semibold text-[#EDEDED] bg-transparent border-none outline-none placeholder:text-[#444444] mb-8 leading-tight"
          placeholder="Titel..."
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Schreib hier etwas..."
          className="w-full min-h-[60vh] text-base text-[#DDDDDD] bg-transparent border-none outline-none resize-none placeholder:text-[#444444] leading-relaxed"
        />
      </div>
    </div>
  );
}
