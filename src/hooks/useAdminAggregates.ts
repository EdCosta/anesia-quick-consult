import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

type Pair = [string, number];
type SearchStats = {
  query: string;
  count: number;
  results?: number;
  bestResults?: number;
};
type CohortRow = {
  week: string;
  label: string;
  visitors: number;
  retainedWeek1: number;
  retainedWeek2: number;
  retainedWeek1Rate: number;
  retainedWeek2Rate: number;
};
type ConversionBreakdown = {
  preview: number;
  click: number;
  checkout: number;
  success: number;
};

export type AdminDashboardAggregate = {
  totalEvents: number;
  eventsLast24h: number;
  uniqueSessions: number;
  returningSessions: number;
  activeDays: number;
  avgEventsPerSession: number;
  avgEventsPerActiveDay: number;
  searchToProcedureSessions: number;
  engagedSessions: number;
  proIntentSessions: number;
  publicToAppSessions: number;
  weeklyActiveVisitors: number;
  weeklyReturningVisitors: number;
  weeklyRepeatRate: number;
  avgWeek1Retention: number;
  avgWeek2Retention: number;
  searchCount: number;
  zeroResultSearchCount: number;
  procedureViews: number;
  upgradeCount: number;
  topPaths: Pair[];
  topSearches: SearchStats[];
  topZeroResultSearches: Pair[];
  topLowResultSearches: SearchStats[];
  topProcedures: Pair[];
  upgradeClicks: Pair[];
  topLanguages: Pair[];
  cohortRows: CohortRow[];
};

export type AdminConversionAggregate = {
  previewSessions: number;
  clickSessions: number;
  checkoutSessions: number;
  successSessions: number;
  surfaces: Array<{ surface: string } & ConversionBreakdown>;
  languages: Array<{ language: string } & ConversionBreakdown>;
  trend: Array<{ day: string } & ConversionBreakdown>;
  sources: Array<{ source: string } & ConversionBreakdown>;
  campaigns: Array<{ campaign: string } & ConversionBreakdown>;
  segments: Array<{ segment: string } & ConversionBreakdown>;
};

function asRecord(value: Json | null): Record<string, Json> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : {};
}

function asNumber(value: Json | undefined) {
  return typeof value === 'number' ? value : 0;
}

function asString(value: Json | undefined) {
  return typeof value === 'string' ? value : '';
}

function parsePairArray(value: Json | undefined): Pair[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!Array.isArray(entry) || entry.length < 2) return null;
      return [String(entry[0]), Number(entry[1]) || 0] as Pair;
    })
    .filter((entry): entry is Pair => !!entry);
}

function parseObjectArray<T>(value: Json | undefined, mapper: (record: Record<string, Json>) => T | null) {
  if (!Array.isArray(value)) return [] as T[];
  return value
    .map((entry) => (entry && typeof entry === 'object' && !Array.isArray(entry) ? mapper(entry as Record<string, Json>) : null))
    .filter((entry): entry is T => !!entry);
}

