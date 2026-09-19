import Anthropic from "@anthropic-ai/sdk";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey });
}

async function complete(prompt: string, maxTokens: number): Promise<string> {
  const client = getClient();
  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content.find((c) => c.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("No text response from Anthropic");
  }
  return block.text;
}

export async function analyzeWithAnthropic(prompt: string): Promise<string> {
  return complete(prompt, 1500);
}

export async function generateProposalWithAnthropic(prompt: string): Promise<string> {
  return complete(prompt, 700);
}
