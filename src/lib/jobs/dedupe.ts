import { db } from "@/lib/db";
import type { Job } from "@prisma/client";

export async function findExistingJob(externalId?: string | null, url?: string | null): Promise<Job | null> {
  if (externalId) {
    const byExternalId = await db.job.findUnique({ where: { externalId } });
    if (byExternalId) return byExternalId;
  }
  if (url) {
    const byUrl = await db.job.findUnique({ where: { url } });
    if (byUrl) return byUrl;
  }
  return null;
}
