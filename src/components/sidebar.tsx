"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "All Jobs" },
  { href: "/apply-now", label: "Apply Now" },
  { href: "/hidden", label: "Hidden" },
  { href: "/maybe", label: "Maybe" },
  { href: "/applied", label: "Applied" },
  { href: "/skipped", label: "Skipped" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-surface">
      <div className="px-4 py-4 border-b border-border">
        <div className="text-sm font-semibold tracking-tight">Upwork Scanner</div>
        <div className="text-xs text-muted">Max&apos;s personal dashboard</div>
      </div>
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-4 py-2 text-sm rounded-none transition-colors",
                active
                  ? "bg-surface-hover text-foreground border-l-2 border-accent"
                  : "text-muted hover:text-foreground hover:bg-surface-hover border-l-2 border-transparent"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
