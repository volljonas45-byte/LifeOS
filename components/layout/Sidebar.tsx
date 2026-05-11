"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".7"/>
      </svg>
    ),
  },
  {
    href: "/habits",
    label: "Habits",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="3" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: "/ziele",
    label: "Ziele",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L9.8 6.2L14.5 6.9L11.2 10.1L12 14.8L8 12.5L4 14.8L4.8 10.1L1.5 6.9L6.2 6.2L8 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/sport",
    label: "Sport",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 8C2 8 3.5 5 8 5C12.5 5 14 8 14 8C14 8 12.5 11 8 11C3.5 11 2 8 2 8Z" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="8" cy="8" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: "/dokumente",
    label: "Dokumente",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2.5" y="1.5" width="9" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 5.5H9M5 8H10.5M5 10.5H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-[#1A1A1A] bg-[#080808] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 pt-7 pb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#E8FF6B] flex items-center justify-center shrink-0">
            <span className="text-[11px] font-black text-black tracking-tighter">LOS</span>
          </div>
          <div>
            <p className="font-display text-base font-semibold text-[#EDEDED] leading-none tracking-tight">LifeOS</p>
            <p className="text-[9px] text-[#333333] leading-none mt-0.5 tracking-widest uppercase">2026</p>
          </div>
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
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                active
                  ? "bg-[#161616] text-[#F0F0F0]"
                  : "text-[#555555] hover:text-[#AAAAAA] hover:bg-[#111111]"
              )}
            >
              <span className={cn(
                "transition-colors shrink-0",
                active ? "text-[#E8FF6B]" : "text-[#3A3A3A] group-hover:text-[#666666]"
              )}>
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
        {/* Shortcuts hint */}
        <div className="px-3 py-2 mb-1">
          <p className="text-[9px] text-[#2A2A2A] uppercase tracking-widest font-semibold">Schnellzugriff</p>
        </div>
        <Link href="/dokumente?new=1"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-[#444444] hover:text-[#888888] hover:bg-[#111111] transition-all">
          <span className="text-[#2A2A2A]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
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
      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-[#333333] hover:text-[#666666] hover:bg-[#111111] transition-all"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M5 2H2.5C2 2 1.5 2.5 1.5 3V11C1.5 11.5 2 12 2.5 12H5M9.5 9.5L12.5 7L9.5 4.5M12.5 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>Abmelden</span>
    </button>
  );
}
