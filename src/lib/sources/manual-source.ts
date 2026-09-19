import type { JobSource, NormalizedJob } from "@/lib/sources/job-source";

// Manual import has no background fetch loop — jobs are pushed in directly
// via POST /api/jobs/import. This class exists so the app depends only on
// the JobSource interface, not a specific ingestion mechanism.
export class ManualJobSource implements JobSource {
  async fetchJobs(): Promise<NormalizedJob[]> {
    return [];
  }
}
