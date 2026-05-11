import { cn } from "@/lib/utils";

interface HabitCircleProps {
  completed: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
  date?: string;
}

export function HabitCircle({ completed, onClick, size = "md" }: HabitCircleProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border-2 transition-all duration-150 flex items-center justify-center shrink-0",
        size === "sm" ? "w-4 h-4" : "w-5 h-5",
        completed
          ? "bg-[#E8FF6B] border-[#E8FF6B]"
          : "bg-transparent border-[#2A2A2A] hover:border-[#444444]"
      )}
      aria-label={completed ? "Abgehakt" : "Abhaken"}
    >
      {completed && (
        <svg
          viewBox="0 0 10 10"
          className={cn("text-[#0F0F0F]", size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5")}
        >
          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
