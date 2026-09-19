import { aiAnalysisSchema, type AiAnalysis } from "@/lib/ai/schemas";
import { buildRepairPrompt } from "@/lib/ai/prompts";
import { analyzeWithAnthropic, generateProposalWithAnthropic } from "@/lib/ai/anthropic";
import { analyzeWithOpenAI, generateProposalWithOpenAI } from "@/lib/ai/openai";
import { analyzeWithOllama, generateProposalWithOllama } from "@/lib/ai/ollama";

export type AiProviderName = "anthropic" | "openai" | "ollama";

export function getAiProvider(): AiProviderName {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  if (provider === "openai") return "openai";
  if (provider === "anthropic") return "anthropic";
  return "ollama";
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  return JSON.parse(candidate);
}

// Weaker/local models sometimes ignore the "0-100" instruction and return a
// 0-1 fraction or a 0-5/0-10 score instead. Normalize obvious cases rather
// than letting a technically-valid-but-wrong-scale number sink the job.
function normalizeMatchScore(value: number): number {
  if (value >= 0 && value <= 1) return Math.round(value * 100);
  if (value > 1 && value <= 5) return Math.round((value / 5) * 100);
  if (value > 5 && value <= 10) return Math.round((value / 10) * 100);
  return Math.round(Math.max(0, Math.min(100, value)));
}

async function parseAnalysis(raw: string): Promise<AiAnalysis> {
  const json = extractJson(raw);
  const parsed = aiAnalysisSchema.parse(json);
  return {
    ...parsed,
    technicalMatch: normalizeMatchScore(parsed.technicalMatch),
    portfolioMatch: normalizeMatchScore(parsed.portfolioMatch),
  };
}

const ANALYZE_CALLS: Record<AiProviderName, (prompt: string) => Promise<string>> = {
  anthropic: analyzeWithAnthropic,
  openai: analyzeWithOpenAI,
  ollama: analyzeWithOllama,
};

const PROPOSAL_CALLS: Record<AiProviderName, (prompt: string) => Promise<string>> = {
  anthropic: generateProposalWithAnthropic,
  openai: generateProposalWithOpenAI,
  ollama: generateProposalWithOllama,
};

export async function analyzeJob(prompt: string): Promise<AiAnalysis> {
  const call = ANALYZE_CALLS[getAiProvider()];

  // Network/timeout/config errors (e.g. Ollama not running) propagate immediately —
  // retrying with a repair prompt only makes sense for a malformed-but-received response.
  const raw = await call(prompt);

  try {
    return await parseAnalysis(raw);
  } catch {
    const repaired = await call(buildRepairPrompt(raw));
    return await parseAnalysis(repaired);
  }
}

export async function generateProposal(prompt: string): Promise<string> {
  const call = PROPOSAL_CALLS[getAiProvider()];
  return call(prompt);
}
