import { db } from "@/lib/db";
import type { Job, AppSettings } from "@prisma/client";
import { getMaxProfile } from "@/lib/profile";
import { buildAnalysisPrompt, buildProposalPrompt } from "@/lib/ai/prompts";
import { analyzeJob, generateProposal } from "@/lib/ai/provider";
import {
  ageInMinutes,
  clientScore,
  competitionScore,
  freshnessScore,
  locationScore,
  opportunityScore,
} from "@/lib/jobs/scoring";
import { classifyJob } from "@/lib/jobs/classifier";
import { hashDescription } from "@/lib/jobs/normalize";
import { notifyJobOpportunity } from "@/lib/telegram";
import { formatAge, formatBudget, formatProposals } from "@/lib/utils";

export async function getOrCreateSettings(): Promise<AppSettings> {
  const existing = await db.appSettings.findFirst();
  if (existing) return existing;
  return db.appSettings.create({ data: {} });
}

// Runs AI analysis + deterministic scoring + classification for a job, and persists the result.
export async function analyzeAndScoreJob(jobId: string): Promise<Job> {
  const job = await db.job.findUniqueOrThrow({ where: { id: jobId } });
  const profile = getMaxProfile();
  const settings = await getOrCreateSettings();

  await db.job.update({ where: { id: jobId }, data: { status: "ANALYZING" } });

  const prompt = buildAnalysisPrompt(
    {
      title: job.title,
      description: job.description,
      skills: (job.skills as string[] | null) ?? null,
      budgetMin: job.budgetMin,
      budgetMax: job.budgetMax,
      hourlyMin: job.hourlyMin,
      hourlyMax: job.hourlyMax,
      locationRequirement: job.locationRequirement,
    },
    profile
  );

  const analysis = await analyzeJob(prompt);

  const age = ageInMinutes(job.postedAt);
  const fresh = freshnessScore(age);
  const competition = competitionScore(job.proposalsMin, job.proposalsMax);
  const client = clientScore({
    paymentVerified: job.paymentVerified,
    clientRating: job.clientRating,
    clientSpent: job.clientSpent,
    clientHires: job.clientHires,
  });
  const location = locationScore(job.locationAllowed);

  const opportunity = opportunityScore({
    technicalMatch: analysis.technicalMatch,
    competitionScore: competition,
    freshnessScore: fresh,
    portfolioMatch: analysis.portfolioMatch,
    clientScore: client,
    locationScore: location,
  });

  const hardBlocker = analysis.hardBlockers.length > 0;

  const classification = classifyJob(
    {
      technicalMatch: analysis.technicalMatch,
      ageMinutes: age,
      proposalsMin: job.proposalsMin,
      proposalsMax: job.proposalsMax,
      hires: job.hires,
      locationAllowed: job.locationAllowed,
      hardBlocker,
      canDo: analysis.canDo,
    },
    settings
  );

  let proposal: string | null = null;
  let proposalProject: string | null = null;

  if (classification === "APPLY_NOW" || classification === "HIDDEN") {
    const proposalPrompt = buildProposalPrompt(
      {
        title: job.title,
        description: job.description,
        skills: (job.skills as string[] | null) ?? null,
      },
      profile,
      analysis.bestProject,
      analysis.reasons
    );
    proposal = await generateProposal(proposalPrompt);
    proposalProject = analysis.bestProject;
  }

  const updated = await db.job.update({
    where: { id: jobId },
    data: {
      technicalMatch: analysis.technicalMatch,
      portfolioMatch: analysis.portfolioMatch,
      freshnessScore: fresh,
      competitionScore: competition,
      clientScore: client,
      locationScore: location,
      opportunityScore: opportunity,

      canDo: analysis.canDo,
      hardBlocker,

      category: analysis.category,
      bestProject: analysis.bestProject,

      matchReasons: analysis.reasons,
      missingSkills: analysis.missingSkills,
      risks: analysis.risks,

      status: classification,

      proposal,
      proposalProject,

      descriptionHash: hashDescription(job.title, job.description),

      lastSeenAt: new Date(),
    },
  });

  if (
    settings.telegramEnabled &&
    (classification === "APPLY_NOW" || classification === "HIDDEN")
  ) {
    try {
      await notifyJobOpportunity({
        title: updated.title,
        ageLabel: formatAge(age),
        proposalsLabel: formatProposals(updated.proposalsMin, updated.proposalsMax),
        budgetLabel: formatBudget({
          budgetMin: updated.budgetMin,
          budgetMax: updated.budgetMax,
          hourlyMin: updated.hourlyMin,
          hourlyMax: updated.hourlyMax,
          currency: updated.currency,
        }),
        matchScore: analysis.technicalMatch,
        reason: analysis.reasons.join(", "),
        bestProject: analysis.bestProject,
        url: updated.url,
        kind: classification,
      });
    } catch (err) {
      // Telegram is optional — never let a notification failure affect the analysis result.
      console.error("Telegram notification failed", err);
    }
  }

  return updated;
}

export function shouldReanalyze(job: Job, newTitle: string, newDescription: string): boolean {
  const newHash = hashDescription(newTitle, newDescription);
  return job.descriptionHash !== newHash;
}
