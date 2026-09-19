import { JobListClient } from "@/components/job-list-client";

export default function HiddenPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Hidden Opportunities</h1>
      <JobListClient fixedStatus="HIDDEN" />
    </div>
  );
}
