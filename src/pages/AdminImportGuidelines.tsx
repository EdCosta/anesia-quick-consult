import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type GuidelinesImportResponse = {
  inserted: number;
  updated: number;
  errors: string[];
};

export default function AdminImportGuidelines() {
  const [payload, setPayload] = useState('');
  const [filename, setFilename] = useState('guidelines.json');

  const importMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke<GuidelinesImportResponse>(
        'admin-import-guidelines',
        {
          body: {
            payload: payload ? JSON.parse(payload) : undefined,
            filename,
          },
        },
      );

      if (error) {
        throw error;
      }

      return data;
    },
  });

  return (
    <Card className="clinical-shadow">
      <CardHeader>
        <CardTitle>Guidelines import</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This flow is stubbed for now. It already calls the protected Edge Function and records
          an import log entry.
        </p>
        <input
          value={filename}
          onChange={(event) => setFilename(event.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="guidelines.json"
        />
        <Textarea
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          className="min-h-40"
          placeholder='Optional JSON payload, e.g. {"items":[]}'
        />
        <Button onClick={() => importMutation.mutate()} disabled={importMutation.isPending}>
          {importMutation.isPending ? 'Submitting...' : 'Run stub import'}
        </Button>
        {importMutation.error && (
          <p className="text-sm text-destructive">
            {(importMutation.error as Error).message || 'Import failed'}
          </p>
        )}
        {importMutation.data && (
          <div className="rounded-md border border-border bg-muted/20 p-3 text-sm">
            <p>
              Inserted: {importMutation.data.inserted} | Updated: {importMutation.data.updated}
            </p>
            {importMutation.data.errors.length > 0 && (
              <p className="mt-2 text-muted-foreground">
                {importMutation.data.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
