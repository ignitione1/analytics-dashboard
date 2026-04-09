import { DashboardChart } from "@/components/DashboardChart";
import { getDailyAgg, getRecentOrders } from "@/repositories/ordersRepository";

export const dynamic = "force-dynamic";

function toInt(value: unknown) {
  const n = typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function fmtMoney(v: number) {
  return Math.round(v).toLocaleString("ru-RU");
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
}

function DaysPill({ days, active }: { days: number; active: boolean }) {
  const base = "rounded-full px-3 py-1 text-sm transition";
  const cls = active
    ? `${base} bg-zinc-900 text-white`
    : `${base} bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50`;
  return (
    <a className={cls} href={`/?days=${days}`}>
      {days}д
    </a>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const daysRaw = Array.isArray(sp.days) ? sp.days[0] : sp.days;
  const days = toInt(daysRaw) ?? 30;
  const allowed = new Set([7, 30, 90]);
  const safeDays = allowed.has(days) ? days : 30;

  const points = await getDailyAgg(safeDays);
  const recent = await getRecentOrders(10);
  const totalOrders = points.reduce((acc, p) => acc + p.orders_count, 0);
  const totalAmount = points.reduce((acc, p) => acc + p.total_amount_sum, 0);
  const avgCheck = totalOrders > 0 ? totalAmount / totalOrders : 0;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-zinc-50 to-white font-sans text-zinc-900">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Аналитика заказов</h1>
            <p className="text-sm text-zinc-600">Данные из Supabase (последние {safeDays} дней)</p>
          </div>
          <div className="flex items-center gap-2">
            <DaysPill days={7} active={safeDays === 7} />
            <DaysPill days={30} active={safeDays === 30} />
            <DaysPill days={90} active={safeDays === 90} />
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <div className="text-sm text-zinc-600">Заказов</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">{totalOrders}</div>
            <div className="mt-1 text-xs text-zinc-500">за период</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <div className="text-sm text-zinc-600">Сумма</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">{fmtMoney(totalAmount)}</div>
            <div className="mt-1 text-xs text-zinc-500">валюта из заказов</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <div className="text-sm text-zinc-600">Средний чек</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">{fmtMoney(avgCheck)}</div>
            <div className="mt-1 text-xs text-zinc-500">сумма / кол-во</div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium text-zinc-800">Динамика по дням</div>
            <div className="text-xs text-zinc-500">Заказы и сумма</div>
          </div>
          <DashboardChart data={points} />
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium text-zinc-800">Последние заказы</div>
            <div className="text-xs text-zinc-500">{recent.length} шт.</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-xs text-zinc-500">
                  <th className="border-b border-zinc-200 px-3 py-2 font-medium">Дата</th>
                  <th className="border-b border-zinc-200 px-3 py-2 font-medium">External ID</th>
                  <th className="border-b border-zinc-200 px-3 py-2 font-medium">Статус</th>
                  <th className="border-b border-zinc-200 px-3 py-2 font-medium">Город</th>
                  <th className="border-b border-zinc-200 px-3 py-2 text-right font-medium">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.external_id} className="text-sm">
                    <td className="border-b border-zinc-100 px-3 py-2 text-zinc-700">{fmtDateTime(o.created_at)}</td>
                    <td className="border-b border-zinc-100 px-3 py-2 font-mono text-xs text-zinc-800">{o.external_id}</td>
                    <td className="border-b border-zinc-100 px-3 py-2 text-zinc-700">{o.status ?? "—"}</td>
                    <td className="border-b border-zinc-100 px-3 py-2 text-zinc-700">{o.city ?? "—"}</td>
                    <td className="border-b border-zinc-100 px-3 py-2 text-right text-zinc-900">
                      {fmtMoney(Number(o.total_amount ?? 0))} {o.currency ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