function parseDashboardAggregate(payload: Json | null): AdminDashboardAggregate {
  const record = asRecord(payload);

  return {
    totalEvents: asNumber(record.totalEvents),
    eventsLast24h: asNumber(record.eventsLast24h),
    uniqueSessions: asNumber(record.uniqueSessions),
    returningSessions: asNumber(record.returningSessions),
    activeDays: asNumber(record.activeDays),
    avgEventsPerSession: asNumber(record.avgEventsPerSession),
    avgEventsPerActiveDay: asNumber(record.avgEventsPerActiveDay),
    searchToProcedureSessions: asNumber(record.searchToProcedureSessions),
    engagedSessions: asNumber(record.engagedSessions),
    proIntentSessions: asNumber(record.proIntentSessions),
    publicToAppSessions: asNumber(record.publicToAppSessions),
    weeklyActiveVisitors: asNumber(record.weeklyActiveVisitors),
    weeklyReturningVisitors: asNumber(record.weeklyReturningVisitors),
    weeklyRepeatRate: asNumber(record.weeklyRepeatRate),
    avgWeek1Retention: asNumber(record.avgWeek1Retention),
    avgWeek2Retention: asNumber(record.avgWeek2Retention),
    searchCount: asNumber(record.searchCount),
    zeroResultSearchCount: asNumber(record.zeroResultSearchCount),
    procedureViews: asNumber(record.procedureViews),
    upgradeCount: asNumber(record.upgradeCount),
    topPaths: parsePairArray(record.topPaths),
    topSearches: parseObjectArray(record.topSearches, (entry) => ({
      query: asString(entry.query),
      count: asNumber(entry.count),
      results: asNumber(entry.results),
    })),
    topZeroResultSearches: parsePairArray(record.topZeroResultSearches),
    topLowResultSearches: parseObjectArray(record.topLowResultSearches, (entry) => ({
      query: asString(entry.query),
      count: asNumber(entry.count),
      bestResults: asNumber(entry.bestResults),
    })),
    topProcedures: parsePairArray(record.topProcedures),
    upgradeClicks: parsePairArray(record.upgradeClicks),
    topLanguages: parsePairArray(record.topLanguages),
    cohortRows: parseObjectArray(record.cohortRows, (entry) => ({
      week: asString(entry.week),
      label: asString(entry.label),
      visitors: asNumber(entry.visitors),
      retainedWeek1: asNumber(entry.retainedWeek1),
      retainedWeek2: asNumber(entry.retainedWeek2),
      retainedWeek1Rate: asNumber(entry.retainedWeek1Rate),
      retainedWeek2Rate: asNumber(entry.retainedWeek2Rate),
    })),
  };
}

function parseBreakdownArray<T extends string>(value: Json | undefined, key: T) {
  return parseObjectArray(value, (entry) => ({
    [key]: asString(entry[key]),
    preview: asNumber(entry.preview),
    click: asNumber(entry.click),
    checkout: asNumber(entry.checkout),
    success: asNumber(entry.success),
  })) as Array<Record<T, string> & ConversionBreakdown>;
}

function parseConversionAggregate(payload: Json | null): AdminConversionAggregate {
  const record = asRecord(payload);

  return {
    previewSessions: asNumber(record.previewSessions),
    clickSessions: asNumber(record.clickSessions),
    checkoutSessions: asNumber(record.checkoutSessions),
    successSessions: asNumber(record.successSessions),
    surfaces: parseBreakdownArray(record.surfaces, 'surface'),
    languages: parseBreakdownArray(record.languages, 'language'),
    trend: parseBreakdownArray(record.trend, 'day'),
    sources: parseBreakdownArray(record.sources, 'source'),
    campaigns: parseBreakdownArray(record.campaigns, 'campaign'),
    segments: parseBreakdownArray(record.segments, 'segment'),
  };
}

export function useAdminDashboardAggregate(periodDays: number) {
  return useQuery({
    queryKey: ['admin-dashboard-aggregate', periodDays],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_dashboard_summary', {
        p_period_days: periodDays,
      });

      if (error) {
        throw error;
      }

      return parseDashboardAggregate(data);
    },
    staleTime: 30_000,
  });
}

export function useAdminConversionAggregate(params: {
  periodDays: number;
  surface?: string | null;
  source?: string | null;
  campaign?: string | null;
  segment?: string | null;
}) {
  return useQuery({
    queryKey: ['admin-conversion-aggregate', params],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_pro_conversion_summary', {
        p_period_days: params.periodDays,
        p_surface: params.surface || null,
        p_source: params.source || null,
        p_campaign: params.campaign || null,
        p_segment: params.segment || null,
      });

      if (error) {
        throw error;
      }

      return parseConversionAggregate(data);
    },
    staleTime: 30_000,
  });
}
