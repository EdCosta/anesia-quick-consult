import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Crown, Activity, RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getSearchActionRecommendations,
  getSearchRedirectSuggestions,
} from '@/lib/searchIntelligence';

const cards = [
  {
    title: 'Import procedures',
    description: 'Upload semicolon CSV and update the procedures knowledge base.',
    to: '/admin/import/procedures',
  },
  {
    title: 'Import guidelines',
    description: 'Reserved for guideline payload imports and future structured updates.',
    to: '/admin/import/guidelines',
  },
  {
    title: 'Import logs',
    description: 'Review previous imports, counts, and stored validation errors.',
    to: '/admin/logs',
  },
  {
    title: 'Pro conversion',
    description: 'Track the Pro funnel from preview to checkout success.',
    to: '/admin/conversion',
  },
];

type AnalyticsRow = {
  id: string;
  event_name: string;
  path: string;
  language: string | null;
  meta: Json | null;
  session_id: string;
  created_at: string;
};

type EventFilter = 'all' | 'searches' | 'procedure_views' | 'upgrade_clicks' | 'public_pages';
type SessionFlags = {
  searched: boolean;
  viewedProcedure: boolean;
  sawPublicContent: boolean;
  openedFromPublic: boolean;
  proIntent: boolean;
};

const PERIOD_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
];

function asRecord(value: Json | null): Record<string, Json> {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return {};
  }

  return value as Record<string, Json>;
}

function readMetaString(value: Json | null, key: string) {
  const record = asRecord(value);
  const field = record[key];
  return typeof field === 'string' ? field : null;
}

function readMetaNumber(value: Json | null, key: string) {
  const record = asRecord(value);
  const field = record[key];
  return typeof field === 'number' ? field : null;
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );
}

function getWeekStartKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekday = (utcDate.getUTCDay() + 6) % 7;
  utcDate.setUTCDate(utcDate.getUTCDate() - weekday);
  return utcDate.toISOString().slice(0, 10);
}

