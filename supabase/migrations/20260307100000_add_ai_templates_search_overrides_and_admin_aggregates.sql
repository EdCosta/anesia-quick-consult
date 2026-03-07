create table if not exists public.ai_prompt_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  prompt text not null,
  language text not null default 'fr',
  procedure_id text null references public.procedures (id) on delete set null,
  procedure_title text null,
  scenario text not null default 'general',
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.search_override_rules (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('redirect', 'synonym')),
  query text not null,
  intent_id text not null,
  route text null,
  notes text null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_prompt_templates_user_updated_idx
  on public.ai_prompt_templates (user_id, updated_at desc);

create index if not exists ai_prompt_templates_language_idx
  on public.ai_prompt_templates (language);

create index if not exists search_override_rules_active_kind_idx
  on public.search_override_rules (active, kind);

create index if not exists search_override_rules_intent_idx
  on public.search_override_rules (intent_id);

create or replace function public.touch_ai_prompt_template_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.touch_search_override_rule_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ai_prompt_templates_touch_updated_at on public.ai_prompt_templates;
create trigger ai_prompt_templates_touch_updated_at
before update on public.ai_prompt_templates
for each row
execute function public.touch_ai_prompt_template_updated_at();

drop trigger if exists search_override_rules_touch_updated_at on public.search_override_rules;
create trigger search_override_rules_touch_updated_at
before update on public.search_override_rules
for each row
execute function public.touch_search_override_rule_updated_at();

alter table public.ai_prompt_templates enable row level security;
alter table public.search_override_rules enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_prompt_templates'
      and policyname = 'ai_prompt_templates_select_self'
  ) then
    create policy ai_prompt_templates_select_self
      on public.ai_prompt_templates
      for select
      to authenticated
      using (auth.uid() = user_id or public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_prompt_templates'
      and policyname = 'ai_prompt_templates_insert_self'
  ) then
    create policy ai_prompt_templates_insert_self
      on public.ai_prompt_templates
      for insert
      to authenticated
      with check (auth.uid() = user_id or public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_prompt_templates'
      and policyname = 'ai_prompt_templates_update_self'
  ) then
    create policy ai_prompt_templates_update_self
      on public.ai_prompt_templates
      for update
      to authenticated
      using (auth.uid() = user_id or public.is_admin(auth.uid()))
      with check (auth.uid() = user_id or public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_prompt_templates'
      and policyname = 'ai_prompt_templates_delete_self'
  ) then
    create policy ai_prompt_templates_delete_self
      on public.ai_prompt_templates
      for delete
      to authenticated
      using (auth.uid() = user_id or public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'search_override_rules'
      and policyname = 'search_override_rules_select_public'
  ) then
    create policy search_override_rules_select_public
      on public.search_override_rules
      for select
      to anon, authenticated
      using (active = true or public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'search_override_rules'
      and policyname = 'search_override_rules_insert_admin'
  ) then
    create policy search_override_rules_insert_admin
      on public.search_override_rules
      for insert
      to authenticated
      with check (public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'search_override_rules'
      and policyname = 'search_override_rules_update_admin'
  ) then
    create policy search_override_rules_update_admin
      on public.search_override_rules
      for update
      to authenticated
      using (public.is_admin(auth.uid()))
      with check (public.is_admin(auth.uid()));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'search_override_rules'
      and policyname = 'search_override_rules_delete_admin'
  ) then
    create policy search_override_rules_delete_admin
      on public.search_override_rules
      for delete
      to authenticated
      using (public.is_admin(auth.uid()));
  end if;
end
$$;

