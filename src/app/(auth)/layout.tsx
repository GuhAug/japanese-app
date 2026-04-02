import { Navbar } from "@/components/layout/Navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
