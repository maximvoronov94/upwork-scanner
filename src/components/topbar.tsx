"use client";

import Link from "next/link";

export function Topbar() {
  return (
    <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-4 md:px-6">
      <div className="md:hidden text-sm font-semibold">Upwork Scanner</div>
      <div className="hidden md:block text-sm text-muted">Personal opportunity scanner</div>
      <Link
        href="/"
        className="rounded-md bg-accent text-white text-sm px-3 py-1.5 font-medium hover:opacity-90"
      >
        Analyze Job
      </Link>
    </header>
  );
}
