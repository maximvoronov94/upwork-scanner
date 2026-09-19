"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatAge, formatBudget, formatProposals } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface JobCardData {
  id: string;
  title: string;
  url: string | null;
  postedAt: string | null;
  proposalsMin: number | null;
  proposalsMax: number | null;
  budgetMin: number | null;
  budgetMax: number | null;
  hourlyMin: number | null;
  hourlyMax: number | null;
  currency: string | null;
  clientCountry: string | null;
  paymentVerified: boolean | null;
  technicalMatch: number | null;
  opportunityScore: number | null;
  bestProject: string | null;
  status: string;
  matchReasons: string[] | null;
  risks: string[] | null;
}

function ageMinutes(postedAt: string | null): number | null {
  if (!postedAt) return null;
  return Math.max(0, Math.round((Date.now() - new Date(postedAt).getTime()) / 60000));
}

export function JobCard({
  job,
  onStatusChange,
}: {
  job: JobCardData;
  onStatusChange?: (id: string, status: string) => void;
}) {
  const isHot = job.status === "APPLY_NOW" || job.status === "HIDDEN";

  return (
    <div
      className={cn(
        "rounded-lg border bg-surface p-4",
        isHot ? "border-green-500/40" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href={`/jobs/${job.id}`} className="font-medium hover:underline truncate block">
            {job.title}
          </Link>
          <div className="text-xs text-muted mt-1 flex flex-wrap gap-x-3 gap-y-1">
            <span>Posted {formatAge(ageMinutes(job.postedAt))}</span>
            <span>Proposals {formatProposals(job.proposalsMin, job.proposalsMax)}</span>
            <span>
              {formatBudget({
                budgetMin: job.budgetMin,
                budgetMax: job.budgetMax,
                hourlyMin: job.hourlyMin,
                hourlyMax: job.hourlyMax,
                currency: job.currency,
              })}
            </span>
            {job.clientCountry && <span>{job.clientCountry}</span>}
            {job.paymentVerified && <span className="text-green-400">Payment verified</span>}
          </div>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="flex items-center gap-6 mt-3">
        <div>
          <div className="text-xs text-muted">Match</div>
          <div className="font-semibold">{job.technicalMatch ?? "—"}</div>
        </div>
        <div>
          <div className="text-xs text-muted">Opportunity</div>
          <div className="font-semibold">{job.opportunityScore ?? "—"}</div>
        </div>
        {job.bestProject && (
          <div>
            <div className="text-xs text-muted">Best project</div>
            <div className="font-medium text-sm">{job.bestProject}</div>
          </div>
        )}
      </div>

      {job.matchReasons && job.matchReasons.length > 0 && (
        <div className="mt-3 text-xs text-muted">
          <span className="text-foreground/70">Reasons: </span>
          {job.matchReasons.join(", ")}
        </div>
      )}

      {job.risks && job.risks.length > 0 && (
        <div className="mt-1 text-xs text-amber-400">
          <span>Risk: </span>
          {job.risks.join(", ")}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-surface-hover"
          >
            OPEN
          </a>
        )}
        <Link
          href={`/jobs/${job.id}`}
          className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-surface-hover"
        >
          DETAILS
        </Link>
        <Link
          href={`/jobs/${job.id}#proposal`}
          className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-surface-hover"
        >
          PROPOSAL
        </Link>
        {onStatusChange && (
          <>
            <button
              onClick={() => onStatusChange(job.id, "SKIP")}
              className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-surface-hover"
            >
              SKIP
            </button>
            <button
              onClick={() => onStatusChange(job.id, "APPLIED")}
              className="text-xs px-3 py-1.5 rounded-md border border-green-500/40 text-green-400 hover:bg-green-500/10"
            >
              APPLIED
            </button>
          </>
        )}
      </div>
    </div>
  );
}
