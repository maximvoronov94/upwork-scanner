import type { MaxProfile } from "@/lib/profile";

export function buildRepairPrompt(invalidOutput: string): string {
  return `The following text was supposed to be a single valid JSON object matching a strict schema, but it failed to parse or validate. Fix it and return ONLY the corrected JSON object, no markdown fences, no commentary, no explanation.

Invalid output:
${invalidOutput}

Required shape:

{
  "canDo": true,
  "technicalMatch": 0,
  "portfolioMatch": 0,
  "category": "string",
  "bestProject": "string or null",
  "reasons": ["..."],
  "missingSkills": ["..."],
  "risks": ["..."],
  "hardBlockers": ["..."],
  "summary": "short internal explanation"
}`;
}

export interface JobInputForAnalysis {
  title: string;
  description: string;
  skills?: string[] | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  hourlyMin?: number | null;
  hourlyMax?: number | null;
  locationRequirement?: string | null;
}

export function buildAnalysisPrompt(job: JobInputForAnalysis, profile: MaxProfile) {
  return `You are evaluating whether a freelance developer named ${profile.name} can realistically complete an Upwork job.

Do NOT match by keywords alone. Read the entire job title and description carefully.
Judge whether ${profile.name} can realistically perform the work based on his actual skills and projects below.

Separate:
- mandatory skills (explicitly required, non-negotiable)
- preferred skills (nice to have)
- minor unfamiliar libraries (usually learnable, should not automatically reject the job)

Do not invent experience. Do not claim ${profile.name} has used a specific product or library unless it is listed in his profile below.

Evaluate transferable skills. For example, Prisma experience can make Drizzle reasonable even if Drizzle itself isn't listed. But do not treat deep domain requirements (e.g. CUDA, deep ML research, Solidity auditing) as transferable when they clearly are not.

${profile.name}'s profile:

Skills:
${Object.entries(profile.skills)
  .map(([category, items]) => `- ${category}: ${items.join(", ")}`)
  .join("\n")}

Projects:
${profile.projects
  .map(
    (p) =>
      `- ${p.name}: ${p.description} (best for: ${p.bestFor.join(", ")})`
  )
  .join("\n")}

Weak or unverified skills (do not claim these as strengths, only flag as risk/blocker when actually mandatory):
${profile.weakOrUnverified.join(", ")}

Job to evaluate:

Title: ${job.title}

Description:
${job.description}

${job.skills && job.skills.length > 0 ? `Listed skills: ${job.skills.join(", ")}` : ""}
${job.budgetMin || job.budgetMax ? `Fixed budget: ${job.budgetMin ?? "?"} - ${job.budgetMax ?? "?"}` : ""}
${job.hourlyMin || job.hourlyMax ? `Hourly rate: ${job.hourlyMin ?? "?"} - ${job.hourlyMax ?? "?"}` : ""}
${job.locationRequirement ? `Location requirement: ${job.locationRequirement}` : ""}

Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:

{
  "canDo": true,
  "technicalMatch": 85,
  "portfolioMatch": 80,
  "category": "string",
  "bestProject": "string or null",
  "reasons": ["..."],
  "missingSkills": ["..."],
  "risks": ["..."],
  "hardBlockers": ["..."],
  "summary": "short internal explanation"
}

IMPORTANT about "technicalMatch" and "portfolioMatch": these are WHOLE NUMBER PERCENTAGES from 0 to 100, like 85 or 40. They are NEVER a decimal fraction like 0.85, and NEVER a score out of 1, 5, or 10. A strong match is a number like 85-95, not 1.`;
}

export function buildProposalPrompt(
  job: JobInputForAnalysis,
  profile: MaxProfile,
  bestProject: string | null,
  reasons: string[],
  options?: { shorter?: boolean; moreHuman?: boolean; differentProject?: string }
) {
  const project =
    (options?.differentProject
      ? profile.projects.find((p) => p.name === options.differentProject)
      : profile.projects.find((p) => p.name === bestProject)) ?? null;

  return `Write a short freelance proposal from ${profile.name} for this Upwork job. It must sound like a real person wrote it quickly, not corporate marketing copy.

Rules:
- 3-6 short paragraphs, simple English
- do not begin every sentence with "I"
- avoid long lists of technologies
- don't say "I'm the perfect fit" or "this is a great fit for me"
- don't invent experience ${profile.name} doesn't have
- use ONE strongest relevant project when useful
- end with the portfolio link: ${profile.portfolio}
- sign off with "Max"
- do not force a rigid identical template every time, vary the wording naturally
${options?.shorter ? "- make it noticeably shorter than a typical proposal, 2-3 short paragraphs" : ""}
${options?.moreHuman ? "- make it sound even more casual and human, less structured" : ""}

Job title: ${job.title}

Job description:
${job.description}

Relevant project to reference (if it fits naturally): ${
    project ? `${project.name} - ${project.description}` : "none in particular"
  }

Why this looks like a good match: ${reasons.join(", ")}

Respond with ONLY the proposal text, no JSON, no headers, no quotes around it.`;
}
