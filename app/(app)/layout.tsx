import { Sidebar } from "@/components/layout/Sidebar";
import { PageTransition } from "@/components/layout/PageTransition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0F0F0F]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
