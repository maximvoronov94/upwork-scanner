import { JobListClient } from "@/components/job-list-client";

export default function MaybePage() {
  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Maybe</h1>
      <JobListClient fixedStatus="MAYBE" />
    </div>
  );
}
