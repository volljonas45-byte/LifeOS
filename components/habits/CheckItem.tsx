import { cn } from "@/lib/utils";

interface CheckItemProps {
  label: string;
  completed: boolean;
  onToggle: () => void;
}

export function CheckItem({ label, completed, onToggle }: CheckItemProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-3 w-full text-left py-1.5 group"
    >
      <span
        className={cn(
          "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
          completed
            ? "bg-[#E8FF6B] border-[#E8FF6B]"
            : "border-[#2A2A2A] group-hover:border-[#444444]"
        )}
      >
        {completed && (
          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-none stroke-[#0F0F0F]" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.5 5L4 7.5L8.5 2.5" />
          </svg>
        )}
      </span>
      <span className={cn("text-sm transition-colors", completed ? "text-[#444444] line-through" : "text-[#CCCCCC]")}>
        {label}
      </span>
    </button>
  );
}
