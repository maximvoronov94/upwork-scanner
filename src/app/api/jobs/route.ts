import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { JobStatus, Prisma } from "@prisma/client";

const VALID_STATUSES: JobStatus[] = [
  "NEW",
  "ANALYZING",
  "APPLY_NOW",
  "HIDDEN",
  "MAYBE",
  "SKIP",
  "APPLIED",
  "INTERVIEW",
  "HIRED",
  "REJECTED",
  "CLOSED",
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);

  const where: Prisma.JobWhereInput = {};

  if (status) {
    const statuses = status.split(",").filter((s): s is JobStatus =>
      VALID_STATUSES.includes(s as JobStatus)
    );
    if (statuses.length > 0) {
      where.status = { in: statuses };
    }
  }

  const jobs = await db.job.findMany({
    where,
    orderBy: [{ opportunityScore: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return NextResponse.json({ jobs });
}
