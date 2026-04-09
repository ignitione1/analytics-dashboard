import { NextRequest, NextResponse } from "next/server";
import { assertInternalAuth } from "@/lib/apiAuth";
import { fetchAllOrders } from "@/services/retailcrm/retailcrmClient";
import { mapRetailCrmOrderToUpsert } from "@/services/retailcrm/ordersMapper";
import { upsertOrders } from "@/repositories/ordersRepository";

export async function POST(req: NextRequest) {
  if (!assertInternalAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orders = await fetchAllOrders();
  const mapped = orders
    .map(mapRetailCrmOrderToUpsert)
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const result = await upsertOrders(mapped);

  return NextResponse.json({ success: true, fetched: orders.length, mapped: mapped.length, ...result });
}
