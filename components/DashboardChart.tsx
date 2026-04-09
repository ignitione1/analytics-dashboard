"use client";

import {
  Bar,
  ComposedChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  Line,
  XAxis,
  YAxis,
} from "recharts";

export type DashboardPoint = {
  day: string;
  orders_count: number;
  total_amount_sum: number;
};

function formatMoney(v: number) {
  return Math.round(v).toLocaleString("ru-RU");
}

function formatDayLabel(isoDay: string) {
  // YYYY-MM-DD -> DD.MM
  if (isoDay.length >= 10) return `${isoDay.slice(8, 10)}.${isoDay.slice(5, 7)}`;
  return isoDay;
}

function formatDayFull(isoDay: string) {
  // YYYY-MM-DD -> DD.MM.YYYY
  if (isoDay.length >= 10) return `${isoDay.slice(8, 10)}.${isoDay.slice(5, 7)}.${isoDay.slice(0, 4)}`;
  return isoDay;
}

type ChartKey = "orders_count" | "total_amount_sum";

type PayloadEntry = {
  dataKey?: ChartKey;
  value?: number;
};

function CustomTooltip({ active, payload, label }: TooltipProps<number, ChartKey>) {
  if (!active || !payload || payload.length === 0) return null;

  const p = payload as unknown as PayloadEntry[];
  const orders = p.find((x) => x.dataKey === "orders_count")?.value ?? 0;
  const total = p.find((x) => x.dataKey === "total_amount_sum")?.value ?? 0;
  const safeLabel = typeof label === "string" ? formatDayFull(label) : "";

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm">
      <div className="text-xs font-medium text-zinc-900">{safeLabel}</div>
      <div className="mt-1 flex flex-col gap-0.5 text-xs text-zinc-700">
        <div className="flex items-center justify-between gap-6">
          <span>Заказы</span>
          <span className="font-medium text-zinc-900">{orders}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span>Сумма</span>
          <span className="font-medium text-zinc-900">{formatMoney(total)}</span>
        </div>
      </div>
    </div>
  );
}

export function DashboardChart({ data }: { data: DashboardPoint[] }) {
  return (
    <div className="w-full h-[340px] overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 28, bottom: 8, left: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="day"
            tickMargin={10}
            tickFormatter={formatDayLabel}
            stroke="#71717a"
            minTickGap={12}
          />
          <YAxis yAxisId="left" tickMargin={10} stroke="#71717a" />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickMargin={10}
            tickFormatter={formatMoney}
            stroke="#71717a"
            width={72}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={24}
            wrapperStyle={{ paddingLeft: 8, paddingRight: 8 }}
          />

          <Bar
            yAxisId="left"
            dataKey="orders_count"
            name="Заказы"
            fill="#2563eb"
            opacity={0.75}
            radius={[6, 6, 0, 0]}
            barSize={18}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="total_amount_sum"
            name="Сумма"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
