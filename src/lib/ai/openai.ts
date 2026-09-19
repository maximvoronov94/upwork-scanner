import OpenAI from "openai";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey });
}

async function complete(prompt: string, maxTokens: number): Promise<string> {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error("No text response from OpenAI");
  }
  return text;
}

export async function analyzeWithOpenAI(prompt: string): Promise<string> {
  return complete(prompt, 1500);
}

export async function generateProposalWithOpenAI(prompt: string): Promise<string> {
  return complete(prompt, 700);
}
