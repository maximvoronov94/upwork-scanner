// Optional Telegram notifications. Never throws when env vars are missing.

export interface TelegramJobNotification {
  title: string;
  ageLabel: string;
  proposalsLabel: string;
  budgetLabel: string;
  matchScore: number;
  reason: string;
  bestProject: string | null;
  url: string | null;
  kind: "APPLY_NOW" | "HIDDEN";
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return false;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  return res.ok;
}

export async function notifyJobOpportunity(job: TelegramJobNotification): Promise<boolean> {
  const emoji = job.kind === "APPLY_NOW" ? "🔥 APPLY NOW" : "👀 HIDDEN OPPORTUNITY";

  const lines = [
    emoji,
    "",
    job.title,
    "",
    `Posted: ${job.ageLabel}`,
    `Proposals: ${job.proposalsLabel}`,
    `Budget: ${job.budgetLabel}`,
    `Match: ${job.matchScore}`,
    "",
    `Reason:\n${job.reason}`,
  ];

  if (job.bestProject) {
    lines.push("", `Best proof:\n${job.bestProject}`);
  }

  if (job.url) {
    lines.push("", `Open Job: ${job.url}`);
  }

  return sendTelegramMessage(lines.join("\n"));
}
