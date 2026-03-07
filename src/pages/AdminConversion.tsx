import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarRange, Download, Filter, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type AnalyticsRow = {
  id: string;
  event_name: string;
  meta: Json | null;
  session_id: string;
  created_at: string;
  path: string;
  language: string | null;
};

type StageKey = 'preview' | 'click' | 'checkout' | 'success';
const ALL_FILTER = '__all__';
const INTERNAL_SOURCES = new Set([
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
  'calculators',
]);

function getMetaString(meta: Json | null, key: string) {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return null;
  const value = (meta as Record<string, Json>)[key];
  return typeof value === 'string' ? value : null;
}

function asPercent(part: number, total: number) {
  if (total <= 0) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

function getStage(row: AnalyticsRow): StageKey | null {
  if (row.event_name === 'pro_preview_view') return 'preview';
  if (
    row.event_name === 'pro_upgrade_click' ||
    row.event_name === 'guidelines_upgrade_click' ||
    row.event_name === 'protocols_upgrade_click' ||
    row.event_name === 'alr_upgrade_click'
  ) {
    return 'click';
  }
  if (row.event_name === 'pro_checkout_view' || row.event_name === 'pro_checkout_start') {
    return 'checkout';
  }
  if (row.event_name === 'pro_checkout_success') return 'success';
  return null;
}

function stageLabel(stage: StageKey) {
  if (stage === 'preview') return 'Preview';
  if (stage === 'click') return 'Click';
  if (stage === 'checkout') return 'Checkout';
  return 'Success';
}

function sortByPreview<T extends { preview: number; click: number; success: number }>(rows: T[]) {
  return [...rows].sort((left, right) => right.preview - left.preview || right.click - left.click);
}

function getTrafficSegment(row: AnalyticsRow) {
  const source = getMetaString(row.meta, 'source') || 'unknown';
  const medium = getMetaString(row.meta, 'medium');
  const campaign = getMetaString(row.meta, 'campaign');
  const referrerHost = getMetaString(row.meta, 'referrer_host');
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : null;

  if (INTERNAL_SOURCES.has(source)) return 'internal_navigation';
  if (referrerHost && currentHost && referrerHost === currentHost) return 'internal_navigation';
  if (source === 'direct' && !referrerHost && !campaign && !medium) return 'direct';
  return 'external_acquisition';
}

function exportRowsAsCsv(rows: AnalyticsRow[]) {
  if (typeof window === 'undefined') return;

  const header = [
    'created_at',
    'event_name',
    'stage',
    'traffic_segment',
    'session_id',
    'path',
    'language',
    'surface',
    'source',
    'medium',
    'campaign',
    'landing_path',
    'referrer_host',
  ];

  const csvRows = rows.map((row) => {
    const values = [
      row.created_at,
      row.event_name,
      getStage(row) || '',
      getTrafficSegment(row),
      row.session_id,
      row.path,
      row.language || '',
      getMetaString(row.meta, 'surface') || '',
      getMetaString(row.meta, 'source') || '',
      getMetaString(row.meta, 'medium') || '',
      getMetaString(row.meta, 'campaign') || '',
      getMetaString(row.meta, 'landing_path') || '',
      getMetaString(row.meta, 'referrer_host') || '',
    ];

    return values
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(',');
  });

  const blob = new Blob([[header.join(','), ...csvRows].join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `anesia-pro-conversion-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function AdminConversion() {
  const [periodDays, setPeriodDays] = useLocalStorage<number>('admin-conversion-period-days', 30);
  const [selectedSurface, setSelectedSurface] = useLocalStorage<string>(
    'admin-conversion-surface',
    ALL_FILTER,
  );
  const [selectedSource, setSelectedSource] = useLocalStorage<string>(
    'admin-conversion-source',
    ALL_FILTER,
  );
  const [selectedCampaign, setSelectedCampaign] = useLocalStorage<string>(
    'admin-conversion-campaign',
    ALL_FILTER,
  );
  const [selectedSegment, setSelectedSegment] = useLocalStorage<string>(
    'admin-conversion-segment',
    ALL_FILTER,
  );

  const analyticsQuery = useQuery({
    queryKey: ['admin-pro-conversion', periodDays],
    queryFn: async () => {
      const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('analytics_events')
        .select('id,event_name,meta,session_id,created_at,path,language')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(5000);

      if (error) throw error;

      return (data || []) as AnalyticsRow[];
    },
  });

  const filterOptions = useMemo(() => {
    const rows = analyticsQuery.data || [];
    const getValues = (project: (row: AnalyticsRow) => string) =>
      Array.from(new Set(rows.map(project))).sort((left, right) => left.localeCompare(right));

    return {
      surfaces: getValues((row) => getMetaString(row.meta, 'surface') || row.path || 'unknown'),
      sources: getValues((row) => getMetaString(row.meta, 'source') || 'unknown'),
      campaigns: getValues((row) => getMetaString(row.meta, 'campaign') || 'none'),
      segments: getValues((row) => getTrafficSegment(row)),
    };
  }, [analyticsQuery.data]);

  const filteredRows = useMemo(() => {
    const rows = analyticsQuery.data || [];

    return rows.filter((row) => {
      const surface = getMetaString(row.meta, 'surface') || row.path || 'unknown';
      const source = getMetaString(row.meta, 'source') || 'unknown';
      const campaign = getMetaString(row.meta, 'campaign') || 'none';
      const segment = getTrafficSegment(row);

      if (selectedSurface !== ALL_FILTER && surface !== selectedSurface) return false;
      if (selectedSource !== ALL_FILTER && source !== selectedSource) return false;
      if (selectedCampaign !== ALL_FILTER && campaign !== selectedCampaign) return false;
      if (selectedSegment !== ALL_FILTER && segment !== selectedSegment) return false;
      return true;
    });
  }, [analyticsQuery.data, selectedCampaign, selectedSegment, selectedSource, selectedSurface]);

  useEffect(() => {
    if (selectedSurface !== ALL_FILTER && !filterOptions.surfaces.includes(selectedSurface)) {
      setSelectedSurface(ALL_FILTER);
    }
    if (selectedSource !== ALL_FILTER && !filterOptions.sources.includes(selectedSource)) {
      setSelectedSource(ALL_FILTER);
    }
    if (selectedCampaign !== ALL_FILTER && !filterOptions.campaigns.includes(selectedCampaign)) {
      setSelectedCampaign(ALL_FILTER);
    }
    if (selectedSegment !== ALL_FILTER && !filterOptions.segments.includes(selectedSegment)) {
      setSelectedSegment(ALL_FILTER);
    }
  }, [
    filterOptions.campaigns,
    filterOptions.segments,
    filterOptions.sources,
    filterOptions.surfaces,
    selectedCampaign,
    selectedSegment,
    selectedSource,
    selectedSurface,
    setSelectedCampaign,
    setSelectedSegment,
    setSelectedSource,
    setSelectedSurface,
  ]);

  const funnel = useMemo(() => {
    const rows = filteredRows;
    const stageSessions = {
      preview: new Set<string>(),
      click: new Set<string>(),
      checkout: new Set<string>(),
      success: new Set<string>(),
    };
    const bySurface = new Map<
      string,
      { preview: Set<string>; click: Set<string>; checkout: Set<string>; success: Set<string> }
    >();
    const byLanguage = new Map<
      string,
      { preview: Set<string>; click: Set<string>; checkout: Set<string>; success: Set<string> }
    >();
    const byDay = new Map<
      string,
      { preview: Set<string>; click: Set<string>; checkout: Set<string>; success: Set<string> }
    >();
    const bySource = new Map<
      string,
      { preview: Set<string>; click: Set<string>; checkout: Set<string>; success: Set<string> }
    >();
    const byCampaign = new Map<
      string,
      { preview: Set<string>; click: Set<string>; checkout: Set<string>; success: Set<string> }
    >();
    const bySegment = new Map<
      string,
      { preview: Set<string>; click: Set<string>; checkout: Set<string>; success: Set<string> }
    >();

    for (const row of rows) {
      const stage = getStage(row);
      if (!stage) continue;

      const surface = getMetaString(row.meta, 'surface') || row.path || 'unknown';
      const language = row.language || 'unknown';
      const day = row.created_at.slice(0, 10);
      const source = getMetaString(row.meta, 'source') || 'unknown';
      const campaign = getMetaString(row.meta, 'campaign') || 'none';
      const segment = getTrafficSegment(row);

      stageSessions[stage].add(row.session_id);

      const surfaceBucket =
        bySurface.get(surface) || {
          preview: new Set<string>(),
          click: new Set<string>(),
          checkout: new Set<string>(),
          success: new Set<string>(),
        };
      surfaceBucket[stage].add(row.session_id);
      bySurface.set(surface, surfaceBucket);

      const languageBucket =
        byLanguage.get(language) || {
          preview: new Set<string>(),
          click: new Set<string>(),
          checkout: new Set<string>(),
          success: new Set<string>(),
        };
      languageBucket[stage].add(row.session_id);
      byLanguage.set(language, languageBucket);

      const dayBucket =
        byDay.get(day) || {
          preview: new Set<string>(),
          click: new Set<string>(),
          checkout: new Set<string>(),
          success: new Set<string>(),
        };
      dayBucket[stage].add(row.session_id);
      byDay.set(day, dayBucket);

      const sourceBucket =
        bySource.get(source) || {
          preview: new Set<string>(),
          click: new Set<string>(),
          checkout: new Set<string>(),
          success: new Set<string>(),
        };
      sourceBucket[stage].add(row.session_id);
      bySource.set(source, sourceBucket);

      const campaignBucket =
        byCampaign.get(campaign) || {
          preview: new Set<string>(),
          click: new Set<string>(),
          checkout: new Set<string>(),
          success: new Set<string>(),
        };
      campaignBucket[stage].add(row.session_id);
      byCampaign.set(campaign, campaignBucket);

      const segmentBucket =
        bySegment.get(segment) || {
          preview: new Set<string>(),
          click: new Set<string>(),
          checkout: new Set<string>(),
          success: new Set<string>(),
        };
      segmentBucket[stage].add(row.session_id);
      bySegment.set(segment, segmentBucket);
    }

    return {
      previewSessions: stageSessions.preview.size,
      clickSessions: stageSessions.click.size,
      checkoutSessions: stageSessions.checkout.size,
      successSessions: stageSessions.success.size,
      surfaces: sortByPreview(
        Array.from(bySurface.entries()).map(([surface, bucket]) => ({
          surface,
          preview: bucket.preview.size,
          click: bucket.click.size,
          checkout: bucket.checkout.size,
          success: bucket.success.size,
        })),
      ),
      languages: sortByPreview(
        Array.from(byLanguage.entries()).map(([language, bucket]) => ({
          language,
          preview: bucket.preview.size,
          click: bucket.click.size,
          checkout: bucket.checkout.size,
          success: bucket.success.size,
        })),
      ),
      trend: Array.from(byDay.entries())
        .map(([day, bucket]) => ({
          day,
          preview: bucket.preview.size,
          click: bucket.click.size,
          checkout: bucket.checkout.size,
          success: bucket.success.size,
        }))
        .sort((left, right) => left.day.localeCompare(right.day)),
      sources: sortByPreview(
        Array.from(bySource.entries()).map(([source, bucket]) => ({
          source,
          preview: bucket.preview.size,
          click: bucket.click.size,
          checkout: bucket.checkout.size,
          success: bucket.success.size,
        })),
      ),
      campaigns: sortByPreview(
        Array.from(byCampaign.entries()).map(([campaign, bucket]) => ({
          campaign,
          preview: bucket.preview.size,
          click: bucket.click.size,
          checkout: bucket.checkout.size,
          success: bucket.success.size,
        })),
      ),
      segments: sortByPreview(
        Array.from(bySegment.entries()).map(([segment, bucket]) => ({
          segment,
          preview: bucket.preview.size,
          click: bucket.click.size,
          checkout: bucket.checkout.size,
          success: bucket.success.size,
        })),
      ),
    };
  }, [filteredRows]);

  const hasActiveFilters =
    selectedSurface !== ALL_FILTER ||
    selectedSource !== ALL_FILTER ||
    selectedCampaign !== ALL_FILTER ||
    selectedSegment !== ALL_FILTER;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Filter className="h-5 w-5 text-accent" />
            Pro conversion
          </h2>
          <p className="text-sm text-muted-foreground">
            Funnel from locked preview to checkout success, with trend and surface breakdown.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={periodDays}
            onChange={(event) => setPeriodDays(Number(event.target.value))}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => void analyticsQuery.refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportRowsAsCsv(filteredRows)}
            disabled={filteredRows.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={selectedSurface}
          onChange={(event) => setSelectedSurface(event.target.value)}
        >
          <option value={ALL_FILTER}>All surfaces</option>
          {filterOptions.surfaces.map((surface) => (
            <option key={surface} value={surface}>
              {surface}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={selectedSource}
          onChange={(event) => setSelectedSource(event.target.value)}
        >
          <option value={ALL_FILTER}>All sources</option>
          {filterOptions.sources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={selectedCampaign}
          onChange={(event) => setSelectedCampaign(event.target.value)}
        >
          <option value={ALL_FILTER}>All campaigns</option>
          {filterOptions.campaigns.map((campaign) => (
            <option key={campaign} value={campaign}>
              {campaign}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={selectedSegment}
          onChange={(event) => setSelectedSegment(event.target.value)}
        >
          <option value={ALL_FILTER}>All traffic</option>
          {filterOptions.segments.map((segment) => (
            <option key={segment} value={segment}>
              {segment}
            </option>
          ))}
        </select>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedSurface(ALL_FILTER);
              setSelectedSource(ALL_FILTER);
              setSelectedCampaign(ALL_FILTER);
              setSelectedSegment(ALL_FILTER);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {hasActiveFilters
          ? `Filtered view: ${filteredRows.length} matching events in the last ${periodDays} days.`
          : `Showing all conversion events from the last ${periodDays} days.`}
      </p>

      <div className="grid gap-4 md:grid-cols-4">
        {([
          ['preview', funnel.previewSessions, null],
          ['click', funnel.clickSessions, asPercent(funnel.clickSessions, funnel.previewSessions)],
          [
            'checkout',
            funnel.checkoutSessions,
            asPercent(funnel.checkoutSessions, funnel.clickSessions),
          ],
          [
            'success',
            funnel.successSessions,
            asPercent(funnel.successSessions, funnel.checkoutSessions),
          ],
        ] as Array<[StageKey, number, string | null]>).map(([stage, value, ratio]) => (
          <Card key={stage}>
            <CardContent className="p-4">
              <p className="text-xs uppercase text-muted-foreground">{stageLabel(stage)}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
              {ratio && (
                <p className="text-xs text-muted-foreground">
                  {ratio} from {stage === 'click' ? 'preview' : stage === 'checkout' ? 'click' : 'checkout'}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
        <Card className="clinical-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="h-4 w-4 text-accent" />
              Daily trend
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analyticsQuery.isLoading && (
              <p className="text-sm text-muted-foreground">Loading funnel...</p>
            )}
            {analyticsQuery.error && (
              <p className="text-sm text-destructive">
                {(analyticsQuery.error as Error).message || 'Failed to load conversion analytics'}
              </p>
            )}
            {!analyticsQuery.isLoading && funnel.trend.length === 0 && (
              <p className="text-sm text-muted-foreground">No Pro conversion data yet.</p>
            )}
            {funnel.trend.slice(-14).map((row) => (
              <div key={row.day} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{row.day}</p>
                  <p className="text-xs text-muted-foreground">
                    {asPercent(row.success, row.preview)} preview to success
                  </p>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  {([
                    ['Preview', row.preview],
                    ['Click', row.click],
                    ['Checkout', row.checkout],
                    ['Success', row.success],
                  ] as Array<[string, number]>).map(([label, value]) => (
                    <div key={label} className="rounded-md bg-muted/40 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="clinical-shadow">
          <CardHeader>
            <CardTitle className="text-base">Conversion by language</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!analyticsQuery.isLoading && funnel.languages.length === 0 && (
              <p className="text-sm text-muted-foreground">No language breakdown yet.</p>
            )}
            {funnel.languages.map((row) => (
              <div key={row.language} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{row.language}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.success} success / {row.preview} preview
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  CTR {asPercent(row.click, row.preview)} | Checkout {asPercent(row.checkout, row.click)} | Success {asPercent(row.success, row.checkout)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="clinical-shadow">
          <CardHeader>
            <CardTitle className="text-base">Conversion by traffic segment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!analyticsQuery.isLoading && funnel.segments.length === 0 && (
              <p className="text-sm text-muted-foreground">No traffic segment breakdown yet.</p>
            )}
            {funnel.segments.map((row) => (
              <div key={row.segment} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{row.segment}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.success} success / {row.preview} preview
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  CTR {asPercent(row.click, row.preview)} | Checkout {asPercent(row.checkout, row.click)} | Success {asPercent(row.success, row.checkout)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="clinical-shadow">
        <CardHeader>
          <CardTitle className="text-base">Conversion by surface</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!analyticsQuery.isLoading && funnel.surfaces.length === 0 && (
            <p className="text-sm text-muted-foreground">No Pro conversion data yet.</p>
          )}
          {funnel.surfaces.map((row) => (
            <div key={row.surface} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-foreground">{row.surface}</p>
                <p className="text-sm text-muted-foreground">
                  {row.click} clicks / {row.preview} previews
                </p>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <p className="text-xs text-muted-foreground">
                  CTR from preview: <span className="font-medium text-foreground">{asPercent(row.click, row.preview)}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Checkout from click: <span className="font-medium text-foreground">{asPercent(row.checkout, row.click)}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Success from checkout: <span className="font-medium text-foreground">{asPercent(row.success, row.checkout)}</span>
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="clinical-shadow">
          <CardHeader>
            <CardTitle className="text-base">Conversion by source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!analyticsQuery.isLoading && funnel.sources.length === 0 && (
              <p className="text-sm text-muted-foreground">No source breakdown yet.</p>
            )}
            {funnel.sources.map((row) => (
              <div key={row.source} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{row.source}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.success} success / {row.preview} preview
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  CTR {asPercent(row.click, row.preview)} | Checkout {asPercent(row.checkout, row.click)} | Success {asPercent(row.success, row.checkout)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="clinical-shadow">
          <CardHeader>
            <CardTitle className="text-base">Conversion by campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!analyticsQuery.isLoading && funnel.campaigns.length === 0 && (
              <p className="text-sm text-muted-foreground">No campaign breakdown yet.</p>
            )}
            {funnel.campaigns.map((row) => (
              <div key={row.campaign} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{row.campaign}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.success} success / {row.preview} preview
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  CTR {asPercent(row.click, row.preview)} | Checkout {asPercent(row.checkout, row.click)} | Success {asPercent(row.success, row.checkout)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
