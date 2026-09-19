import { z } from "zod";

export const aiAnalysisSchema = z.object({
  canDo: z.boolean(),
  technicalMatch: z.number().min(0).max(100),
  portfolioMatch: z.number().min(0).max(100),

  category: z.string(),

  bestProject: z.string().nullable(),

  reasons: z.array(z.string()),
  missingSkills: z.array(z.string()),
  risks: z.array(z.string()),
  hardBlockers: z.array(z.string()),

  summary: z.string(),
});

export type AiAnalysis = z.infer<typeof aiAnalysisSchema>;
