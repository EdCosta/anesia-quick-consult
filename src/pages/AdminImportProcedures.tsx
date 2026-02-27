import { useState, useCallback } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, XCircle, FileText, AlertTriangle } from 'lucide-react';

interface ParsedRow {
  id: string;
  specialty: string;
  titles: any;
  synonyms: any;
  content: any;
  tags: any;
  warnings: string[];
}

interface RowResult {
  id: string;
  status: 'ok' | 'error';
  message: string;
}

const BATCH_SIZE = 50;

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ';' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseCSV(text: string): ParsedRow[] {
  // Strip BOM (Excel UTF-8), normalize Windows CRLF and old Mac CR
  const cleaned = text
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  const lines = cleaned.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];
  const header = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: ParsedRow[] = [];

  // Detect format: multi-language columns vs single JSON columns
  const hasMultiLangTitles = header.includes('title_fr');
  const hasJsonTitles = header.includes('titles');

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    const warnings: string[] = [];

    try {
      const getField = (name: string) => {
        const idx = header.indexOf(name);
        return idx >= 0 && idx < fields.length ? fields[idx].trim() : '';
      };

      const id = getField('id');
      const specialty = getField('specialty');
      if (!id || !specialty) continue;

      // Parse titles
      let titles: any;
      if (hasMultiLangTitles) {
        const fr = getField('title_fr');
        const en = getField('title_en');
        const pt = getField('title_pt');
        if (!fr) {
          warnings.push('Missing title_fr');
          continue;
        }
        titles = { fr };
        if (en) titles.en = en;
        else warnings.push('Missing title_en');
        if (pt) titles.pt = pt;
        else warnings.push('Missing title_pt');
      } else if (hasJsonTitles) {
        titles = JSON.parse(getField('titles'));
      } else {
        continue;
      }

      // Parse synonyms
      let synonyms: any = {};
      const synField = getField('synonyms');
      if (synField) {
        try {
          synonyms = JSON.parse(synField);
        } catch {
          /* ignore */
        }
      }

      // Parse content
      let content: any = {};
      const contentField = getField('content');
      if (contentField) {
        try {
          content = JSON.parse(contentField);
        } catch {
          /* ignore */
        }
      }

      // Parse tags
      let tags: any = [];
      const tagsField = getField('tags');
      if (tagsField) {
        try {
          tags = JSON.parse(tagsField);
        } catch {
          /* ignore */
        }
      }

      // Check for missing translations in content
      if (content?.quick && !content.quick.en) warnings.push('Missing content EN');
      if (content?.quick && !content.quick.pt) warnings.push('Missing content PT');

      rows.push({ id, specialty, titles, synonyms, content, tags, warnings });
    } catch (e) {
      console.warn(`Row ${i} parse error:`, e);
    }
  }
  return rows;
}

export default function AdminImportProcedures() {
  const { t } = useLang();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [rowResults, setRowResults] = useState<RowResult[]>([]);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
      setResult(null);
      setRowResults([]);
    };
    reader.readAsText(file, 'utf-8');
  }, []);

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    setRowResults([]);

    const allResults: RowResult[] = [];

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (row): Promise<RowResult> => {
          const { error } = await supabase.from('procedures' as any).upsert(
            {
              id: row.id,
              specialty: row.specialty,
              titles: row.titles,
              synonyms: row.synonyms,
              content: row.content,
              tags: row.tags,
            } as any,
            { onConflict: 'id' },
          );
          if (error) {
            return { id: row.id, status: 'error', message: error.message };
          }
          return { id: row.id, status: 'ok', message: 'OK' };
        }),
      );

      allResults.push(...batchResults);
      setRowResults([...allResults]);
    }

    const success = allResults.filter((r) => r.status === 'ok').length;
    const failed = allResults.filter((r) => r.status === 'error').length;
    const errors = allResults
      .filter((r) => r.status === 'error')
      .map((r) => `${r.id}: ${r.message}`);

    await supabase.from('import_logs' as any).insert({
      total: rows.length,
      success,
      failed,
      errors,
    } as any);

    setResult({ success, failed, errors });
    setImporting(false);
  };

  const totalWarnings = rows.reduce((acc, r) => acc + r.warnings.length, 0);

  return (
    <div className="container max-w-3xl py-6 space-y-5">
      <h1 className="text-xl font-bold text-foreground">{t('import_procedures')}</h1>

      {/* Upload */}
      <Card className="clinical-shadow">
        <CardContent className="p-4">
          <label className="flex flex-col items-center gap-3 cursor-pointer rounded-lg border-2 border-dashed border-border p-6 hover:border-accent/50 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t('upload_csv')}</span>
            <p className="text-xs text-muted-foreground mt-1">
              Format: id;specialty;titles;synonyms;content;tags (JSON) — ou
              title_fr;title_en;title_pt
            </p>
            <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
          </label>
        </CardContent>
      </Card>

      {/* Preview */}
      {rows.length > 0 && !result && (
        <Card className="clinical-shadow">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('import_preview')} — {rows.length} {t('rows_parsed')}
                {totalWarnings > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] gap-0.5 border-amber-400 text-amber-600"
                  >
                    <AlertTriangle className="h-2.5 w-2.5" />
                    {totalWarnings} {t('missing_translations')}
                  </Badge>
                )}
              </h2>
              <button
                onClick={handleImport}
                disabled={importing}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {importing
                  ? `${t('loading')} ${rowResults.length}/${rows.length}`
                  : t('import_run')}
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-muted/30"
                >
                  <span className="font-mono text-muted-foreground">{r.id}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {r.specialty}
                  </Badge>
                  <span className="text-foreground truncate">
                    {r.titles.fr || r.titles.en || '–'}
                  </span>
                  {r.warnings.length > 0 && (
                    <span
                      className="text-amber-500 text-[10px] ml-auto"
                      title={r.warnings.join(', ')}
                    >
                      ⚠ {r.warnings.length}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress during import */}
      {importing && rowResults.length > 0 && (
        <Card className="clinical-shadow">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('loading')} {rowResults.length}/{rows.length}…
            </p>
            <RowResultTable results={rowResults} />
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card className="clinical-shadow">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {t('import_success')}: {result.success}/{rows.length}
              </span>
              {result.failed > 0 && (
                <span className="flex items-center gap-1 text-sm font-semibold text-destructive">
                  <XCircle className="h-4 w-4" />
                  {t('import_failed')}: {result.failed}
                </span>
              )}
            </div>
            {rowResults.length > 0 && <RowResultTable results={rowResults} />}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RowResultTable({ results }: { results: RowResult[] }) {
  return (
    <div className="max-h-60 overflow-y-auto rounded border border-border">
      <table className="w-full text-xs">
        <thead className="bg-muted/50 sticky top-0">
          <tr>
            <th className="px-2 py-1 text-left font-medium text-muted-foreground">ID</th>
            <th className="px-2 py-1 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-2 py-1 text-left font-medium text-muted-foreground">Message</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.id} className="border-t border-border hover:bg-muted/20">
              <td className="px-2 py-1 font-mono text-muted-foreground">{r.id}</td>
              <td className="px-2 py-1">
                {r.status === 'ok' ? (
                  <span className="text-primary font-medium">OK</span>
                ) : (
                  <span className="text-destructive font-medium">Error</span>
                )}
              </td>
              <td className="px-2 py-1 text-muted-foreground truncate max-w-[200px]">
                {r.message}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
