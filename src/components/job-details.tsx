"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { MatchScore } from "@/components/match-score";
import { formatAge, formatBudget, formatProposals } from "@/lib/utils";

export interface JobDetailData {
  id: string;
  title: string;
  description: string;
  url: string | null;
  status: string;

  postedAt: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  hourlyMin: number | null;
  hourlyMax: number | null;
  currency: string | null;

  proposalsMin: number | null;
  proposalsMax: number | null;
  hires: number | null;
  interviewing: number | null;

  clientCountry: string | null;
  clientRating: number | null;
  clientSpent: number | null;
  clientHires: number | null;
  paymentVerified: boolean | null;
  locationRequirement: string | null;

  canDo: boolean | null;
  technicalMatch: number | null;
  opportunityScore: number | null;
  category: string | null;
  bestProject: string | null;

  matchReasons: string[] | null;
  missingSkills: string[] | null;
  risks: string[] | null;
  hardBlocker: boolean;
}

const STATUS_ACTIONS = [
  "APPLIED",
  "SKIP",
  "MAYBE",
  "CLIENT_VIEWED",
  "INTERVIEW",
  "HIRED",
  "REJECTED",
] as const;

function ageMinutes(postedAt: string | null): number | null {
  if (!postedAt) return null;
  return Math.max(0, Math.round((Date.now() - new Date(postedAt).getTime()) / 60000));
}

export function JobDetails({ job }: { job: JobDetailData }) {
  const router = useRouter();
  const [status, setStatus] = useState(job.status);
  const [updating, setUpdating] = useState<string | null>(null);

  async function changeStatus(newStatus: string) {
    setUpdating(newStatus);
    try {
      const res = await fetch(`/api/jobs/${job.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        if (newStatus !== "CLIENT_VIEWED") setStatus(newStatus);
        router.refresh();
      }
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-semibold">{job.title}</h1>
            <StatusBadge status={status} />
          </div>
          <div className="text-sm text-muted mt-2 flex flex-wrap gap-x-4 gap-y-1">
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
          </div>
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-3 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-surface-hover"
            >
              OPEN ORIGINAL LINK
            </a>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold mb-2">Description</h2>
          <p className="text-sm whitespace-pre-wrap text-foreground/90">{job.description}</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold mb-2">Client information</h2>
          <div className="text-sm text-muted space-y-1">
            <div>Country: {job.clientCountry ?? "unknown"}</div>
            <div>Rating: {job.clientRating ?? "unknown"}</div>
            <div>Total spent: {job.clientSpent ?? "unknown"}</div>
            <div>Hires: {job.clientHires ?? "unknown"}</div>
            <div>Payment verified: {job.paymentVerified ? "yes" : "no"}</div>
            <div>Location requirement: {job.locationRequirement ?? "none"}</div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold mb-2">Competition</h2>
          <div className="text-sm text-muted space-y-1">
            <div>Proposals: {formatProposals(job.proposalsMin, job.proposalsMax)}</div>
            <div>Hires: {job.hires ?? "unknown"}</div>
            <div>Interviewing: {job.interviewing ?? "unknown"}</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold mb-3">AI Analysis</h2>

          <div className="mb-3">
            <div className="text-xs text-muted">Can Max do it?</div>
            <div className="font-semibold">
              {job.canDo === null ? "—" : job.canDo ? "Yes" : "No"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <MatchScore label="Technical Match" value={job.technicalMatch} />
            <MatchScore label="Opportunity Score" value={job.opportunityScore} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
            <div>
              <div className="text-xs text-muted">Category</div>
              <div>{job.category ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Best Project</div>
              <div>{job.bestProject ?? "—"}</div>
            </div>
          </div>

          {job.matchReasons && job.matchReasons.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-muted mb-1">Why it matches</div>
              <ul className="text-sm list-disc list-inside space-y-0.5">
                {job.matchReasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {job.missingSkills && job.missingSkills.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-muted mb-1">Missing Skills</div>
              <ul className="text-sm list-disc list-inside space-y-0.5 text-amber-400">
                {job.missingSkills.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {job.risks && job.risks.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-muted mb-1">Risks</div>
              <ul className="text-sm list-disc list-inside space-y-0.5 text-amber-400">
                {job.risks.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {job.hardBlocker && (
            <div className="text-sm text-red-400 font-medium">Hard blocker present</div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold mb-3">Actions</h2>
          <div className="flex flex-wrap gap-2">
            {STATUS_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => changeStatus(action)}
                disabled={updating !== null}
                className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-surface-hover disabled:opacity-50"
              >
                {updating === action ? "..." : action.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
