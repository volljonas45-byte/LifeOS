"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/dates";
import { RichEditor } from "@/components/dokumente/RichEditor";
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
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  function handleContentChange(html: string) {
    setContent(html);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      save({ content: html });
    }, 1500);
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-[#555555] text-sm">Laden…</div>
      </div>
    );
  }
  if (!doc) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-[#555555] text-sm">Dokument nicht gefunden.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Top nav bar */}
      <div className="border-b border-[#1A1A1A] px-8 py-3.5 flex items-center justify-between bg-[#0A0A0A] sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/dokumente" className="text-[#666666] hover:text-[#AAAAAA] transition-colors text-sm">
            ← Dokumente
          </Link>
          <span className="text-[#2A2A2A]">|</span>
          <span className="text-[10px] px-2 py-0.5 bg-[#1E1E1E] text-[#888888] rounded border border-[#2A2A2A]">
            {TYPE_LABELS[doc.type]}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {saving && <span className="text-[10px] text-[#777777] animate-pulse">Speichern…</span>}
          <span className="text-[10px] text-[#555555]">
            {formatDate(doc.updated_at, "d. MMM yyyy, HH:mm")}
          </span>
          <button
            onClick={toggleFavorite}
            title={doc.is_favorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
            className={`text-base transition-colors ${doc.is_favorite ? "text-[#E8FF6B]" : "text-[#444444] hover:text-[#888888]"}`}
          >
            {doc.is_favorite ? "⭐" : "☆"}
          </button>
          <button
            onClick={handleDelete}
            className="text-[10px] text-[#555555] hover:text-[#F87171] transition-colors"
          >
            Löschen
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="max-w-3xl mx-auto px-8 py-10">
        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="Titel..."
          className="w-full font-display text-4xl font-semibold border-none outline-none mb-8 leading-tight placeholder:text-[#333333]"
          style={{ background: "transparent", color: "#EDEDED" }}
        />

        {/* Rich Editor */}
        <RichEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Schreib hier etwas… Nutze die Toolbar für Formatierung, Tabellen und Bilder."
        />
      </div>
    </div>
  );
}
