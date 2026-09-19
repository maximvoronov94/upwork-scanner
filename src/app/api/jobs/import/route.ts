import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobImportSchema } from "@/lib/jobs/input-schema";
import { normalizeProposalLabel } from "@/lib/jobs/scoring";
import { findExistingJob } from "@/lib/jobs/dedupe";
import { hashDescription } from "@/lib/jobs/normalize";
import { analyzeAndScoreJob } from "@/lib/jobs/analyzer";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = jobImportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const url = input.url;
  const range = normalizeProposalLabel(input.proposalsLabel);
  const newHash = hashDescription(input.title, input.description);

  const existing = await findExistingJob(input.externalId, url);

  let job;
  try {
    if (existing) {
      job = await db.job.update({
        where: { id: existing.id },
        data: {
          proposalsLabel: input.proposalsLabel ?? existing.proposalsLabel,
          proposalsMin: range?.min ?? existing.proposalsMin,
          proposalsMax: range?.max ?? existing.proposalsMax,
          hires: input.hires ?? existing.hires,
          interviewing: input.interviewing ?? existing.interviewing,
          clientViewed: existing.clientViewed,
          lastSeenAt: new Date(),
          title: input.title,
          description: input.description,
        },
      });
    } else {
      job = await db.job.create({
        data: {
          externalId: input.externalId || null,
          url,
          title: input.title,
          description: input.description,
          jobType: input.jobType ?? null,
          budgetMin: input.budgetMin ?? null,
          budgetMax: input.budgetMax ?? null,
          hourlyMin: input.hourlyMin ?? null,
          hourlyMax: input.hourlyMax ?? null,
          currency: input.currency ?? null,
          skills: input.skills ?? undefined,
          proposalsLabel: input.proposalsLabel ?? null,
          proposalsMin: range?.min ?? null,
          proposalsMax: range?.max ?? null,
          hires: input.hires ?? null,
          interviewing: input.interviewing ?? null,
          clientCountry: input.clientCountry ?? null,
          clientRating: input.clientRating ?? null,
          clientSpent: input.clientSpent ?? null,
          clientHires: input.clientHires ?? null,
          paymentVerified: input.paymentVerified ?? null,
          locationRequirement: input.locationRequirement ?? null,
          locationAllowed: input.locationAllowed ?? null,
          postedAt: input.postedAt ?? null,
          status: "NEW",
        },
      });
    }
  } catch (err) {
    console.error("Failed to save job", err);
    return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
  }

  const needsAnalysis = !existing || existing.descriptionHash !== newHash;

  if (!needsAnalysis) {
    return NextResponse.json({ job, reanalyzed: false });
  }

  try {
    const analyzed = await analyzeAndScoreJob(job.id);
    return NextResponse.json({ job: analyzed, reanalyzed: true });
  } catch (err) {
    console.error("Analysis failed", err);
    const message = err instanceof Error ? err.message : "Analysis failed";
    await db.job.update({ where: { id: job.id }, data: { status: "NEW" } });
    return NextResponse.json({ job, error: message, reanalyzed: false }, { status: 502 });
  }
}
