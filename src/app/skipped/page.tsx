import { JobListClient } from "@/components/job-list-client";

export default function SkippedPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Skipped</h1>
      <JobListClient fixedStatus="SKIP" />
    </div>
  );
}
