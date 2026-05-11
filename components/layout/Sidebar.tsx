"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/* ── App-icon style badges ── */
function NavIcon({ gradient, children }: { gradient: string; children: React.ReactNode }) {
  return (
    <div
      className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 shadow-sm"
      style={{ background: gradient }}
    >
      {children}
    </div>
  );
}

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <NavIcon gradient="linear-gradient(145deg,#6B8FFF,#3B5BDB)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1.2" fill="white" opacity="1"/>
          <rect x="8" y="1.5" width="4.5" height="4.5" rx="1.2" fill="white" opacity="0.5"/>
          <rect x="1.5" y="8" width="4.5" height="4.5" rx="1.2" fill="white" opacity="0.5"/>
          <rect x="8" y="8" width="4.5" height="4.5" rx="1.2" fill="white" opacity="0.8"/>
        </svg>
      </NavIcon>
    ),
  },
  {
    href: "/habits",
    label: "Habits",
    icon: (
      <NavIcon gradient="linear-gradient(145deg,#34D399,#059669)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="white" strokeWidth="1.5"/>
          <circle cx="7" cy="7" r="2.5" fill="white"/>
        </svg>
      </NavIcon>
    ),
  },
  {
    href: "/ziele",
    label: "Ziele",
    icon: (
      <NavIcon gradient="linear-gradient(145deg,#FBBF24,#D97706)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1.5L8.5 5.2L12.5 5.8L9.7 8.5L10.4 12.5L7 10.7L3.6 12.5L4.3 8.5L1.5 5.8L5.5 5.2L7 1.5Z" fill="white" opacity="0.9"/>
        </svg>
      </NavIcon>
    ),
  },
  {
    href: "/sport",
    label: "Sport",
    icon: (
      <NavIcon gradient="linear-gradient(145deg,#F87171,#DC2626)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 5H3.5L4.5 2.5L6 9L8 4L9.5 7L10.5 5H12" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </NavIcon>
    ),
  },
  {
    href: "/dokumente",
    label: "Dokumente",
    icon: (
      <NavIcon gradient="linear-gradient(145deg,#FB923C,#EA580C)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="2" y="5" width="10" height="7.5" rx="1.5" fill="white" opacity="0.3"/>
          <rect x="2" y="3.5" width="6" height="1.8" rx="0.9" fill="white" opacity="0.6"/>
          <rect x="2" y="6.5" width="6" height="1" rx="0.5" fill="white"/>
          <rect x="2" y="8.5" width="8" height="1" rx="0.5" fill="white" opacity="0.7"/>
          <rect x="2" y="10.5" width="5" height="1" rx="0.5" fill="white" opacity="0.5"/>
        </svg>
      </NavIcon>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-[#1A1A1A] bg-[#080808] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 pt-7 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#E8FF6B] flex items-center justify-center shrink-0">
            <span className="text-[13px] font-black text-black">L</span>
          </div>
          <span className="font-display text-lg font-semibold text-[#EDEDED] tracking-tight">LifeOS</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm transition-all duration-150",
                active
                  ? "bg-[#161616] text-[#F0F0F0]"
                  : "text-[#555555] hover:text-[#AAAAAA] hover:bg-[#111111]"
              )}
            >
              <span className={cn("transition-opacity shrink-0", active ? "opacity-100" : "opacity-50 group-hover:opacity-80")}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E8FF6B] shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-5 pt-3 space-y-1 border-t border-[#141414]">
        <div className="px-3 py-2 mb-1">
          <p className="text-[9px] text-[#2A2A2A] uppercase tracking-widest font-semibold">Schnellzugriff</p>
        </div>
        <Link href="/dokumente?new=1"
          className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs text-[#444444] hover:text-[#888888] hover:bg-[#111111] transition-all">
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: "linear-gradient(145deg,#A78BFA,#7C3AED)" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1.5V10.5M1.5 6H10.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span>Neue Notiz</span>
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}

function LogoutButton() {
  async function handleLogout() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs text-[#333333] hover:text-[#666666] hover:bg-[#111111] transition-all"
    >
      <div className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 opacity-40" style={{ background: "linear-gradient(145deg,#6B7280,#374151)" }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M4.5 2H2.5C2 2 1.5 2.5 1.5 3V9C1.5 9.5 2 10 2.5 10H4.5M8 8.5L11 6L8 3.5M11 6H4.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span>Abmelden</span>
    </button>
  );
}
