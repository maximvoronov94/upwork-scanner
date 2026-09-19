import { JobListClient } from "@/components/job-list-client";

export default function AppliedPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Applied</h1>
      <JobListClient fixedStatus="APPLIED" />
    </div>
  );
}
