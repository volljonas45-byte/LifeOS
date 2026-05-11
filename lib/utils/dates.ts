import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, parseISO } from "date-fns";
import { de } from "date-fns/locale";

export function getToday(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getWeekDays(date = new Date()): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function formatDate(date: string | Date, pattern = "d. MMMM yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: de });
}

export function formatShortDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function getDayLabel(date: Date): string {
  return format(date, "EEE", { locale: de });
}

export function isTodayDate(dateStr: string): boolean {
  return isToday(parseISO(dateStr));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}
