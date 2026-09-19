import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const bodySchema = z.object({
  status: z.enum([
    "APPLIED",
    "SKIP",
    "MAYBE",
    "HIDDEN",
    "APPLY_NOW",
    "CLIENT_VIEWED",
    "INTERVIEW",
    "HIRED",
    "REJECTED",
    "CLOSED",
  ]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  const job = await db.job.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const status = parsed.data.status;

  // CLIENT_VIEWED is a flag, not a stored enum status — everything else maps directly.
  if (status === "CLIENT_VIEWED") {
    const updated = await db.job.update({ where: { id }, data: { clientViewed: true } });
    return NextResponse.json({ job: updated });
  }

  const data: {
    status: typeof status;
    appliedAt?: Date;
    interview?: boolean;
    hired?: boolean;
    rejected?: boolean;
  } = { status };

  if (status === "APPLIED") data.appliedAt = new Date();
  if (status === "INTERVIEW") data.interview = true;
  if (status === "HIRED") data.hired = true;
  if (status === "REJECTED") data.rejected = true;

  const updated = await db.job.update({ where: { id }, data });
  return NextResponse.json({ job: updated });
}
