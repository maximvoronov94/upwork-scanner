"use client";

import { useState } from "react";
import { Filters } from "@/components/filters";
import { JobList } from "@/components/job-list";

export function JobListClient({ fixedStatus }: { fixedStatus?: string }) {
  const [status, setStatus] = useState(fixedStatus ?? "");

  return (
    <div>
      {!fixedStatus && <Filters value={status} onChange={setStatus} />}
      <JobList statusFilter={status || undefined} />
    </div>
  );
}
