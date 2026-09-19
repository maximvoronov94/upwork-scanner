"use client";

import { useCallback, useEffect, useState } from "react";
import { JobCard, type JobCardData } from "@/components/job-card";

const POLL_INTERVAL_MS = 5000;

export function JobList({ statusFilter }: { statusFilter?: string }) {
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const qs = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
      const res = await fetch(`/api/jobs${qs}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load jobs");
      const data = await res.json();
      setJobs(data.jobs);
      setError(null);
    } catch {
      setError("Could not load jobs. Retrying...");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const initial = setTimeout(load, 0);
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [load]);

  async function handleStatusChange(id: string, status: string) {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
    await fetch(`/api/jobs/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (loading) {
    return <div className="text-sm text-muted">Loading jobs...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-400">{error}</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="text-sm text-muted border border-dashed border-border rounded-lg p-8 text-center">
        No jobs yet. Paste a job above and press Analyze.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onStatusChange={handleStatusChange} />
      ))}
    </div>
  );
}
