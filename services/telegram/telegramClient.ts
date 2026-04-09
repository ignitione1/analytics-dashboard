import { env } from "@/lib/env";
import { HttpError, safeJson } from "@/lib/http";

export async function sendTelegramMessage(text: string) {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const details = await safeJson(res);
    throw new HttpError("Telegram sendMessage failed", res.status, details);
  }

  const data = (await res.json()) as { ok: boolean; description?: string };
  if (!data.ok) {
    throw new HttpError(data.description || "Telegram returned ok=false", 502, data);
  }
}
