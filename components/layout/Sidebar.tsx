"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard",  icon: "⌂" },
  { href: "/habits",    label: "Habits",     icon: "○" },
  { href: "/ziele",     label: "Ziele",      icon: "◎" },
  { href: "/sport",     label: "Sport",      icon: "◈" },
  { href: "/dokumente", label: "Dokumente",  icon: "≡" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 shrink-0 border-r border-[#1E1E1E] bg-[#0A0A0A] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#E8FF6B] flex items-center justify-center text-[10px] font-black text-black">L</span>
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
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                active
                  ? "bg-[#1A1A1A] text-[#EDEDED] font-medium"
                  : "text-[#555555] hover:text-[#AAAAAA] hover:bg-[#141414]"
              )}
            >
              <span className={cn(
                "text-sm leading-none w-4 text-center",
                active ? "text-[#E8FF6B]" : "text-[#444444]"
              )}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {active && <span className="ml-auto w-1 h-1 rounded-full bg-[#E8FF6B]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 pt-3 border-t border-[#1A1A1A]">
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
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#444444] hover:text-[#888888] transition-all"
    >
      <span className="text-sm leading-none w-4 text-center">↑</span>
      <span>Abmelden</span>
    </button>
  );
}
