import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getOrCreateSettings } from "@/lib/jobs/analyzer";

const settingsSchema = z.object({
  minimumMatch: z.coerce.number().int().min(0).max(100).optional(),
  fastMatchMinimum: z.coerce.number().int().min(0).max(100).optional(),
  hiddenMatchMinimum: z.coerce.number().int().min(0).max(100).optional(),

  maximumFastAgeMinutes: z.coerce.number().int().min(0).optional(),
  maximumHiddenAgeMinutes: z.coerce.number().int().min(0).optional(),

  maximumFastProposals: z.coerce.number().int().min(0).optional(),
  maximumHiddenProposals: z.coerce.number().int().min(0).optional(),

  minimumHourly: z.coerce.number().nullable().optional(),
  minimumFixedBudget: z.coerce.number().nullable().optional(),

  telegramEnabled: z.boolean().optional(),
  aiProvider: z.enum(["anthropic", "openai", "ollama"]).optional(),
});

export async function GET() {
  const settings = await getOrCreateSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await getOrCreateSettings();
  const settings = await db.appSettings.update({
    where: { id: existing.id },
    data: parsed.data,
  });

  return NextResponse.json({ settings });
}
