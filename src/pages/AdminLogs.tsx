import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ImportLogRow = {
  id: string;
  entity: string | null;
  source: string | null;
  inserted_count: number | null;
  updated_count: number | null;
  error_count: number | null;
  errors: unknown;
  created_at: string;
};

export default function AdminLogs() {
  const [entityFilter, setEntityFilter] = useState<'all' | 'procedures' | 'guidelines'>('all');

  const logsQuery = useQuery({
    queryKey: ['admin-import-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('import_logs' as any)
        .select(
          'id,entity,source,inserted_count,updated_count,error_count,errors,created_at',
        )
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      return ((data as ImportLogRow[]) || []).map((row) => ({
        ...row,
        entity: row.entity || 'procedures',
        inserted_count: row.inserted_count ?? 0,
        updated_count: row.updated_count ?? 0,
        error_count: row.error_count ?? 0,
      }));
    },
  });

  const filteredLogs = useMemo(() => {
    if (!logsQuery.data) {
      return [];
    }

    if (entityFilter === 'all') {
      return logsQuery.data;
    }

    return logsQuery.data.filter((row) => row.entity === entityFilter);
  }, [entityFilter, logsQuery.data]);

  return (
    <Card className="clinical-shadow">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle>Import logs</CardTitle>
        <select
          value={entityFilter}
          onChange={(event) =>
            setEntityFilter(event.target.value as 'all' | 'procedures' | 'guidelines')
          }
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All entities</option>
          <option value="procedures">Procedures</option>
          <option value="guidelines">Guidelines</option>
        </select>
      </CardHeader>
      <CardContent className="space-y-4">
        {logsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading logs...</p>}
        {logsQuery.error && (
          <p className="text-sm text-destructive">
            {(logsQuery.error as Error).message || 'Failed to load logs'}
          </p>
        )}
        {!logsQuery.isLoading && filteredLogs.length === 0 && (
          <p className="text-sm text-muted-foreground">No import logs found.</p>
        )}
        {filteredLogs.map((row) => (
          <div key={row.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-medium text-foreground">{row.entity}</span>
              <span className="text-muted-foreground">{row.source || 'unknown source'}</span>
              <span className="text-muted-foreground">
                {new Date(row.created_at).toLocaleString()}
              </span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Inserted: {row.inserted_count} | Updated: {row.updated_count} | Errors:{' '}
              {row.error_count}
            </div>
            {Array.isArray(row.errors) && row.errors.length > 0 && (
              <pre className="mt-3 overflow-x-auto rounded-md bg-muted/30 p-3 text-xs text-foreground">
                {JSON.stringify(row.errors, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
