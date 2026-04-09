create table if not exists public.order_alerts (
  id uuid primary key default gen_random_uuid(),
  order_external_id text not null,
  kind text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists order_alerts_order_kind_unique
  on public.order_alerts (order_external_id, kind);
