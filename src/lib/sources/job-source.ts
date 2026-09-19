import type { NormalizedJob } from "@/lib/jobs/normalize";

export type { NormalizedJob };

export interface JobSource {
  fetchJobs(): Promise<NormalizedJob[]>;
}
