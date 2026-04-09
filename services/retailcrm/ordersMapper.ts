import type { RetailCrmOrder } from "@/services/retailcrm/retailcrmClient";
import type { OrderUpsert } from "@/repositories/ordersRepository";

function pickPhone(order: RetailCrmOrder): string | null {
  if (order.phone) return String(order.phone);
  const cPhones = order.customer?.phones;
  const n = cPhones?.[0]?.number;
  return n ? String(n) : null;
}

function pickEmail(order: RetailCrmOrder): string | null {
  if (order.email) return String(order.email);
  const e = order.customer?.email;
  return e ? String(e) : null;
}

export function mapRetailCrmOrderToUpsert(order: RetailCrmOrder): OrderUpsert | null {
  const externalId = order.externalId;
  const createdAt = order.createdAt;

  if (!externalId || !createdAt) return null;

  const city = order.delivery?.address?.city ? String(order.delivery.address.city) : null;

  return {
    external_id: String(externalId),
    created_at: String(createdAt).replace(" ", "T") + (String(createdAt).includes("T") ? "" : "Z"),
    status: order.status ? String(order.status) : null,
    total_amount: order.totalSumm !== undefined ? Number(order.totalSumm) : null,
    currency: order.currency ? String(order.currency) : null,
    customer_phone: pickPhone(order),
    customer_email: pickEmail(order),
    city,
    utm_source: null,
    raw: order,
  };
}
