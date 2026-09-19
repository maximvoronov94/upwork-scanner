import { normalizeProposalLabel } from "@/lib/jobs/scoring";
import crypto from "crypto";

export interface NormalizedJob {
  externalId?: string | null;
  url?: string | null;

  title: string;
  description: string;

  jobType?: string | null;

  budgetMin?: number | null;
  budgetMax?: number | null;

  hourlyMin?: number | null;
  hourlyMax?: number | null;

  currency?: string | null;

  skills?: string[] | null;

  proposalsLabel?: string | null;

  hires?: number | null;
  interviewing?: number | null;

  clientCountry?: string | null;
  clientRating?: number | null;
  clientSpent?: number | null;
  clientHires?: number | null;
  paymentVerified?: boolean | null;

  locationRequirement?: string | null;
  locationAllowed?: boolean | null;

  postedAt?: Date | null;
}

export function normalizeJobInput(input: NormalizedJob) {
  const range = normalizeProposalLabel(input.proposalsLabel);

  return {
    ...input,
    proposalsMin: range?.min ?? null,
    proposalsMax: range?.max ?? null,
  };
}

export function hashDescription(title: string, description: string): string {
  return crypto.createHash("sha256").update(`${title}\n${description}`).digest("hex");
}
