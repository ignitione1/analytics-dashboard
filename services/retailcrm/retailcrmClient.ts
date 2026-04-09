import { env } from "@/lib/env";
import { HttpError, safeJson } from "@/lib/http";

export type RetailCrmOrder = Record<string, unknown> & {
  externalId?: string;
  createdAt?: string;
  status?: string;
  totalSumm?: number | string;
  currency?: string;
  phone?: string;
  email?: string;
  delivery?: { address?: { city?: string } };
  customer?: { phones?: Array<{ number?: string }>; email?: string };
};

type RetailCrmOrdersResponse = {
  success: boolean;
  orders?: RetailCrmOrder[];
  pagination?: { totalPageCount?: number; currentPage?: number };
  errorMsg?: string;
  errors?: string[];
};

function buildUrl(path: string, params: Record<string, string | number | undefined>) {
  const base = env.RETAILCRM_URL.replace(/\/$/, "");
  const url = new URL(base + path);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }
  return url.toString();
}

export async function fetchOrdersPage(page: number, limit = 100): Promise<RetailCrmOrdersResponse> {
  const url = buildUrl("/api/v5/orders", {
    apiKey: env.RETAILCRM_API_KEY,
    site: env.RETAILCRM_SITE_CODE,
    page,
    limit,
  });

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) {
    const details = await safeJson(res);
    throw new HttpError("RetailCRM request failed", res.status, details);
  }

  const data = (await res.json()) as RetailCrmOrdersResponse;
  if (!data.success) {
    throw new HttpError(data.errorMsg || "RetailCRM returned success=false", 502, data);
  }

  return data;
}

export async function fetchAllOrders(maxPages = 50): Promise<RetailCrmOrder[]> {
  const result: RetailCrmOrder[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const data = await fetchOrdersPage(page, 100);
    const orders = data.orders ?? [];
    result.push(...orders);

    const totalPages = data.pagination?.totalPageCount;
    if (totalPages !== undefined && page >= totalPages) break;

    // If pagination is missing, fall back to empty page stop.
    if (orders.length === 0) break;
  }

  return result;
}
