// Deterministic scoring. Edit thresholds here — never let the LLM choose the final score.

export function freshnessScore(ageMinutes: number | null): number {
  if (ageMinutes === null) return 50; // unknown age -> neutral
  if (ageMinutes <= 15) return 100;
  if (ageMinutes <= 30) return 95;
  if (ageMinutes <= 60) return 85;
  if (ageMinutes <= 120) return 70;
  if (ageMinutes <= 240) return 50;
  if (ageMinutes <= 480) return 20;
  return 5;
}

export interface ProposalRange {
  min: number | null;
  max: number | null;
}

const PROPOSAL_LABELS: Record<string, ProposalRange> = {
  "less than 5": { min: 0, max: 4 },
  "5 to 10": { min: 5, max: 10 },
  "10 to 15": { min: 10, max: 15 },
  "15 to 20": { min: 15, max: 20 },
  "20 to 50": { min: 20, max: 50 },
  "50+": { min: 50, max: null },
};

export function normalizeProposalLabel(label: string | null | undefined): ProposalRange | null {
  if (!label) return null;
  const normalized = label.trim().toLowerCase();
  return PROPOSAL_LABELS[normalized] ?? null;
}

// Score competition using the midpoint of a min/max range, or a neutral score if unknown.
export function competitionScore(min: number | null, max: number | null): number {
  if (min === null && max === null) return 50; // unknown -> neutral, never assume zero
  const value = max !== null && min !== null ? (min + max) / 2 : max ?? min ?? 0;

  if (value < 5) return 100;
  if (value <= 10) return 85;
  if (value <= 15) return 65;
  if (value <= 20) return 40;
  if (value <= 50) return 15;
  return 0;
}

export function clientScore(input: {
  paymentVerified: boolean | null;
  clientRating: number | null;
  clientSpent: number | null;
  clientHires: number | null;
}): number {
  let score = 50; // neutral baseline for unknown client

  if (input.paymentVerified === true) score += 20;
  else if (input.paymentVerified === false) score -= 20;

  if (input.clientRating !== null) {
    score += (input.clientRating - 3) * 10; // rating 5 -> +20, rating 1 -> -20
  }

  if (input.clientSpent !== null) {
    if (input.clientSpent > 10000) score += 15;
    else if (input.clientSpent > 1000) score += 10;
    else if (input.clientSpent > 0) score += 5;
  }

  if (input.clientHires !== null && input.clientHires > 0) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function locationScore(locationAllowed: boolean | null): number {
  if (locationAllowed === false) return 0;
  return 100;
}

export interface OpportunityScoreInput {
  technicalMatch: number;
  competitionScore: number;
  freshnessScore: number;
  portfolioMatch: number;
  clientScore: number;
  locationScore: number;
}

export function opportunityScore(input: OpportunityScoreInput): number {
  const score =
    input.technicalMatch * 0.4 +
    input.competitionScore * 0.2 +
    input.freshnessScore * 0.15 +
    input.portfolioMatch * 0.1 +
    input.clientScore * 0.1 +
    input.locationScore * 0.05;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function ageInMinutes(postedAt: Date | null): number | null {
  if (!postedAt) return null;
  return Math.max(0, Math.round((Date.now() - postedAt.getTime()) / 60000));
}
