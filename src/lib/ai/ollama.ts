// Fully local AI provider. No API key required — talks to a local Ollama
// server over HTTP. See README "Ollama setup" for installation.

function getConfig() {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "qwen2.5-coder:7b";
  const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS) || 120_000;
  return { baseUrl, model, timeoutMs };
}

export class OllamaNotRunningError extends Error {
  constructor(baseUrl: string) {
    super(
      `Can't reach Ollama at ${baseUrl}. Start it with \`ollama serve\` and make sure the model is pulled (\`ollama pull ${getConfig().model}\`).`
    );
    this.name = "OllamaNotRunningError";
  }
}

export class OllamaTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Ollama request timed out after ${timeoutMs}ms. The model may still be loading — try again.`);
    this.name = "OllamaTimeoutError";
  }
}

interface ChatOptions {
  /** Ask Ollama to constrain output to valid JSON (used for analysis, not proposals). */
  json?: boolean;
}

async function chat(prompt: string, options: ChatOptions = {}): Promise<string> {
  const { baseUrl, model, timeoutMs } = getConfig();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        ...(options.json ? { format: "json" } : {}),
      }),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new OllamaTimeoutError(timeoutMs);
    }
    throw new OllamaNotRunningError(baseUrl);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ollama request failed (${res.status}): ${text || res.statusText}`);
  }

  const data = await res.json();
  const text = data?.message?.content;
  if (!text) {
    throw new Error("No text response from Ollama");
  }
  return text;
}

export async function analyzeWithOllama(prompt: string): Promise<string> {
  return chat(prompt, { json: true });
}

export async function generateProposalWithOllama(prompt: string): Promise<string> {
  return chat(prompt);
}

export interface OllamaHealth {
  reachable: boolean;
  modelAvailable: boolean;
  baseUrl: string;
  model: string;
  error?: string;
}

export async function checkOllamaHealth(): Promise<OllamaHealth> {
  const { baseUrl, model } = getConfig();

  try {
    const res = await fetch(`${baseUrl}/api/tags`, { method: "GET" });
    if (!res.ok) {
      return { reachable: false, modelAvailable: false, baseUrl, model, error: `Ollama responded with ${res.status}` };
    }
    const data = await res.json();
    const models: string[] = (data?.models ?? []).map((m: { name: string }) => m.name);
    const modelAvailable = models.some((m) => m === model || m.startsWith(`${model}:`) || m.split(":")[0] === model.split(":")[0]);

    return {
      reachable: true,
      modelAvailable,
      baseUrl,
      model,
      error: modelAvailable ? undefined : `Model "${model}" is not pulled. Run: ollama pull ${model}`,
    };
  } catch {
    return {
      reachable: false,
      modelAvailable: false,
      baseUrl,
      model,
      error: `Can't reach Ollama at ${baseUrl}. Start it with: ollama serve`,
    };
  }
}