function addWeeksToKey(weekKey: string, weeks: number) {
  const date = new Date(`${weekKey}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return weekKey;
  date.setUTCDate(date.getUTCDate() + weeks * 7);
  return date.toISOString().slice(0, 10);
}

function formatWeekLabel(weekKey: string) {
  const date = new Date(`${weekKey}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return weekKey;
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

function matchesEventFilter(row: AnalyticsRow, filter: EventFilter) {
  if (filter === 'all') return true;
  if (filter === 'searches') return row.event_name === 'home_search';
  if (filter === 'procedure_views') return row.event_name === 'procedure_page_view';
  if (filter === 'upgrade_clicks') {
    return (
      row.event_name === 'guidelines_upgrade_click' ||
      row.event_name === 'protocols_upgrade_click' ||
      row.event_name === 'alr_upgrade_click'
    );
  }
  return row.event_name === 'public_page_view' || row.event_name === 'page_view_home';
}

function formatMetaForCsv(meta: Json | null) {
  try {
    return JSON.stringify(meta || {});
  } catch {
    return '{}';
  }
}

type AnalyticsAlert = {
  id: string;
  severity: 'high' | 'medium';
  title: string;
  detail: string;
};

function overviewPublicSignalsNeeded(publicToAppSessions: number, totalEvents: number) {
  return publicToAppSessions > 0 || totalEvents >= 20;
}

function buildRecommendationLabel(intentId: string) {
  if (intentId === 'airway') return 'Promote the difficult-airway path more clearly.';
  if (intentId === 'alr') return 'Expose a faster entry into the ALR catalogue.';
  if (intentId === 'ponv') return 'Add stronger NVPO/PONV shortcuts and redirects.';
  if (intentId === 'fragile') return 'Surface the fragile-patient preset more aggressively.';
  if (intentId === 'rcri') return 'Link cardiac-risk intent directly into calculators.';
  if (intentId === 'antibiotic-prophylaxis') {
    return 'Strengthen antibioprophylaxis entry points and synonyms.';
  }

  return 'Add a clearer route and synonym coverage for this intent.';
}

export default function AdminDashboard() {
  const [periodDays, setPeriodDays] = useState(30);
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');
  const [queryFilter, setQueryFilter] = useState('');

  const analyticsQuery = useQuery({
    queryKey: ['admin-analytics-events', periodDays],
    queryFn: async () => {
      const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('analytics_events')
        .select('id,event_name,path,language,meta,session_id,created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        throw error;
      }

      return (data || []) as AnalyticsRow[];
    },
  });

  const filteredRows = useMemo(() => {
    const normalizedQuery = queryFilter.trim().toLowerCase();

    return (analyticsQuery.data || []).filter((row) => {
      if (!matchesEventFilter(row, eventFilter)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        row.event_name,
        row.path,
        row.language || '',
        row.session_id,
        readMetaString(row.meta, 'query') || '',
        readMetaString(row.meta, 'procedureId') || '',
        formatMetaForCsv(row.meta),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [analyticsQuery.data, eventFilter, queryFilter]);

  const overview = useMemo(() => {
    const rows = filteredRows;
    const since24h = Date.now() - 24 * 60 * 60 * 1000;
    const topPaths = new Map<string, number>();
    const topSearches = new Map<string, { count: number; results: number }>();
    const topZeroResultSearches = new Map<string, number>();
    const topLowResultSearches = new Map<string, { count: number; bestResults: number }>();
    const topProcedures = new Map<string, number>();
    const upgradeClicks = new Map<string, number>();
    const languageCounts = new Map<string, number>();
    const sessionDays = new Map<string, Set<string>>();
    const sessionEventCounts = new Map<string, number>();
    const sessionWeeks = new Map<string, Set<string>>();
    const sessionFlags = new Map<string, SessionFlags>();

    let eventsLast24h = 0;
    let searchCount = 0;
    let zeroResultSearchCount = 0;
    let procedureViews = 0;
    let upgradeCount = 0;

    for (const row of rows) {
      const createdAt = new Date(row.created_at).getTime();
      if (!Number.isNaN(createdAt) && createdAt >= since24h) {
        eventsLast24h += 1;
      }

      const currentFlags = sessionFlags.get(row.session_id) || {
        searched: false,
        viewedProcedure: false,
        sawPublicContent: false,
        openedFromPublic: false,
        proIntent: false,
      };

      const day = row.created_at.slice(0, 10);
      const week = getWeekStartKey(row.created_at);
      const sessionDaySet = sessionDays.get(row.session_id) || new Set<string>();
      sessionDaySet.add(day);
      sessionDays.set(row.session_id, sessionDaySet);
      const sessionWeekSet = sessionWeeks.get(row.session_id) || new Set<string>();
      if (week) {
        sessionWeekSet.add(week);
        sessionWeeks.set(row.session_id, sessionWeekSet);
      }
      sessionEventCounts.set(row.session_id, (sessionEventCounts.get(row.session_id) || 0) + 1);

      topPaths.set(row.path, (topPaths.get(row.path) || 0) + 1);
      if (row.language) {
        languageCounts.set(row.language, (languageCounts.get(row.language) || 0) + 1);
      }

      if (row.event_name === 'home_search') {
        searchCount += 1;
        const query = readMetaString(row.meta, 'query');
        const results = readMetaNumber(row.meta, 'results') || 0;
        if (query) {
          const current = topSearches.get(query) || { count: 0, results: 0 };
          topSearches.set(query, {
            count: current.count + 1,
            results: Math.max(current.results, results),
          });
          if (results === 0) {
            zeroResultSearchCount += 1;
            topZeroResultSearches.set(query, (topZeroResultSearches.get(query) || 0) + 1);
          } else if (results <= 2) {
            const currentLowResult = topLowResultSearches.get(query) || {
              count: 0,
              bestResults: results,
            };
            topLowResultSearches.set(query, {
              count: currentLowResult.count + 1,
              bestResults: Math.max(currentLowResult.bestResults, results),
            });
          }
        }
        currentFlags.searched = true;
      }

      if (row.event_name === 'procedure_page_view') {
        procedureViews += 1;
        const procedureId = readMetaString(row.meta, 'procedureId');
        if (procedureId) {
          topProcedures.set(procedureId, (topProcedures.get(procedureId) || 0) + 1);
        }
        currentFlags.viewedProcedure = true;
      }

      if (
        row.event_name === 'guidelines_upgrade_click' ||
        row.event_name === 'protocols_upgrade_click' ||
        row.event_name === 'alr_upgrade_click' ||
        row.event_name === 'pro_upgrade_click' ||
        row.event_name === 'pro_checkout_view' ||
        row.event_name === 'pro_checkout_start' ||
        row.event_name === 'pro_checkout_success'
      ) {
        if (
          row.event_name === 'guidelines_upgrade_click' ||
          row.event_name === 'protocols_upgrade_click' ||
          row.event_name === 'alr_upgrade_click' ||
          row.event_name === 'pro_upgrade_click'
        ) {
          upgradeCount += 1;
          upgradeClicks.set(row.event_name, (upgradeClicks.get(row.event_name) || 0) + 1);
        }
        currentFlags.proIntent = true;
      }

      if (row.event_name.startsWith('public_')) {
        currentFlags.sawPublicContent = true;
      }

      if (row.event_name === 'public_procedure_cta_click') {
        currentFlags.openedFromPublic = true;
      }

      sessionFlags.set(row.session_id, currentFlags);
    }

    const topLanguages = Array.from(languageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    const uniqueSessions = sessionDays.size;
    const returningSessions = Array.from(sessionDays.values()).filter((days) => days.size > 1).length;
    const activeDays = new Set(rows.map((row) => row.created_at.slice(0, 10))).size;
    const avgEventsPerSession =
      uniqueSessions > 0 ? Math.round((rows.length / uniqueSessions) * 10) / 10 : 0;
    const avgEventsPerActiveDay =
      activeDays > 0 ? Math.round((rows.length / activeDays) * 10) / 10 : 0;
    const searchToProcedureSessions = Array.from(sessionFlags.values()).filter(
      (flags) => flags.searched && flags.viewedProcedure,
    ).length;
    const engagedSessions = Array.from(sessionEventCounts.values()).filter((count) => count >= 3).length;
    const proIntentSessions = Array.from(sessionFlags.values()).filter((flags) => flags.proIntent).length;
    const publicToAppSessions = Array.from(sessionFlags.values()).filter(
      (flags) => flags.sawPublicContent && (flags.openedFromPublic || flags.viewedProcedure),
    ).length;
    const sessionFirstWeeks = new Map<string, string>();
    const weekSessions = new Map<string, Set<string>>();

    sessionWeeks.forEach((weeks, sessionId) => {
      const orderedWeeks = Array.from(weeks).sort();
      if (orderedWeeks.length === 0) return;
      sessionFirstWeeks.set(sessionId, orderedWeeks[0]);

      orderedWeeks.forEach((weekKey) => {
        const sessions = weekSessions.get(weekKey) || new Set<string>();
        sessions.add(sessionId);
        weekSessions.set(weekKey, sessions);
      });
    });

    const cohortBuckets = new Map<string, { visitors: number; retainedWeek1: number; retainedWeek2: number }>();

    sessionWeeks.forEach((weeks, sessionId) => {
      const orderedWeeks = Array.from(weeks).sort();
      if (orderedWeeks.length === 0) return;
      const cohortWeek = orderedWeeks[0];
      const bucket =
        cohortBuckets.get(cohortWeek) || { visitors: 0, retainedWeek1: 0, retainedWeek2: 0 };
      bucket.visitors += 1;

      if (weeks.has(addWeeksToKey(cohortWeek, 1))) {
        bucket.retainedWeek1 += 1;
      }
      if (weeks.has(addWeeksToKey(cohortWeek, 2))) {
        bucket.retainedWeek2 += 1;
      }

      cohortBuckets.set(cohortWeek, bucket);
    });

    const allCohortRows = Array.from(cohortBuckets.entries())
      .sort((left, right) => right[0].localeCompare(left[0]))
      .map(([week, bucket]) => ({
        week,
        label: formatWeekLabel(week),
        visitors: bucket.visitors,
        retainedWeek1: bucket.retainedWeek1,
        retainedWeek2: bucket.retainedWeek2,
        retainedWeek1Rate:
          bucket.visitors > 0 ? Math.round((bucket.retainedWeek1 / bucket.visitors) * 100) : 0,
        retainedWeek2Rate:
          bucket.visitors > 0 ? Math.round((bucket.retainedWeek2 / bucket.visitors) * 100) : 0,
      }));
    const cohortRows = allCohortRows.slice(0, 6);

    const orderedWeeks = Array.from(weekSessions.keys()).sort();
    const latestWeek = orderedWeeks.at(-1) || null;
    const latestWeekSessions = latestWeek ? weekSessions.get(latestWeek) || new Set<string>() : new Set<string>();
    const weeklyActiveVisitors = latestWeekSessions.size;
    const weeklyReturningVisitors = Array.from(latestWeekSessions).filter(
      (sessionId) => sessionFirstWeeks.get(sessionId) !== latestWeek,
    ).length;
    const weeklyRepeatRate =
      weeklyActiveVisitors > 0 ? Math.round((weeklyReturningVisitors / weeklyActiveVisitors) * 100) : 0;
    const matureWeek1Cohorts = allCohortRows.filter(
      (row) => addWeeksToKey(row.week, 1) <= (latestWeek || row.week),
    );
    const matureWeek2Cohorts = allCohortRows.filter(
      (row) => addWeeksToKey(row.week, 2) <= (latestWeek || row.week),
    );
    const avgWeek1Retention =
      matureWeek1Cohorts.length > 0
        ? Math.round(
            matureWeek1Cohorts.reduce((sum, row) => sum + row.retainedWeek1Rate, 0) /
              matureWeek1Cohorts.length,
          )
        : 0;
    const avgWeek2Retention =
      matureWeek2Cohorts.length > 0
        ? Math.round(
            matureWeek2Cohorts.reduce((sum, row) => sum + row.retainedWeek2Rate, 0) /
              matureWeek2Cohorts.length,
          )
        : 0;
    const zeroResultRate =
      searchCount > 0 ? Math.round((zeroResultSearchCount / searchCount) * 100) : 0;
    const searchToProcedureRate =
      uniqueSessions > 0 ? Math.round((searchToProcedureSessions / uniqueSessions) * 100) : 0;
    const publicToAppRate =
      uniqueSessions > 0 ? Math.round((publicToAppSessions / uniqueSessions) * 100) : 0;
    const alerts: AnalyticsAlert[] = [];

    if (searchCount >= 10 && zeroResultRate >= 20) {
      alerts.push({
        id: 'search-gaps',
        severity: 'high',
        title: 'Search gaps are too high',
        detail: `${zeroResultRate}% of searches returned zero results in the current window.`,
      });
    }

    if (searchCount >= 10 && searchToProcedureRate < 25) {
      alerts.push({
        id: 'search-conversion',
        severity: 'medium',
        title: 'Search is not leading to procedures enough',
        detail: `Only ${searchToProcedureRate}% of sessions reached a procedure after searching.`,
      });
    }

    if (overviewPublicSignalsNeeded(publicToAppSessions, rows.length) && publicToAppRate < 10) {
      alerts.push({
        id: 'public-to-app',
        severity: 'medium',
        title: 'Public content is not sending enough users into the app',
        detail: `Only ${publicToAppRate}% of sessions moved from public content into product usage.`,
      });
    }

    if (matureWeek1Cohorts.length >= 2 && avgWeek1Retention < 20) {
      alerts.push({
        id: 'retention-week1',
        severity: 'medium',
        title: 'Week +1 retention is weak',
        detail: `Average week +1 retention is ${avgWeek1Retention}% across mature cohorts.`,
      });
    }

    const searchRecommendations = getSearchActionRecommendations([
      ...Array.from(topZeroResultSearches.keys()),
      ...Array.from(topLowResultSearches.keys()),
    ]).slice(0, 4);

    return {
      totalEvents: rows.length,
      eventsLast24h,
      uniqueSessions,
      returningSessions,
      activeDays,
      avgEventsPerSession,
      avgEventsPerActiveDay,
      searchToProcedureSessions,
      engagedSessions,
      proIntentSessions,
      publicToAppSessions,
      weeklyActiveVisitors,
      weeklyReturningVisitors,
      weeklyRepeatRate,
      avgWeek1Retention,
      avgWeek2Retention,
      zeroResultRate,
      searchToProcedureRate,
      publicToAppRate,
      alerts,
      cohortRows,
      searchCount,
      zeroResultSearchCount,
      procedureViews,
      upgradeCount,
      topPaths: Array.from(topPaths.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6),
      topSearches: Array.from(topSearches.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 6),
      topZeroResultSearches: Array.from(topZeroResultSearches.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6),
      topLowResultSearches: Array.from(topLowResultSearches.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 6),
      searchRecommendations,
      topProcedures: Array.from(topProcedures.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6),
      upgradeClicks: Array.from(upgradeClicks.entries()).sort((a, b) => b[1] - a[1]),
      topLanguages,
      recentEvents: rows.slice(0, 10),
    };
  }, [filteredRows]);

  const handleExportCsv = () => {
    if (filteredRows.length === 0) {
      toast.error('No analytics rows to export');
      return;
    }

    const header = ['created_at', 'event_name', 'path', 'language', 'session_id', 'meta'];
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = filteredRows.map((row) =>
      [
        row.created_at,
        row.event_name,
        row.path,
        row.language || '',
        row.session_id,
        formatMetaForCsv(row.meta),
      ]
        .map((value) => escapeCsv(String(value)))
        .join(','),
    );

    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${eventFilter}-${periodDays}d.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics CSV exported');
  };

  const handleExportSearchActions = () => {
    const suggestions = getSearchRedirectSuggestions([
      ...overview.topZeroResultSearches.map(([query]) => query),
      ...overview.topLowResultSearches.map(([query]) => query),
    ]);

    if (suggestions.length === 0) {
      toast.error('No search action suggestions to export');
      return;
    }

    const payload = suggestions.map((suggestion) => ({
      query: suggestion.query,
      kind: suggestion.kind,
      intent: suggestion.intent.id,
      route: suggestion.route,
      title: suggestion.intent.title.en,
    }));

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `search-actions-${periodDays}d.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Search action suggestions exported');
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.to} className="clinical-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{card.description}</p>
              <Link to={card.to} className="text-sm font-medium text-primary hover:underline">
                Open
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="clinical-shadow">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">Analytics overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              Search demand, Pro intent, and most-used pages from the live event stream.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={periodDays}
              onChange={(event) => setPeriodDays(Number(event.target.value))}
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={eventFilter}
              onChange={(event) => setEventFilter(event.target.value as EventFilter)}
            >
              <option value="all">All events</option>
              <option value="searches">Searches</option>
              <option value="procedure_views">Procedure views</option>
              <option value="upgrade_clicks">Upgrade clicks</option>
              <option value="public_pages">Public pages</option>
            </select>
            <Input
              value={queryFilter}
              onChange={(event) => setQueryFilter(event.target.value)}
              placeholder="Filter by path, event, query, procedure..."
              className="w-full min-w-[260px] md:w-[320px]"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => void analyticsQuery.refetch()}
              disabled={analyticsQuery.isFetching}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${analyticsQuery.isFetching ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportSearchActions}>
              <Download className="mr-2 h-4 w-4" />
              Export search actions
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {analyticsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading analytics...</p>
          )}
          {analyticsQuery.error && (
            <p className="text-sm text-destructive">
              {(analyticsQuery.error as Error).message || 'Failed to load analytics'}
            </p>
          )}
          {!analyticsQuery.isLoading && !analyticsQuery.error && (
            <>
              <div className="rounded-lg border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Action alerts</h3>
                <div className="mt-3 space-y-2">
                  {overview.alerts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No urgent product signals in the current window.
                    </p>
                  ) : (
                    overview.alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`rounded-lg border p-3 text-sm ${
                          alert.severity === 'high'
                            ? 'border-rose-300/60 bg-rose-50/70'
                            : 'border-amber-300/60 bg-amber-50/70'
                        }`}
                      >
                        <p className="font-semibold text-foreground">{alert.title}</p>
                        <p className="mt-1 text-muted-foreground">{alert.detail}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-5">
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    Events
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {formatCompactNumber(overview.totalEvents)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCompactNumber(overview.eventsLast24h)} in the last 24h
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <Search className="h-4 w-4" />
                    Searches
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {formatCompactNumber(overview.searchCount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCompactNumber(overview.uniqueSessions)} unique sessions
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Search gaps
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {formatCompactNumber(overview.zeroResultSearchCount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {overview.searchCount > 0
                      ? `${Math.round((overview.zeroResultSearchCount / overview.searchCount) * 100)}% zero-result rate`
                      : 'No search data yet'}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <Crown className="h-4 w-4" />
                    Pro clicks
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {formatCompactNumber(overview.upgradeCount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCompactNumber(overview.procedureViews)} procedure page views
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Top languages
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    {overview.topLanguages.length === 0 ? (
                      <p className="text-muted-foreground">No language data yet.</p>
                    ) : (
                      overview.topLanguages.map(([language, count]) => (
                        <div key={language} className="flex items-center justify-between gap-3">
                          <span className="font-medium uppercase text-foreground">{language}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Active days
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {overview.activeDays}
                  </p>
                  <p className="text-sm text-muted-foreground">Distinct days with usage</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Returning visitors
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {overview.returningSessions}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {overview.uniqueSessions > 0
                      ? `${Math.round((overview.returningSessions / overview.uniqueSessions) * 100)}% return rate`
                      : 'No session data yet'}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Avg events / visitor
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {overview.avgEventsPerSession}
                  </p>
                  <p className="text-sm text-muted-foreground">Depth of repeat usage</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Search to procedure
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {overview.searchToProcedureSessions}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sessions that searched and opened a procedure
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Engaged sessions
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {overview.engagedSessions}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sessions with at least 3 tracked events
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Pro intent sessions
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {overview.proIntentSessions}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sessions that reached upgrade or checkout intent
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Public to app
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {overview.publicToAppSessions}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sessions moving from public content into product usage
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Avg events / day
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {overview.avgEventsPerActiveDay}
                  </p>
                  <p className="text-sm text-muted-foreground">Operational usage density</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Weekly active
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {overview.weeklyActiveVisitors}
                  </p>
                  <p className="text-sm text-muted-foreground">Visitors active this week</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Weekly repeat rate
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {overview.weeklyRepeatRate}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {overview.weeklyReturningVisitors} returning this week
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Week +1 retention
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {overview.avgWeek1Retention}%
                  </p>
                  <p className="text-sm text-muted-foreground">Average across mature cohorts</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Week +2 retention
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {overview.avgWeek2Retention}%
                  </p>
                  <p className="text-sm text-muted-foreground">Average across mature cohorts</p>
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                Showing {filteredRows.length} events for the current filters.
              </div>

              <div className="rounded-lg border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Weekly cohorts</h3>
                <div className="mt-3 space-y-2">
                  {overview.cohortRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Not enough repeat data yet for cohort analysis.
                    </p>
                  ) : (
                    overview.cohortRows.map((row) => (
                      <div
                        key={row.week}
                        className="grid gap-2 rounded-lg border border-border/70 bg-background/60 p-3 text-sm md:grid-cols-[120px_1fr_1fr_1fr]"
                      >
                        <div>
                          <p className="font-medium text-foreground">{row.label}</p>
                          <p className="text-xs text-muted-foreground">{row.visitors} visitors</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Week +1
                          </p>
                          <p className="font-medium text-foreground">
                            {row.retainedWeek1Rate}% ({row.retainedWeek1})
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Week +2
                          </p>
                          <p className="font-medium text-foreground">
                            {row.retainedWeek2Rate}% ({row.retainedWeek2})
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Cohort size
                          </p>
                          <p className="font-medium text-foreground">{row.visitors}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">Top pages</h3>
                  <div className="mt-3 space-y-2">
                    {overview.topPaths.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No page views recorded yet.</p>
                    ) : (
                      overview.topPaths.map(([path, count]) => (
                        <div key={path} className="flex items-center justify-between gap-3 text-sm">
                          <span className="truncate text-foreground">{path}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">Top search terms</h3>
                  <div className="mt-3 space-y-2">
                    {overview.topSearches.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No searches recorded yet.</p>
                    ) : (
                      overview.topSearches.map(([query, stats]) => (
                        <div key={query} className="flex items-center justify-between gap-3 text-sm">
                          <div className="min-w-0">
                            <p className="truncate text-foreground">{query}</p>
                            <p className="text-xs text-muted-foreground">
                              max results: {stats.results}
                            </p>
                          </div>
                          <span className="text-muted-foreground">{stats.count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">Zero-result searches</h3>
                  <div className="mt-3 space-y-2">
                    {overview.topZeroResultSearches.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No zero-result searches in the current window.
                      </p>
                    ) : (
                      overview.topZeroResultSearches.map(([query, count]) => (
                        <div key={query} className="flex items-center justify-between gap-3 text-sm">
                          <span className="truncate text-foreground">{query}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">Low-result searches</h3>
                  <div className="mt-3 space-y-2">
                    {overview.topLowResultSearches.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No low-result search patterns yet.
                      </p>
                    ) : (
                      overview.topLowResultSearches.map(([query, stats]) => (
                        <div key={query} className="flex items-center justify-between gap-3 text-sm">
                          <div className="min-w-0">
                            <p className="truncate text-foreground">{query}</p>
                            <p className="text-xs text-muted-foreground">
                              best results: {stats.bestResults}
                            </p>
                          </div>
                          <span className="text-muted-foreground">{stats.count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Recommended search actions
                  </h3>
                  <div className="mt-3 space-y-3">
                    {overview.searchRecommendations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No clear intent clusters yet. Keep collecting search data.
                      </p>
                    ) : (
                      overview.searchRecommendations.map(({ intent, matchedQueries }) => (
                        <div key={intent.id} className="rounded-lg border border-border/80 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {intent.title.en}
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {buildRecommendationLabel(intent.id)}
                              </p>
                            </div>
                            <Link
                              to={intent.route}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              Open path
                            </Link>
                          </div>
                          <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                            Queries seen
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {matchedQueries.slice(0, 4).map((query) => (
                              <span
                                key={`${intent.id}-${query}`}
                                className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                              >
                                {query}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">Top procedures</h3>
                  <div className="mt-3 space-y-2">
                    {overview.topProcedures.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No procedure views recorded yet.
                      </p>
                    ) : (
                      overview.topProcedures.map(([procedureId, count]) => (
                        <div
                          key={procedureId}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <Link
                            to={`/p/${procedureId}`}
                            className="truncate text-primary hover:underline"
                          >
                            {procedureId}
                          </Link>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">Upgrade click sources</h3>
                  <div className="mt-3 space-y-2">
                    {overview.upgradeClicks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No upgrade clicks yet.</p>
                    ) : (
                      overview.upgradeClicks.map(([eventName, count]) => (
                        <div
                          key={eventName}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="text-foreground">{eventName}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Recent events</h3>
                <div className="mt-3 space-y-2">
                  {overview.recentEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No analytics events yet.</p>
                  ) : (
                    overview.recentEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex flex-col gap-1 rounded-md border border-border/60 p-3 text-sm md:flex-row md:items-center md:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{event.event_name}</p>
                          <p className="truncate text-xs text-muted-foreground">{event.path}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
