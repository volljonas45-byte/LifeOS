"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

const FEATURES = [
  { icon: "○", label: "Habit Tracking",    sub: "Tägliche & wöchentliche Habits" },
  { icon: "★", label: "Jahresplanung",      sub: "Ziele, Meilensteine, Projekte" },
  { icon: "⚡", label: "Sport Tracker",     sub: "Workouts & Übungen" },
  { icon: "≡", label: "Second Brain",      sub: "Notizen, Bücher, Ressourcen" },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError("E-Mail oder Passwort falsch."); setLoading(false); return; }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-4xl grid grid-cols-[1fr_340px] gap-16 items-center">

      {/* LEFT: Brand */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-9 h-9 rounded-xl bg-[#E8FF6B] flex items-center justify-center shrink-0">
            <span className="text-[11px] font-black text-black tracking-tighter">LOS</span>
          </div>
          <span className="font-display text-2xl font-semibold text-[#EDEDED] tracking-tight">LifeOS</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl font-semibold text-[#EDEDED] leading-[1.1] tracking-tight mb-4">
          Dein Leben.<br />
          <span className="text-[#E8FF6B]">Organisiert.</span>
        </h1>
        <p className="text-[#555555] text-base leading-relaxed mb-10 max-w-xs">
          Ein persönliches Betriebssystem für Habits, Ziele, Sport und dein Second Brain.
        </p>

        {/* Feature list */}
        <div className="space-y-3">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-xl bg-[#111111] border border-[#1E1E1E] flex items-center justify-center text-sm shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-[#CCCCCC]">{f.label}</p>
                <p className="text-xs text-[#444444]">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Form */}
      <div>
        <div className="bg-[#0E0E0E] border border-[#1A1A1A] rounded-2xl p-7">
          {/* Tab switcher */}
          <div className="flex bg-[#141414] rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode("login"); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "login" ? "bg-[#1E1E1E] text-[#EDEDED] shadow-sm" : "text-[#555555] hover:text-[#888888]"
              }`}
            >
              Anmelden
            </button>
            <button
              onClick={() => { setMode("register"); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "register" ? "bg-[#1E1E1E] text-[#EDEDED] shadow-sm" : "text-[#555555] hover:text-[#888888]"
              }`}
            >
              Registrieren
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#444444] uppercase tracking-widest mb-1.5">
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                required
                autoFocus
                className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl text-[#EDEDED] placeholder:text-[#2A2A2A] text-sm focus:outline-none focus:border-[#E8FF6B]/40 focus:ring-1 focus:ring-[#E8FF6B]/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#444444] uppercase tracking-widest mb-1.5">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl text-[#EDEDED] placeholder:text-[#2A2A2A] text-sm focus:outline-none focus:border-[#E8FF6B]/40 focus:ring-1 focus:ring-[#E8FF6B]/20 transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#1A0A0A] border border-[#2A1010] rounded-xl">
                <span className="text-[#F87171] text-xs flex-1">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 px-4 bg-[#E8FF6B] text-[#0F0F0F] rounded-xl text-sm font-semibold hover:bg-[#D4EB5A] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_24px_rgba(232,255,107,0.2)] hover:shadow-[0_0_32px_rgba(232,255,107,0.3)] mt-1"
            >
              {loading ? "Laden…" : mode === "login" ? "Anmelden →" : "Account erstellen →"}
            </button>
          </form>

          {mode === "register" && (
            <p className="text-[10px] text-[#333333] text-center mt-4 leading-relaxed">
              Mit der Registrierung akzeptierst du, dass LifeOS deine Daten speichert.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
