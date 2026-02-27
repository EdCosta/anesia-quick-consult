import { useCallback, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  parseProcedureImportCsv,
  procedureImportResponseSchema,
  type ProcedureImportResponse,
} from '@/lib/admin/procedureImport';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, XCircle, FileText, AlertTriangle } from 'lucide-react';

export default function AdminImportProcedures() {
  const [csvText, setCsvText] = useState('');
  const [filename, setFilename] = useState('procedures.csv');
  const [rows, setRows] = useState<ReturnType<typeof parseProcedureImportCsv>['rows']>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [result, setResult] = useState<ProcedureImportResponse | null>(null);

  const totalWarnings = useMemo(
    () => rows.reduce((acc, row) => acc + row.warnings.length, 0),
    [rows],
  );
  const previewRows = useMemo(() => rows.slice(0, 10), [rows]);

  const importMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke<ProcedureImportResponse>(
        'admin-import-procedures',
        {
          body: {
            csv: csvText,
            filename,
          },
        },
      );

      if (error) {
        throw error;
      }

      return procedureImportResponseSchema.parse(data);
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const text = loadEvent.target?.result as string;
      const parsed = parseProcedureImportCsv(text);

      setCsvText(text);
      setFilename(file.name);
      setRows(parsed.rows);
      setParseErrors(parsed.errors);
      setResult(null);
    };
    reader.readAsText(file, 'utf-8');
  }, []);

  async function handleImport() {
    if (rows.length === 0 || parseErrors.length > 0 || !csvText) {
      return;
    }

    await importMutation.mutateAsync();
  }

  return (
    <div className="container max-w-3xl py-6 space-y-5">
      <h1 className="text-xl font-bold text-foreground">Import procedures</h1>

      <Card className="clinical-shadow">
        <CardContent className="p-4">
          <label className="flex flex-col items-center gap-3 cursor-pointer rounded-lg border-2 border-dashed border-border p-6 hover:border-accent/50 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Upload CSV</span>
            <p className="text-xs text-muted-foreground mt-1">
              Format: `id;specialty;titles;synonyms;content;tags` (JSON) or legacy
              `title_fr;title_en;title_pt`
            </p>
            <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
          </label>
        </CardContent>
      </Card>

      {parseErrors.length > 0 && (
        <Card className="clinical-shadow border-destructive/40">
          <CardContent className="p-4 space-y-2">
            <h2 className="text-sm font-semibold text-destructive">Validation errors</h2>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {parseErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && !result && (
        <Card className="clinical-shadow">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Preview: {rows.length} parsed row{rows.length === 1 ? '' : 's'}
                {totalWarnings > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] gap-0.5 border-amber-400 text-amber-600"
                  >
                    <AlertTriangle className="h-2.5 w-2.5" />
                    {totalWarnings} warnings
                  </Badge>
                )}
              </h2>
              <button
                onClick={() => void handleImport()}
                disabled={importMutation.isPending || parseErrors.length > 0}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {importMutation.isPending ? 'Importing...' : 'Run secure import'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Source file: {filename}</p>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {previewRows.map((row) => (
                <div
                  key={`${row.id}-${row.lineNumber}`}
                  className="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-muted/30"
                >
                  <span className="font-mono text-muted-foreground">{row.id}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {row.specialty}
                  </Badge>
                  <span className="text-foreground truncate">
                    {(row.titles.fr as string) || (row.titles.en as string) || '–'}
                  </span>
                  {row.warnings.length > 0 && (
                    <span
                      className="text-amber-500 text-[10px] ml-auto"
                      title={row.warnings.join(', ')}
                    >
                      ⚠ {row.warnings.length}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {rows.length > previewRows.length && (
              <p className="text-xs text-muted-foreground">
                Showing first {previewRows.length} rows only.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {importMutation.error && (
        <Card className="clinical-shadow border-destructive/40">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">
              {(importMutation.error as Error).message || 'Import failed'}
            </p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="clinical-shadow">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Inserted: {result.inserted} | Updated: {result.updated}
              </span>
              {result.errors.length > 0 && (
                <span className="flex items-center gap-1 text-sm font-semibold text-destructive">
                  <XCircle className="h-4 w-4" />
                  Validation errors: {result.total_errors ?? result.errors.length}
                </span>
              )}
            </div>
            {result.errors.length > 0 ? (
              <div className="max-h-60 overflow-y-auto rounded border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="px-2 py-1 text-left font-medium text-muted-foreground">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((error) => (
                      <tr key={error} className="border-t border-border hover:bg-muted/20">
                        <td className="px-2 py-1 text-muted-foreground">{error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Import completed without row errors.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
