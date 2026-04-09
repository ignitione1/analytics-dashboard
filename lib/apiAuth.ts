import { env } from "@/lib/env";
import { NextRequest } from "next/server";

export function assertInternalAuth(req: NextRequest) {
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  if (isVercelCron) return true;

  const headerKey = req.headers.get("x-internal-api-key");
  const queryKey = req.nextUrl.searchParams.get("key");

  const provided = headerKey || queryKey;
  if (!provided || provided !== env.INTERNAL_API_KEY) {
    return false;
  }

  return true;
}
