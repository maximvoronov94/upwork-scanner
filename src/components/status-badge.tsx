import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  APPLY_NOW: "bg-green-500/15 text-green-400 border-green-500/30",
  HIDDEN: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  MAYBE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  SKIP: "bg-red-500/15 text-red-400 border-red-500/30",
  APPLIED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  NEW: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30",
  ANALYZING: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30",
  INTERVIEW: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  HIRED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  REJECTED: "bg-red-500/15 text-red-400 border-red-500/30",
  CLOSED: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30",
};

const LABELS: Record<string, string> = {
  APPLY_NOW: "APPLY NOW",
  HIDDEN: "HIDDEN",
  MAYBE: "MAYBE",
  SKIP: "SKIP",
  APPLIED: "APPLIED",
  NEW: "NEW",
  ANALYZING: "ANALYZING",
  INTERVIEW: "INTERVIEW",
  HIRED: "HIRED",
  REJECTED: "REJECTED",
  CLOSED: "CLOSED",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[status] ?? STYLES.NEW
      )}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
