"use client";

import { useState } from "react";

export function ProposalBox({
  jobId,
  initialProposal,
  bestProject,
}: {
  jobId: string;
  initialProposal: string | null;
  bestProject: string | null;
}) {
  const [proposal, setProposal] = useState(initialProposal ?? "");
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function regenerate(mode: "regenerate" | "shorter" | "more_human") {
    setLoading(mode);
    try {
      const res = await fetch(`/api/jobs/${jobId}/proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (data.job?.proposal) setProposal(data.job.proposal);
    } finally {
      setLoading(null);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div id="proposal" className="rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold mb-3">Proposal</h3>
      {proposal ? (
        <textarea
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          rows={10}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      ) : (
        <div className="text-sm text-muted">
          No proposal generated yet. This job wasn&apos;t classified as APPLY NOW or HIDDEN.
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={copy}
          className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-surface-hover"
        >
          {copied ? "COPIED" : "COPY"}
        </button>
        <button
          onClick={() => regenerate("regenerate")}
          disabled={loading !== null}
          className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-surface-hover disabled:opacity-50"
        >
          {loading === "regenerate" ? "..." : "REGENERATE"}
        </button>
        <button
          onClick={() => regenerate("shorter")}
          disabled={loading !== null}
          className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-surface-hover disabled:opacity-50"
        >
          {loading === "shorter" ? "..." : "SHORTER"}
        </button>
        <button
          onClick={() => regenerate("more_human")}
          disabled={loading !== null}
          className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-surface-hover disabled:opacity-50"
        >
          {loading === "more_human" ? "..." : "MORE HUMAN"}
        </button>
      </div>
      {bestProject && (
        <div className="text-xs text-muted mt-2">Referenced project: {bestProject}</div>
      )}
    </div>
  );
}
