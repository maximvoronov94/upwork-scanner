import type { AppSettings } from "@prisma/client";

export type JobClassification =
  | "APPLY_NOW"
  | "HIDDEN"
  | "MAYBE"
  | "SKIP";

export interface ClassificationInput {
  technicalMatch: number;
  ageMinutes: number | null;
  proposalsMin: number | null;
  proposalsMax: number | null;
  hires: number | null;
  locationAllowed: boolean | null;
  hardBlocker: boolean;
  canDo: boolean;
}

function proposalsWithinLimit(
  proposalsMin: number | null,
  proposalsMax: number | null,
  limit: number
): boolean {
  // Use the max of the known range so we don't underestimate competition.
  const value = proposalsMax ?? proposalsMin;
  if (value === null) return true; // unknown proposals -> don't exclude
  return value <= limit;
}

export function classifyJob(
  input: ClassificationInput,
  settings: Pick<
    AppSettings,
    | "fastMatchMinimum"
    | "hiddenMatchMinimum"
    | "maximumFastAgeMinutes"
    | "maximumHiddenAgeMinutes"
    | "maximumFastProposals"
    | "maximumHiddenProposals"
    | "minimumMatch"
  >
): JobClassification {
  if (input.hardBlocker || !input.canDo) return "SKIP";
  if (input.locationAllowed === false) return "SKIP";

  const hiresZero = input.hires === null || input.hires === 0;

  const isFast =
    input.technicalMatch >= settings.fastMatchMinimum &&
    input.ageMinutes !== null &&
    input.ageMinutes <= settings.maximumFastAgeMinutes &&
    proposalsWithinLimit(input.proposalsMin, input.proposalsMax, settings.maximumFastProposals) &&
    hiresZero;

  if (isFast) return "APPLY_NOW";

  const isHidden =
    input.technicalMatch >= settings.hiddenMatchMinimum &&
    input.ageMinutes !== null &&
    input.ageMinutes >= 30 &&
    input.ageMinutes <= settings.maximumHiddenAgeMinutes &&
    proposalsWithinLimit(input.proposalsMin, input.proposalsMax, settings.maximumHiddenProposals) &&
    hiresZero;

  if (isHidden) return "HIDDEN";

  const proposalsExcessive = (input.proposalsMax ?? input.proposalsMin ?? 0) > 50;
  const isStale = input.ageMinutes !== null && input.ageMinutes > settings.maximumHiddenAgeMinutes;

  if (proposalsExcessive && isStale) return "SKIP";

  if (input.technicalMatch < settings.minimumMatch) return "SKIP";

  return "MAYBE";
}
