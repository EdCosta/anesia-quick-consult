create table if not exists public.ai_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  language text not null default 'fr',
  procedure_id text null references public.procedures (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.ai_threads (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  thread_id uuid null references public.ai_threads (id) on delete set null,
  model text not null,
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer not null default 0,
  flags jsonb not null default '[]'::jsonb,
  pii_detected boolean not null default false,
  created_at timestamptz not null default now()
);

alter table if exists public.ai_threads add column if not exists procedure_id text null references public.procedures (id) on delete set null;
alter table if exists public.ai_messages add column if not exists meta jsonb not null default '{}'::jsonb;

create index if not exists ai_threads_user_updated_idx on public.ai_threads (user_id, updated_at desc);
create index if not exists ai_messages_thread_created_idx on public.ai_messages (thread_id, created_at asc);
create index if not exists ai_logs_user_created_idx on public.ai_logs (user_id, created_at desc);

create or replace function public.touch_ai_thread_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ai_threads_touch_updated_at on public.ai_threads;
create trigger ai_threads_touch_updated_at
before update on public.ai_threads
for each row
execute function public.touch_ai_thread_updated_at();

alter table public.ai_threads enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ai_threads' and policyname = 'ai_threads_select_self'
  ) then
    create policy ai_threads_select_self
      on public.ai_threads
      for select
      to authenticated
      using (auth.uid() = user_id or public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ai_threads' and policyname = 'ai_threads_insert_self'
  ) then
    create policy ai_threads_insert_self
      on public.ai_threads
      for insert
      to authenticated
      with check (auth.uid() = user_id or public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ai_threads' and policyname = 'ai_threads_update_self'
  ) then
    create policy ai_threads_update_self
      on public.ai_threads
      for update
      to authenticated
      using (auth.uid() = user_id or public.is_admin(auth.uid()))
      with check (auth.uid() = user_id or public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ai_threads' and policyname = 'ai_threads_delete_self'
  ) then
    create policy ai_threads_delete_self
      on public.ai_threads
      for delete
      to authenticated
      using (auth.uid() = user_id or public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ai_messages' and policyname = 'ai_messages_select_self'
  ) then
    create policy ai_messages_select_self
      on public.ai_messages
      for select
      to authenticated
      using (
        auth.uid() = user_id
        or exists (
          select 1
          from public.ai_threads
          where ai_threads.id = ai_messages.thread_id
            and (ai_threads.user_id = auth.uid() or public.is_admin(auth.uid()))
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ai_messages' and policyname = 'ai_messages_insert_self'
  ) then
    create policy ai_messages_insert_self
      on public.ai_messages
      for insert
      to authenticated
      with check (
        auth.uid() = user_id
        and exists (
          select 1
          from public.ai_threads
          where ai_threads.id = ai_messages.thread_id
            and (ai_threads.user_id = auth.uid() or public.is_admin(auth.uid()))
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ai_messages' and policyname = 'ai_messages_delete_self'
  ) then
    create policy ai_messages_delete_self
      on public.ai_messages
      for delete
      to authenticated
      using (
        auth.uid() = user_id
        or exists (
          select 1
          from public.ai_threads
          where ai_threads.id = ai_messages.thread_id
            and (ai_threads.user_id = auth.uid() or public.is_admin(auth.uid()))
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ai_logs' and policyname = 'ai_logs_select_self'
  ) then
    create policy ai_logs_select_self
      on public.ai_logs
      for select
      to authenticated
      using (auth.uid() = user_id or public.is_admin(auth.uid()));
  end if;
end
$$;
