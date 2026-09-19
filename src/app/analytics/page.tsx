import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getAnalytics() {
  const [
    total,
    analyzed,
    applyNow,
    hidden,
    applied,
    clientViewed,
    interviews,
    hires,
    rejections,
  ] = await Promise.all([
    db.job.count(),
    db.job.count({ where: { technicalMatch: { not: null } } }),
    db.job.count({ where: { status: "APPLY_NOW" } }),
    db.job.count({ where: { status: "HIDDEN" } }),
    db.job.count({ where: { status: "APPLIED" } }),
    db.job.count({ where: { clientViewed: true } }),
    db.job.count({ where: { interview: true } }),
    db.job.count({ where: { hired: true } }),
    db.job.count({ where: { rejected: true } }),
  ]);

  const [byCategory, byProject, byCountry] = await Promise.all([
    db.job.groupBy({
      by: ["category"],
      _count: true,
      where: { category: { not: null } },
    }),
    db.job.groupBy({
      by: ["bestProject"],
      _count: true,
      where: { bestProject: { not: null } },
    }),
    db.job.groupBy({
      by: ["clientCountry"],
      _count: true,
      where: { clientCountry: { not: null } },
    }),
  ]);

  return {
    total,
    analyzed,
    applyNow,
    hidden,
    applied,
    clientViewed,
    interviews,
    hires,
    rejections,
    byCategory,
    byProject,
    byCountry,
  };
}

function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return "—";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export default async function AnalyticsPage() {
  const a = await getAnalytics();

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Jobs", value: a.total },
          { label: "Analyzed", value: a.analyzed },
          { label: "Apply Now", value: a.applyNow },
          { label: "Hidden", value: a.hidden },
          { label: "Applied", value: a.applied },
          { label: "Client Views", value: a.clientViewed },
          { label: "Interviews", value: a.interviews },
          { label: "Hires", value: a.hires },
          { label: "Rejections", value: a.rejections },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-surface p-3">
            <div className="text-xs text-muted mb-1">{s.label}</div>
            <div className="text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold mb-3">Conversion</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-muted">Applied → Viewed</div>
            <div className="text-lg font-semibold">{pct(a.clientViewed, a.applied)}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Viewed → Interview</div>
            <div className="text-lg font-semibold">{pct(a.interviews, a.clientViewed)}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Interview → Hired</div>
            <div className="text-lg font-semibold">{pct(a.hires, a.interviews)}</div>
          </div>
        </div>
      </div>

      <GroupTable
        title="By category"
        rows={a.byCategory.map((r: { category: string | null; _count: number }) => ({
          label: r.category ?? "—",
          count: r._count,
        }))}
      />
      <GroupTable
        title="By best project"
        rows={a.byProject.map((r: { bestProject: string | null; _count: number }) => ({
          label: r.bestProject ?? "—",
          count: r._count,
        }))}
      />
      <GroupTable
        title="By client country"
        rows={a.byCountry.map((r: { clientCountry: string | null; _count: number }) => ({
          label: r.clientCountry ?? "—",
          count: r._count,
        }))}
      />
    </div>
  );
}

function GroupTable({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold mb-2">{title}</h2>
        <div className="text-sm text-muted">No data yet.</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold mb-2">{title}</h2>
      <div className="space-y-1">
        {rows
          .sort((a, b) => b.count - a.count)
          .map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-muted">{row.label}</span>
              <span className="font-medium">{row.count}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
