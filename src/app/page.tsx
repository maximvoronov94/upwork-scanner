import { db } from "@/lib/db";
import { ManualJobImport } from "@/components/manual-job-import";
import { JobListClient } from "@/components/job-list-client";

export const dynamic = "force-dynamic";

async function getStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [today, applyNow, hidden, applied, interviews] = await Promise.all([
    db.job.count({ where: { createdAt: { gte: startOfDay } } }),
    db.job.count({ where: { status: "APPLY_NOW" } }),
    db.job.count({ where: { status: "HIDDEN" } }),
    db.job.count({ where: { status: "APPLIED" } }),
    db.job.count({ where: { interview: true } }),
  ]);

  return { today, applyNow, hidden, applied, interviews };
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard label="Jobs Today" value={stats.today} />
        <StatCard label="Apply Now" value={stats.applyNow} accent="green" />
        <StatCard label="Hidden Opportunities" value={stats.hidden} accent="amber" />
        <StatCard label="Applied" value={stats.applied} />
        <StatCard label="Interviews" value={stats.interviews} />
      </div>

      <ManualJobImport />

      <JobListClient />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "green" | "amber";
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div
        className={
          accent === "green"
            ? "text-2xl font-semibold text-green-400"
            : accent === "amber"
            ? "text-2xl font-semibold text-amber-400"
            : "text-2xl font-semibold"
        }
      >
        {value}
      </div>
    </div>
  );
}
