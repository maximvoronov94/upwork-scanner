import { NextResponse } from "next/server";
import { getAiProvider } from "@/lib/ai/provider";
import { checkOllamaHealth } from "@/lib/ai/ollama";

export async function GET() {
  const provider = getAiProvider();

  if (provider !== "ollama") {
    const hasKey =
      provider === "anthropic" ? Boolean(process.env.ANTHROPIC_API_KEY) : Boolean(process.env.OPENAI_API_KEY);

    return NextResponse.json({
      provider,
      ok: hasKey,
      error: hasKey ? undefined : `${provider === "anthropic" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY"} is not set`,
    });
  }

  const health = await checkOllamaHealth();

  return NextResponse.json(
    {
      provider: "ollama",
      ok: health.reachable && health.modelAvailable,
      baseUrl: health.baseUrl,
      model: health.model,
      reachable: health.reachable,
      modelAvailable: health.modelAvailable,
      error: health.error,
    },
    { status: health.reachable && health.modelAvailable ? 200 : 503 }
  );
}
