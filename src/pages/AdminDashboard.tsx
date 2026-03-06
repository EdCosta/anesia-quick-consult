import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Crown, Activity, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

export default function AdminDashboard() {
  const [periodDays, setPeriodDays] = useState(30);

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

  const overview = useMemo(() => {
    const rows = analyticsQuery.data || [];
    const since24h = Date.now() - 24 * 60 * 60 * 1000;
    const topPaths = new Map<string, number>();
    const topSearches = new Map<string, { count: number; results: number }>();
    const topProcedures = new Map<string, number>();
    const upgradeClicks = new Map<string, number>();
    const languageCounts = new Map<string, number>();

    let eventsLast24h = 0;
    let searchCount = 0;
    let procedureViews = 0;
    let upgradeCount = 0;

    for (const row of rows) {
      const createdAt = new Date(row.created_at).getTime();
      if (!Number.isNaN(createdAt) && createdAt >= since24h) {
        eventsLast24h += 1;
      }

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
        }
      }

      if (row.event_name === 'procedure_page_view') {
        procedureViews += 1;
        const procedureId = readMetaString(row.meta, 'procedureId');
        if (procedureId) {
          topProcedures.set(procedureId, (topProcedures.get(procedureId) || 0) + 1);
        }
      }

      if (
        row.event_name === 'guidelines_upgrade_click' ||
        row.event_name === 'protocols_upgrade_click' ||
        row.event_name === 'alr_upgrade_click'
      ) {
        upgradeCount += 1;
        upgradeClicks.set(row.event_name, (upgradeClicks.get(row.event_name) || 0) + 1);
      }
    }

    const topLanguages = Array.from(languageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      totalEvents: rows.length,
      eventsLast24h,
      uniqueSessions: new Set(rows.map((row) => row.session_id)).size,
      searchCount,
      procedureViews,
      upgradeCount,
      topPaths: Array.from(topPaths.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6),
      topSearches: Array.from(topSearches.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 6),
      topProcedures: Array.from(topProcedures.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6),
      upgradeClicks: Array.from(upgradeClicks.entries()).sort((a, b) => b[1] - a[1]),
      topLanguages,
      recentEvents: rows.slice(0, 10),
    };
  }, [analyticsQuery.data]);

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
          <div className="flex items-center gap-2">
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
              <div className="grid gap-3 md:grid-cols-4">
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
