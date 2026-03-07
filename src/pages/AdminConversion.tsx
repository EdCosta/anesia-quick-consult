import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarRange, Filter, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

export default function AdminConversion() {
  const [periodDays, setPeriodDays] = useState(30);

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

  const funnel = useMemo(() => {
    const rows = analyticsQuery.data || [];
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

    for (const row of rows) {
      const stage = getStage(row);
      if (!stage) continue;

      const surface = getMetaString(row.meta, 'surface') || row.path || 'unknown';
      const language = row.language || 'unknown';
      const day = row.created_at.slice(0, 10);

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
    };
  }, [analyticsQuery.data]);

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
        </div>
      </div>

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
    </div>
  );
}
