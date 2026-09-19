interface StatCard {
  label: string;
  value: number;
  accent?: "green" | "amber" | "default";
}

export function StatsCards({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-surface p-3"
        >
          <div className="text-xs text-muted mb-1">{stat.label}</div>
          <div
            className={
              stat.accent === "green"
                ? "text-2xl font-semibold text-green-400"
                : stat.accent === "amber"
                ? "text-2xl font-semibold text-amber-400"
                : "text-2xl font-semibold"
            }
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
