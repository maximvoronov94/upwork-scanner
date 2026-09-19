import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { JobDetails } from "@/components/job-details";
import { ProposalBox } from "@/components/proposal-box";

export const dynamic = "force-dynamic";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await db.job.findUnique({ where: { id } });

  if (!job) notFound();

  return (
    <div className="space-y-6">
      <JobDetails
        job={{
          id: job.id,
          title: job.title,
          description: job.description,
          url: job.url,
          status: job.status,
          postedAt: job.postedAt?.toISOString() ?? null,
          budgetMin: job.budgetMin,
          budgetMax: job.budgetMax,
          hourlyMin: job.hourlyMin,
          hourlyMax: job.hourlyMax,
          currency: job.currency,
          proposalsMin: job.proposalsMin,
          proposalsMax: job.proposalsMax,
          hires: job.hires,
          interviewing: job.interviewing,
          clientCountry: job.clientCountry,
          clientRating: job.clientRating,
          clientSpent: job.clientSpent,
          clientHires: job.clientHires,
          paymentVerified: job.paymentVerified,
          locationRequirement: job.locationRequirement,
          canDo: job.canDo,
          technicalMatch: job.technicalMatch,
          opportunityScore: job.opportunityScore,
          category: job.category,
          bestProject: job.bestProject,
          matchReasons: (job.matchReasons as string[] | null) ?? null,
          missingSkills: (job.missingSkills as string[] | null) ?? null,
          risks: (job.risks as string[] | null) ?? null,
          hardBlocker: job.hardBlocker,
        }}
      />
      <ProposalBox jobId={job.id} initialProposal={job.proposal} bestProject={job.bestProject} />
    </div>
  );
}
