import { NextRequest, NextResponse } from "next/server";
import { assertInternalAuth } from "@/lib/apiAuth";
import { env } from "@/lib/env";
import { supabaseServer } from "@/lib/supabaseServer";
import { hasAlert, insertAlert } from "@/repositories/alertsRepository";
import { sendTelegramMessage } from "@/services/telegram/telegramClient";

type OrderRow = {
  external_id: string;
  created_at: string;
  total_amount: number | null;
  currency: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  city: string | null;
};

export async function POST(req: NextRequest) {
  if (!assertInternalAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const threshold = env.ALERT_THRESHOLD_KZT;

  const { data, error } = await supabaseServer
    .from("orders")
    .select("external_id,created_at,total_amount,currency,customer_email,customer_phone,city")
    .gt("total_amount", threshold)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw error;

  let sent = 0;
  const checked = data?.length ?? 0;

  for (const order of (data ?? []) as OrderRow[]) {
    const kind = "telegram_high_total" as const;
    const already = await hasAlert(order.external_id, kind);
    if (already) continue;

    const amount = order.total_amount ?? 0;
    const currency = order.currency ?? "KZT";

    const text =
      `<b>Новый заказ выше порога</b>\n` +
      `externalId: <code>${order.external_id}</code>\n` +
      `sum: <b>${amount}</b> ${currency}\n` +
      (order.city ? `city: ${order.city}\n` : "") +
      (order.customer_phone ? `phone: ${order.customer_phone}\n` : "") +
      (order.customer_email ? `email: ${order.customer_email}\n` : "");

    await sendTelegramMessage(text);
    await insertAlert({ order_external_id: order.external_id, kind });
    sent++;
  }

  return NextResponse.json({ success: true, threshold, checked, sent });
}
