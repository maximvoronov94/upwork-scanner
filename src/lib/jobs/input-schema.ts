import { z } from "zod";

export const jobImportSchema = z.object({
  externalId: z.string().optional().nullable(),
  url: z.string().url("A valid job URL is required"),

  title: z.string().min(3, "Title is required"),
  description: z.string().min(20, "Description is required"),

  jobType: z.string().optional().nullable(),

  budgetMin: z.coerce.number().optional().nullable(),
  budgetMax: z.coerce.number().optional().nullable(),

  hourlyMin: z.coerce.number().optional().nullable(),
  hourlyMax: z.coerce.number().optional().nullable(),

  currency: z.string().optional().nullable(),

  skills: z.array(z.string()).optional().nullable(),

  proposalsLabel: z.string().optional().nullable(),

  hires: z.coerce.number().int().optional().nullable(),
  interviewing: z.coerce.number().int().optional().nullable(),

  clientCountry: z.string().optional().nullable(),
  clientRating: z.coerce.number().optional().nullable(),
  clientSpent: z.coerce.number().optional().nullable(),
  clientHires: z.coerce.number().int().optional().nullable(),
  paymentVerified: z.boolean().optional().nullable(),

  locationRequirement: z.string().optional().nullable(),
  locationAllowed: z.boolean().optional().nullable(),

  postedAt: z.coerce.date().optional().nullable(),
});

export type JobImportInput = z.infer<typeof jobImportSchema>;
