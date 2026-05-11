import { getGreeting } from "@/lib/utils/dates";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const greeting = getGreeting();

  return (
    <header className="border-b border-[#222222] bg-[#0F0F0F] px-8 py-5 flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#EDEDED] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[#666666] mt-0.5 uppercase tracking-wide">{subtitle}</p>
        )}
      </div>
      <div className="text-xs text-[#666666]">{greeting}</div>
    </header>
  );
}
