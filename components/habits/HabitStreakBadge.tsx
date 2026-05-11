"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface HabitStreakBadgeProps {
  habitId: string;
  color?: string;
}

export function HabitStreakBadge({ habitId, color }: HabitStreakBadgeProps) {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    async function calc() {
      const supabase = createClient();
      const { data } = await supabase
        .from("habit_logs")
        .select("logged_date")
        .eq("habit_id", habitId)
        .eq("completed", true)
        .order("logged_date", { ascending: false })
        .limit(90);

      if (!data || data.length === 0) { setStreak(0); return; }

      const dates = new Set(data.map((l) => l.logged_date));
      let count = 0;
      const d = new Date();
      d.setHours(0, 0, 0, 0);

      const todayStr = d.toISOString().slice(0, 10);
      if (!dates.has(todayStr)) d.setDate(d.getDate() - 1);

      while (true) {
        const str = d.toISOString().slice(0, 10);
        if (!dates.has(str)) break;
        count++;
        d.setDate(d.getDate() - 1);
      }

      setStreak(count);
    }
    calc();
  }, [habitId]);

  if (streak === null || streak === 0) return null;

  return (
    <span className="flex items-center gap-0.5 text-xs font-bold tabular-nums" style={{ color: color ?? "#FB923C" }}>
      🔥{streak}
    </span>
  );
}
