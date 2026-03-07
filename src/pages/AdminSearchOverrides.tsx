import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { getAllSearchIntents } from '@/lib/searchIntelligence';

type SearchOverrideKind = 'redirect' | 'synonym';

type SearchOverrideRow = {
  id: string;
  active: boolean;
  created_at: string;
  intent_id: string;
  kind: SearchOverrideKind;
  notes: string | null;
  query: string;
  route: string | null;
};

const QUERY_KEY = ['admin-search-override-rules'];

export default function AdminSearchOverrides() {
  const queryClient = useQueryClient();
  const intents = useMemo(() => getAllSearchIntents(), []);
  const [draft, setDraft] = useState<{
    kind: SearchOverrideKind;
    query: string;
    intentId: string;
    route: string;
    notes: string;
  }>({
    kind: 'redirect',
    query: '',
    intentId: intents[0]?.id || 'airway',
    route: intents[0]?.route || '/protocoles?search=airway&open=difficult-airway-algorithm',
    notes: '',
  });

  const rulesQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_override_rules')
        .select('id,active,created_at,intent_id,kind,notes,query,route')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as SearchOverrideRow[];
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: async () => {
      const query = draft.query.trim();
      if (!query) {
        throw new Error('Query is required.');
      }

      const selectedIntent = intents.find((intent) => intent.id === draft.intentId);
      const route = draft.kind === 'redirect' ? draft.route.trim() || selectedIntent?.route || null : null;

      const { error } = await supabase.from('search_override_rules').insert({
        kind: draft.kind,
        query,
        intent_id: draft.intentId,
        route,
        notes: draft.notes.trim() || null,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      toast.success('Search override saved.');
      setDraft((current) => ({ ...current, query: '', notes: '' }));
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => {
      toast.error((error as Error).message || 'Failed to save search override.');
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from('search_override_rules')
        .update({ active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('search_override_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return (
    <div className="space-y-6">
      <Card className="clinical-shadow">
        <CardHeader>
          <CardTitle className="text-base">Remote search overrides</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage redirects and synonym recovery without redeploying the app.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={draft.kind}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  kind: event.target.value as SearchOverrideKind,
                }))
              }
            >
              <option value="redirect">Redirect</option>
              <option value="synonym">Synonym</option>
            </select>
            <Input
              value={draft.query}
              onChange={(event) => setDraft((current) => ({ ...current, query: event.target.value }))}
              placeholder="query"
            />
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={draft.intentId}
              onChange={(event) => {
                const nextIntentId = event.target.value;
                const nextIntent = intents.find((intent) => intent.id === nextIntentId);
                setDraft((current) => ({
                  ...current,
                  intentId: nextIntentId,
                  route: current.kind === 'redirect' ? nextIntent?.route || current.route : current.route,
                }));
              }}
            >
              {intents.map((intent) => (
                <option key={intent.id} value={intent.id}>
                  {intent.title.en}
                </option>
              ))}
            </select>
            <Input
              value={draft.route}
              onChange={(event) => setDraft((current) => ({ ...current, route: event.target.value }))}
              placeholder="/route"
              disabled={draft.kind !== 'redirect'}
            />
            <Input
              value={draft.notes}
              onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
              placeholder="notes"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => createRuleMutation.mutate()} disabled={createRuleMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save override
            </Button>
            <Button variant="outline" onClick={() => void rulesQuery.refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="clinical-shadow">
        <CardHeader>
          <CardTitle className="text-base">Active rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rulesQuery.isLoading && <p className="text-sm text-muted-foreground">Loading rules...</p>}
          {rulesQuery.error && (
            <p className="text-sm text-destructive">
              {(rulesQuery.error as Error).message || 'Failed to load search overrides.'}
            </p>
          )}
          {!rulesQuery.isLoading && (rulesQuery.data || []).length === 0 && (
            <p className="text-sm text-muted-foreground">No search override rules yet.</p>
          )}
          {(rulesQuery.data || []).map((rule) => (
            <div
              key={rule.id}
              className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[110px_1fr_150px_1fr_auto]"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Kind</p>
                <p className="font-medium text-foreground">{rule.kind}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Query</p>
                <p className="font-medium text-foreground">{rule.query}</p>
                {rule.notes && <p className="mt-1 text-xs text-muted-foreground">{rule.notes}</p>}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Intent</p>
                <p className="font-medium text-foreground">{rule.intent_id}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Route</p>
                <p className="truncate text-sm text-muted-foreground">{rule.route || '-'}</p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleRuleMutation.mutate({ id: rule.id, active: !rule.active })}
                >
                  {rule.active ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteRuleMutation.mutate(rule.id)}
                  aria-label="Delete override"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
