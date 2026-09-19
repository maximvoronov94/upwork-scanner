import { JobListClient } from "@/components/job-list-client";

export default function ApplyNowPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Apply Now</h1>
      <JobListClient fixedStatus="APPLY_NOW" />
    </div>
  );
}
