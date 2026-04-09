import { supabaseServer } from "@/lib/supabaseServer";

export type OrdersDailyAggRow = {
  day: string; // YYYY-MM-DD
  orders_count: number;
  total_amount_sum: number;
};

export type OrderUpsert = {
  external_id: string;
  created_at: string;
  status?: string | null;
  total_amount?: number | null;
  currency?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  city?: string | null;
  utm_source?: string | null;
  raw: unknown;
};

export async function upsertOrders(rows: OrderUpsert[]) {
  if (rows.length === 0) return { upserted: 0 };

  const { error } = await supabaseServer
    .from("orders")
    .upsert(rows, { onConflict: "external_id" });

  if (error) throw error;

  return { upserted: rows.length };
}

export async function getDailyAgg(days: number): Promise<OrdersDailyAggRow[]> {
  const from = new Date();
  from.setDate(from.getDate() - Math.max(1, days) + 1);
  from.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseServer
    .from("orders")
    .select("created_at,total_amount")
    .gte("created_at", from.toISOString())
    .order("created_at", { ascending: true });

  if (error) throw error;

  const map = new Map<string, { orders_count: number; total_amount_sum: number }>();

  for (const row of data ?? []) {
    const day = new Date(row.created_at).toISOString().slice(0, 10);
    const curr = map.get(day) ?? { orders_count: 0, total_amount_sum: 0 };
    curr.orders_count += 1;
    curr.total_amount_sum += Number(row.total_amount ?? 0);
    map.set(day, curr);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, v]) => ({ day, orders_count: v.orders_count, total_amount_sum: v.total_amount_sum }));
}

export type RecentOrderRow = {
  external_id: string;
  created_at: string;
  status: string | null;
  total_amount: number | null;
  currency: string | null;
  city: string | null;
};

export async function getRecentOrders(limit: number): Promise<RecentOrderRow[]> {
  const { data, error } = await supabaseServer
    .from("orders")
    .select("external_id,created_at,status,total_amount,currency,city")
    .order("created_at", { ascending: false })
    .limit(Math.max(1, Math.min(200, limit)));

  if (error) throw error;

  return (data ?? []) as RecentOrderRow[];
}
