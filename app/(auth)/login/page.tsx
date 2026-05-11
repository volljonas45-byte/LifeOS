"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

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
      if (error) { setError(error.message); setLoading(false); return; }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <span className="w-8 h-8 rounded-lg bg-[#E8FF6B] flex items-center justify-center text-sm font-black text-black">L</span>
          <h1 className="font-display text-3xl font-semibold text-[#EDEDED] tracking-tight">
            LifeOS
          </h1>
        </div>
        <p className="text-[#555555] text-sm">Dein persönliches Life Operating System</p>
      </div>

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-2xl p-8">
        <h2 className="font-display text-xl font-semibold text-[#EDEDED] mb-6">
          {mode === "login" ? "Anmelden" : "Registrieren"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              required
              className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#222222] rounded-lg text-[#EDEDED] placeholder:text-[#333333] text-sm focus:outline-none focus:ring-1 focus:ring-[#E8FF6B]/40 focus:border-[#E8FF6B]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#666666] mb-1.5">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#222222] rounded-lg text-[#EDEDED] placeholder:text-[#333333] text-sm focus:outline-none focus:ring-1 focus:ring-[#E8FF6B]/40 focus:border-[#E8FF6B]/50 transition-colors"
            />
          </div>

          {error && <p className="text-sm text-[#F87171] bg-[#1A0A0A] border border-[#2A1010] rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-2.5 px-4 bg-[#E8FF6B] text-[#0F0F0F] rounded-lg text-sm font-semibold hover:bg-[#D4EB5A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Laden..." : mode === "login" ? "Anmelden" : "Account erstellen"}
          </button>
        </form>

        <p className="text-center text-xs text-[#555555] mt-5">
          {mode === "login" ? (
            <>Noch kein Account?{" "}
              <button onClick={() => { setMode("register"); setError(null); }} className="text-[#E8FF6B] hover:underline">
                Registrieren
              </button>
            </>
          ) : (
            <>Bereits registriert?{" "}
              <button onClick={() => { setMode("login"); setError(null); }} className="text-[#E8FF6B] hover:underline">
                Anmelden
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
