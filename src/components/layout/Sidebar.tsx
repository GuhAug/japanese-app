"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Início", icon: "🏠" },
  { href: "/trilha", label: "Trilha", icon: "🗺️" },
  { href: "/revisao", label: "Revisão SRS", icon: "🃏" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-r border-[var(--border)] bg-[var(--card)] py-6 px-3 gap-1">
      <div className="px-3 mb-4">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Menu</span>
      </div>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.startsWith(item.href)
              ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-700"
          )}
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 card-bg border-t border-[var(--border)] flex">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition-colors",
            pathname.startsWith(item.href)
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500 dark:text-slate-400"
          )}
        >
          <span className="text-xl">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
