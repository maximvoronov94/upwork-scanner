import { cn } from "@/lib/utils";

function colorFor(score: number) {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

export function MatchScore({ label, value }: { label: string; value: number | null }) {
  if (value === null) {
    return (
      <div>
        <div className="text-xs text-muted">{label}</div>
        <div className="text-lg font-semibold text-muted">—</div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className={cn("text-lg font-semibold", colorFor(value))}>{value}</div>
    </div>
  );
}
