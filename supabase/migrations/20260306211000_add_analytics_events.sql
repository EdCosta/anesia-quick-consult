create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_name text not null,
  path text not null,
  language text null,
  meta jsonb null default '{}'::jsonb,
  user_agent text null,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

create policy "analytics_events_insert_public"
on public.analytics_events
for insert
to anon, authenticated
with check (true);

create index if not exists analytics_events_created_at_idx
on public.analytics_events (created_at desc);

create index if not exists analytics_events_name_idx
on public.analytics_events (event_name);
