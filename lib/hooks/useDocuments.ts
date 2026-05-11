"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Document, DocumentType } from "@/lib/types";

export function useDocuments(filter?: { type?: DocumentType; category?: string; is_favorite?: boolean; is_inbox?: boolean; is_archived?: boolean }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchDocuments = useCallback(async () => {
    let query = supabase
      .from("documents")
      .select("*")
      .eq("is_archived", filter?.is_archived ?? false)
      .order("updated_at", { ascending: false });

    if (filter?.type) query = query.eq("type", filter.type);
    if (filter?.category) query = query.eq("category", filter.category);
    if (filter?.is_favorite) query = query.eq("is_favorite", true);
    if (filter?.is_inbox) query = query.eq("is_inbox", true);

    const { data } = await query;
    if (data) setDocuments(data);
  }, [filter?.type, filter?.category, filter?.is_favorite, filter?.is_inbox, filter?.is_archived]);

  useEffect(() => {
    fetchDocuments().finally(() => setLoading(false));
  }, [fetchDocuments]);

  const createDocument = useCallback(async (doc: Partial<Document>) => {
    const { data } = await supabase
      .from("documents")
      .insert({ title: "Neue Notiz", type: "notiz", ...doc })
      .select()
      .single();
    if (data) setDocuments((prev) => [data, ...prev]);
    return data;
  }, []);

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>) => {
    const { data } = await supabase
      .from("documents")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (data) setDocuments((prev) => prev.map((d) => (d.id === id ? data : d)));
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    await supabase.from("documents").delete().eq("id", id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { documents, loading, createDocument, updateDocument, deleteDocument, refetch: fetchDocuments };
}
