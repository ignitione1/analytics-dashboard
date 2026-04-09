import { supabaseServer } from "@/lib/supabaseServer";

export type AlertInsert = {
  order_external_id: string;
  kind: "telegram_high_total";
};

export async function hasAlert(orderExternalId: string, kind: AlertInsert["kind"]) {
  const { data, error } = await supabaseServer
    .from("order_alerts")
    .select("id")
    .eq("order_external_id", orderExternalId)
    .eq("kind", kind)
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function insertAlert(row: AlertInsert) {
  const { error } = await supabaseServer.from("order_alerts").insert(row);
  if (error) throw error;
}
