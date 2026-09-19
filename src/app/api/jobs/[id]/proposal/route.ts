import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getMaxProfile } from "@/lib/profile";
import { buildProposalPrompt } from "@/lib/ai/prompts";
import { generateProposal } from "@/lib/ai/provider";

const bodySchema = z.object({
  mode: z.enum(["regenerate", "shorter", "more_human", "different_project"]).default("regenerate"),
  project: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine, defaults apply
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const job = await db.job.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const profile = getMaxProfile();
  const reasons = (job.matchReasons as string[] | null) ?? [];

  const prompt = buildProposalPrompt(
    { title: job.title, description: job.description, skills: (job.skills as string[] | null) ?? null },
    profile,
    job.bestProject,
    reasons,
    {
      shorter: parsed.data.mode === "shorter",
      moreHuman: parsed.data.mode === "more_human",
      differentProject: parsed.data.mode === "different_project" ? parsed.data.project : undefined,
    }
  );

  try {
    const proposal = await generateProposal(prompt);
    const proposalProject =
      parsed.data.mode === "different_project" && parsed.data.project
        ? parsed.data.project
        : job.proposalProject;

    const updated = await db.job.update({
      where: { id },
      data: { proposal, proposalProject },
    });

    return NextResponse.json({ job: updated });
  } catch (err) {
    console.error("Proposal generation failed", err);
    const message = err instanceof Error ? err.message : "Proposal generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
