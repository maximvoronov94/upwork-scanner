import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { analyzeAndScoreJob } from "@/lib/jobs/analyzer";

const bodySchema = z.object({ jobId: z.string() });

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const job = await db.job.findUnique({ where: { id: parsed.data.jobId } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  try {
    const analyzed = await analyzeAndScoreJob(job.id);
    return NextResponse.json({ job: analyzed });
  } catch (err) {
    console.error("Analysis failed", err);
    const message = err instanceof Error ? err.message : "Analysis failed";
    await db.job.update({ where: { id: job.id }, data: { status: job.status === "ANALYZING" ? "NEW" : job.status } });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
