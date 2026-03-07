import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, RefreshCw } from 'lucide-react';
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
};

function getMetaString(meta: Json | null, key: string) {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return null;
  const value = (meta as Record<string, Json>)[key];
  return typeof value === 'string' ? value : null;
}

function asPercent(part: number, total: number) {
  if (total <= 0) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

export default function AdminConversion() {
  const [periodDays, setPeriodDays] = useState(30);

  const analyticsQuery = useQuery({
    queryKey: ['admin-pro-conversion', periodDays],
    queryFn: async () => {
      const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('analytics_events')
        .select('id,event_name,meta,session_id,created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(5000);

      if (error) {
        throw error;
      }

      return (data || []) as AnalyticsRow[];
    },
  });

  const funnel = useMemo(() => {
    const rows = analyticsQuery.data || [];
    const previewSessions = new Set<string>();
    const clickSessions = new Set<string>();
    const checkoutSessions = new Set<string>();
    const successSessions = new Set<string>();
    const bySurface = new Map<string, { previews: number; clicks: number }>();

    for (const row of rows) {
      const surface = getMetaString(row.meta, 'surface') || 'unknown';

      if (row.event_name === 'pro_preview_view') {
        previewSessions.add(row.session_id);
        const current = bySurface.get(surface) || { previews: 0, clicks: 0 };
        current.previews += 1;
        bySurface.set(surface, current);
      }

      if (
        row.event_name === 'pro_upgrade_click' ||
        row.event_name === 'guidelines_upgrade_click' ||
        row.event_name === 'protocols_upgrade_click' ||
        row.event_name === 'alr_upgrade_click'
      ) {
        clickSessions.add(row.session_id);
        const current = bySurface.get(surface) || { previews: 0, clicks: 0 };
        current.clicks += 1;
        bySurface.set(surface, current);
      }

      if (row.event_name === 'pro_checkout_view' || row.event_name === 'pro_checkout_start') {
        checkoutSessions.add(row.session_id);
      }

      if (row.event_name === 'pro_checkout_success') {
        successSessions.add(row.session_id);
      }
    }

    return {
      previewSessions: previewSessions.size,
      clickSessions: clickSessions.size,
      checkoutSessions: checkoutSessions.size,
      successSessions: successSessions.size,
      surfaces: Array.from(bySurface.entries()).sort((a, b) => b[1].clicks - a[1].clicks),
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
            Funnel from locked preview to checkout success.
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
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Preview</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{funnel.previewSessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Click</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{funnel.clickSessions}</p>
            <p className="text-xs text-muted-foreground">
              {asPercent(funnel.clickSessions, funnel.previewSessions)} from preview
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Checkout</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{funnel.checkoutSessions}</p>
            <p className="text-xs text-muted-foreground">
              {asPercent(funnel.checkoutSessions, funnel.clickSessions)} from click
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Success</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{funnel.successSessions}</p>
            <p className="text-xs text-muted-foreground">
              {asPercent(funnel.successSessions, funnel.checkoutSessions)} from checkout
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="clinical-shadow">
        <CardHeader>
          <CardTitle className="text-base">Conversion by surface</CardTitle>
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
          {!analyticsQuery.isLoading && funnel.surfaces.length === 0 && (
            <p className="text-sm text-muted-foreground">No Pro conversion data yet.</p>
          )}
          {funnel.surfaces.map(([surface, stats]) => (
            <div key={surface} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-foreground">{surface}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.clicks} clicks / {stats.previews} previews
                </p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                CTR from preview: {asPercent(stats.clicks, stats.previews)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
