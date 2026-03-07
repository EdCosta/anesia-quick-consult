create table if not exists public.user_ui_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  ai_response_mode text not null default 'plan',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_user_ui_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_ui_preferences_touch_updated_at on public.user_ui_preferences;
create trigger user_ui_preferences_touch_updated_at
before update on public.user_ui_preferences
for each row
execute function public.touch_user_ui_preferences_updated_at();

alter table public.user_ui_preferences enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_ui_preferences'
      and policyname = 'user_ui_preferences_select_self'
  ) then
    create policy user_ui_preferences_select_self
      on public.user_ui_preferences
      for select
      to authenticated
      using (auth.uid() = user_id or public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_ui_preferences'
      and policyname = 'user_ui_preferences_insert_self'
  ) then
    create policy user_ui_preferences_insert_self
      on public.user_ui_preferences
      for insert
      to authenticated
      with check (auth.uid() = user_id or public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_ui_preferences'
      and policyname = 'user_ui_preferences_update_self'
  ) then
    create policy user_ui_preferences_update_self
      on public.user_ui_preferences
      for update
      to authenticated
      using (auth.uid() = user_id or public.is_admin(auth.uid()))
      with check (auth.uid() = user_id or public.is_admin(auth.uid()));
  end if;
end
$$;