create or replace function public.get_admin_dashboard_summary(p_period_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
  v_days integer := greatest(coalesce(p_period_days, 30), 1);
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Forbidden';
  end if;

  with filtered as (
    select *
    from public.analytics_events
    where created_at >= now() - make_interval(days => v_days)
  ),
  session_days as (
    select session_id, created_at::date as day
    from filtered
    group by session_id, created_at::date
  ),
  session_weeks as (
    select session_id, date_trunc('week', created_at)::date as week
    from filtered
    group by session_id, date_trunc('week', created_at)::date
  ),
  session_first_week as (
    select session_id, min(week) as first_week
    from session_weeks
    group by session_id
  ),
  session_flags as (
    select
      session_id,
      bool_or(event_name = 'home_search') as searched,
      bool_or(event_name = 'procedure_page_view') as viewed_procedure,
      bool_or(event_name like 'public_%') as saw_public_content,
      bool_or(event_name = 'public_procedure_cta_click') as opened_from_public,
      bool_or(
        event_name in (
          'guidelines_upgrade_click',
          'protocols_upgrade_click',
          'alr_upgrade_click',
          'pro_upgrade_click',
          'pro_checkout_view',
          'pro_checkout_start',
          'pro_checkout_success'
        )
      ) as pro_intent,
      count(*) as events_count
    from filtered
    group by session_id
  ),
  cohort_rows as (
    select
      sfw.first_week as week,
      count(*)::int as visitors,
      count(*) filter (
        where exists (
          select 1
          from session_weeks sw1
          where sw1.session_id = sfw.session_id
            and sw1.week = sfw.first_week + interval '7 day'
        )
      )::int as retained_week1,
      count(*) filter (
        where exists (
          select 1
          from session_weeks sw2
          where sw2.session_id = sfw.session_id
            and sw2.week = sfw.first_week + interval '14 day'
        )
      )::int as retained_week2
    from session_first_week sfw
    group by sfw.first_week
  ),
  latest_week as (
    select max(week) as week
    from session_weeks
  )
  select jsonb_build_object(
    'totalEvents', (select count(*)::int from filtered),
    'eventsLast24h', (
      select count(*)::int
      from filtered
      where created_at >= now() - interval '24 hour'
    ),
    'uniqueSessions', (select count(distinct session_id)::int from filtered),
    'returningSessions', (
      select count(*)::int
      from (
        select session_id
        from session_days
        group by session_id
        having count(*) > 1
      ) q
    ),
    'activeDays', (select count(distinct created_at::date)::int from filtered),
    'avgEventsPerSession', (
      select coalesce(round((count(*)::numeric / nullif(count(distinct session_id), 0)) * 10) / 10, 0)
      from filtered
    ),
    'avgEventsPerActiveDay', (
      select coalesce(round((count(*)::numeric / nullif(count(distinct created_at::date), 0)) * 10) / 10, 0)
      from filtered
    ),
    'searchToProcedureSessions', (
      select count(*)::int
      from session_flags
      where searched and viewed_procedure
    ),
    'engagedSessions', (
      select count(*)::int
      from session_flags
      where events_count >= 3
    ),
    'proIntentSessions', (
      select count(*)::int
      from session_flags
      where pro_intent
    ),
    'publicToAppSessions', (
      select count(*)::int
      from session_flags
      where saw_public_content and (opened_from_public or viewed_procedure)
    ),
    'weeklyActiveVisitors', (
      select count(distinct sw.session_id)::int
      from session_weeks sw
      join latest_week lw on lw.week = sw.week
    ),
    'weeklyReturningVisitors', (
      select count(distinct sw.session_id)::int
      from session_weeks sw
      join latest_week lw on lw.week = sw.week
      join session_first_week sfw on sfw.session_id = sw.session_id
      where sfw.first_week <> sw.week
    ),
    'weeklyRepeatRate', (
      with counts as (
        select
          count(distinct sw.session_id)::numeric as active_visitors,
          count(distinct sw.session_id) filter (where sfw.first_week <> sw.week)::numeric as returning_visitors
        from session_weeks sw
        join latest_week lw on lw.week = sw.week
        join session_first_week sfw on sfw.session_id = sw.session_id
      )
      select coalesce(round((returning_visitors / nullif(active_visitors, 0)) * 100), 0)::int
      from counts
    ),
    'avgWeek1Retention', (
      select coalesce(round(avg(case when visitors > 0 then (retained_week1::numeric / visitors) * 100 else 0 end)), 0)::int
      from cohort_rows
      where week + interval '7 day' <= (select week from latest_week)
    ),
    'avgWeek2Retention', (
      select coalesce(round(avg(case when visitors > 0 then (retained_week2::numeric / visitors) * 100 else 0 end)), 0)::int
      from cohort_rows
      where week + interval '14 day' <= (select week from latest_week)
    ),
    'searchCount', (
      select count(*)::int from filtered where event_name = 'home_search'
    ),
    'zeroResultSearchCount', (
      select count(*)::int
      from filtered
      where event_name = 'home_search'
        and coalesce((meta ->> 'results')::int, 0) = 0
    ),
    'procedureViews', (
      select count(*)::int from filtered where event_name = 'procedure_page_view'
    ),
    'upgradeCount', (
      select count(*)::int
      from filtered
      where event_name in (
        'guidelines_upgrade_click',
        'protocols_upgrade_click',
        'alr_upgrade_click',
        'pro_upgrade_click'
      )
    ),
    'topPaths', coalesce((
      select jsonb_agg(jsonb_build_array(path, count_value))
      from (
        select path, count(*)::int as count_value
        from filtered
        group by path
        order by count_value desc, path asc
        limit 6
      ) ranked_paths
    ), '[]'::jsonb),
    'topSearches', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'query', query,
          'count', count_value,
          'results', max_results
        )
      )
      from (
        select
          meta ->> 'query' as query,
          count(*)::int as count_value,
          max(coalesce((meta ->> 'results')::int, 0))::int as max_results
        from filtered
        where event_name = 'home_search'
          and coalesce(meta ->> 'query', '') <> ''
        group by meta ->> 'query'
        order by count_value desc, query asc
        limit 6
      ) ranked_searches
    ), '[]'::jsonb),
    'topZeroResultSearches', coalesce((
      select jsonb_agg(jsonb_build_array(query, count_value))
      from (
        select
          meta ->> 'query' as query,
          count(*)::int as count_value
        from filtered
        where event_name = 'home_search'
          and coalesce(meta ->> 'query', '') <> ''
          and coalesce((meta ->> 'results')::int, 0) = 0
        group by meta ->> 'query'
        order by count_value desc, query asc
        limit 6
      ) ranked_zero
    ), '[]'::jsonb),
    'topLowResultSearches', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'query', query,
          'count', count_value,
          'bestResults', best_results
        )
      )
      from (
        select
          meta ->> 'query' as query,
          count(*)::int as count_value,
          max(coalesce((meta ->> 'results')::int, 0))::int as best_results
        from filtered
        where event_name = 'home_search'
          and coalesce(meta ->> 'query', '') <> ''
          and coalesce((meta ->> 'results')::int, 0) between 1 and 2
        group by meta ->> 'query'
        order by count_value desc, query asc
        limit 6
      ) ranked_low
    ), '[]'::jsonb),
    'topProcedures', coalesce((
      select jsonb_agg(jsonb_build_array(procedure_id, count_value))
      from (
        select
          meta ->> 'procedureId' as procedure_id,
          count(*)::int as count_value
        from filtered
        where event_name = 'procedure_page_view'
          and coalesce(meta ->> 'procedureId', '') <> ''
        group by meta ->> 'procedureId'
        order by count_value desc, procedure_id asc
        limit 6
      ) ranked_procedures
    ), '[]'::jsonb),
    'upgradeClicks', coalesce((
      select jsonb_agg(jsonb_build_array(event_name, count_value))
      from (
        select event_name, count(*)::int as count_value
        from filtered
        where event_name in (
          'guidelines_upgrade_click',
          'protocols_upgrade_click',
          'alr_upgrade_click',
          'pro_upgrade_click'
        )
        group by event_name
        order by count_value desc, event_name asc
      ) ranked_upgrades
    ), '[]'::jsonb),
    'topLanguages', coalesce((
      select jsonb_agg(jsonb_build_array(language, count_value))
      from (
        select coalesce(language, 'unknown') as language, count(*)::int as count_value
        from filtered
        group by coalesce(language, 'unknown')
        order by count_value desc, language asc
        limit 3
      ) ranked_languages
    ), '[]'::jsonb),
    'cohortRows', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'week', to_char(week, 'YYYY-MM-DD'),
          'label', to_char(week, 'Mon DD'),
          'visitors', visitors,
          'retainedWeek1', retained_week1,
          'retainedWeek2', retained_week2,
          'retainedWeek1Rate', case when visitors > 0 then round((retained_week1::numeric / visitors) * 100) else 0 end,
          'retainedWeek2Rate', case when visitors > 0 then round((retained_week2::numeric / visitors) * 100) else 0 end
        )
      )
      from (
        select *
        from cohort_rows
        order by week desc
        limit 6
      ) ranked_cohorts
    ), '[]'::jsonb)
  )
  into v_result;

  return coalesce(v_result, '{}'::jsonb);
