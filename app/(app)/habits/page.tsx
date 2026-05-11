import { Topbar } from "@/components/layout/Topbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyHabits } from "@/components/habits/DailyHabits";
import { WeeklyHabits } from "@/components/habits/WeeklyHabits";
import { HabitStats } from "@/components/habits/HabitStats";
import { formatDate } from "@/lib/utils/dates";

export default function HabitsPage() {
  const today = formatDate(new Date(), "EEEE, d. MMMM");

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Topbar title="Habits" subtitle={today} />
      <div className="px-8 py-8 max-w-2xl">
        <HabitStats />
        <Tabs defaultValue="daily">
          <TabsList className="mb-6 bg-[#111111] border border-[#1E1E1E] p-0.5 rounded-xl">
            <TabsTrigger
              value="daily"
              className="rounded-lg text-sm data-[state=active]:bg-[#E8FF6B] data-[state=active]:text-[#0F0F0F] data-[state=active]:font-semibold data-[state=active]:shadow-none text-[#555555] hover:text-[#888888]"
            >
              Täglich
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="rounded-lg text-sm data-[state=active]:bg-[#E8FF6B] data-[state=active]:text-[#0F0F0F] data-[state=active]:font-semibold data-[state=active]:shadow-none text-[#555555] hover:text-[#888888]"
            >
              Wöchentlich
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <DailyHabits />
          </TabsContent>

          <TabsContent value="weekly">
            <WeeklyHabits />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
