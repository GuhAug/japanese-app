import { Navbar } from "@/components/layout/Navbar";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pb-20 md:pb-0 min-w-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