end;
$$;

create or replace function public.get_admin_pro_conversion_summary(
  p_period_days integer default 30,
  p_surface text default null,
  p_source text default null,
  p_campaign text default null,
  p_segment text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
  v_days integer := greatest(coalesce(p_period_days, 30), 1);
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Forbidden';
  end if;

  with base as (
    select
      session_id,
      event_name,
      created_at,
      path,
      coalesce(language, 'unknown') as language,
      coalesce(meta ->> 'surface', path, 'unknown') as surface,
      coalesce(meta ->> 'source', 'unknown') as source,
      coalesce(meta ->> 'campaign', 'none') as campaign,
      case
        when coalesce(meta ->> 'source', 'unknown') in (
          'account',
          'pricing',
          'guidelines',
          'protocols',
          'alr',
          'pro_gate',
          'pro_feature_page',
          'public_procedure',
          'public_specialty',
          'public_topic',
          'header_plan_badge',
          'header_view_mode',
          'calculators'
        ) then 'internal_navigation'
        when coalesce(meta ->> 'source', 'unknown') = 'direct'
          and coalesce(meta ->> 'referrer_host', '') = ''
          and coalesce(meta ->> 'campaign', '') = ''
          and coalesce(meta ->> 'medium', '') = '' then 'direct'
        else 'external_acquisition'
      end as segment,
      case
        when event_name = 'pro_preview_view' then 'preview'
        when event_name in (
          'pro_upgrade_click',
          'guidelines_upgrade_click',
          'protocols_upgrade_click',
          'alr_upgrade_click'
        ) then 'click'
        when event_name in ('pro_checkout_view', 'pro_checkout_start') then 'checkout'
        when event_name = 'pro_checkout_success' then 'success'
        else null
      end as stage
    from public.analytics_events
    where created_at >= now() - make_interval(days => v_days)
      and event_name in (
        'pro_preview_view',
        'pro_upgrade_click',
        'guidelines_upgrade_click',
        'protocols_upgrade_click',
        'alr_upgrade_click',
        'pro_checkout_view',
        'pro_checkout_start',
        'pro_checkout_success'
      )
  ),
  filtered as (
    select *
    from base
    where stage is not null
      and (p_surface is null or surface = p_surface)
      and (p_source is null or source = p_source)
      and (p_campaign is null or campaign = p_campaign)
      and (p_segment is null or segment = p_segment)
  )
  select jsonb_build_object(
    'previewSessions', (
      select count(distinct session_id)::int from filtered where stage = 'preview'
    ),
    'clickSessions', (
      select count(distinct session_id)::int from filtered where stage = 'click'
    ),
    'checkoutSessions', (
      select count(distinct session_id)::int from filtered where stage = 'checkout'
    ),
    'successSessions', (
      select count(distinct session_id)::int from filtered where stage = 'success'
    ),
    'surfaces', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'surface', surface,
          'preview', preview_count,
          'click', click_count,
          'checkout', checkout_count,
          'success', success_count
        )
        order by preview_count desc, click_count desc
      )
      from (
        select
          surface,
          count(distinct session_id) filter (where stage = 'preview')::int as preview_count,
          count(distinct session_id) filter (where stage = 'click')::int as click_count,
          count(distinct session_id) filter (where stage = 'checkout')::int as checkout_count,
          count(distinct session_id) filter (where stage = 'success')::int as success_count
        from filtered
        group by surface
      ) grouped_surfaces
    ), '[]'::jsonb),
    'languages', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'language', language,
          'preview', preview_count,
          'click', click_count,
          'checkout', checkout_count,
          'success', success_count
        )
        order by preview_count desc, click_count desc
      )
      from (
        select
          language,
          count(distinct session_id) filter (where stage = 'preview')::int as preview_count,
          count(distinct session_id) filter (where stage = 'click')::int as click_count,
          count(distinct session_id) filter (where stage = 'checkout')::int as checkout_count,
          count(distinct session_id) filter (where stage = 'success')::int as success_count
        from filtered
        group by language
      ) grouped_languages
    ), '[]'::jsonb),
    'trend', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'day', day_key,
          'preview', preview_count,
          'click', click_count,
          'checkout', checkout_count,
          'success', success_count
        )
        order by day_key asc
      )
      from (
        select
          to_char(created_at::date, 'YYYY-MM-DD') as day_key,
          count(distinct session_id) filter (where stage = 'preview')::int as preview_count,
          count(distinct session_id) filter (where stage = 'click')::int as click_count,
          count(distinct session_id) filter (where stage = 'checkout')::int as checkout_count,
          count(distinct session_id) filter (where stage = 'success')::int as success_count
        from filtered
        group by created_at::date
      ) grouped_days
    ), '[]'::jsonb),
    'sources', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'source', source,
          'preview', preview_count,
          'click', click_count,
          'checkout', checkout_count,
          'success', success_count
        )
        order by preview_count desc, click_count desc
      )
      from (
        select
          source,
          count(distinct session_id) filter (where stage = 'preview')::int as preview_count,
          count(distinct session_id) filter (where stage = 'click')::int as click_count,
          count(distinct session_id) filter (where stage = 'checkout')::int as checkout_count,
          count(distinct session_id) filter (where stage = 'success')::int as success_count
        from filtered
        group by source
      ) grouped_sources
    ), '[]'::jsonb),
    'campaigns', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'campaign', campaign,
          'preview', preview_count,
          'click', click_count,
          'checkout', checkout_count,
          'success', success_count
        )
        order by preview_count desc, click_count desc
      )
      from (
        select
          campaign,
          count(distinct session_id) filter (where stage = 'preview')::int as preview_count,
          count(distinct session_id) filter (where stage = 'click')::int as click_count,
          count(distinct session_id) filter (where stage = 'checkout')::int as checkout_count,
          count(distinct session_id) filter (where stage = 'success')::int as success_count
        from filtered
        group by campaign
      ) grouped_campaigns
    ), '[]'::jsonb),
    'segments', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'segment', segment,
          'preview', preview_count,
          'click', click_count,
          'checkout', checkout_count,
          'success', success_count
        )
        order by preview_count desc, click_count desc
      )
      from (
        select
          segment,
          count(distinct session_id) filter (where stage = 'preview')::int as preview_count,
          count(distinct session_id) filter (where stage = 'click')::int as click_count,
          count(distinct session_id) filter (where stage = 'checkout')::int as checkout_count,
          count(distinct session_id) filter (where stage = 'success')::int as success_count
        from filtered
        group by segment
      ) grouped_segments
    ), '[]'::jsonb)
  )
  into v_result;

  return coalesce(v_result, '{}'::jsonb);
end;
$$;
