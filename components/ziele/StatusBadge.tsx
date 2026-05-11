import { cn } from "@/lib/utils";
import type { GoalStatus } from "@/lib/types";

const config: Record<GoalStatus, { label: string; className: string }> = {
  achieved:    { label: "Erreicht",  className: "bg-[#0A1A0F] text-[#4ADE80] border-[#1A3020]" },
  on_track:    { label: "On Track", className: "bg-[#0A1220] text-[#4D9EFF] border-[#0F2040]" },
  at_risk:     { label: "At Risk",  className: "bg-[#1A0F0A] text-[#FB923C] border-[#2A1810]" },
  not_started: { label: "Offen",    className: "bg-[#1A1A1A] text-[#555555] border-[#2A2A2A]" },
};

export function StatusBadge({ status }: { status: GoalStatus }) {
  const { label, className } = config[status] ?? config.not_started;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border", className)}>
      {label}
    </span>
  );
}
