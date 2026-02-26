import { useState, useCallback } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, XCircle, FileText } from 'lucide-react';

interface ParsedRow {
  id: string;
  specialty: string;
  titles: any;
  synonyms: any;
  content: any;
  tags: any;
}

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
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];
  // Skip header
  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < 6) continue;
    try {
      const id = fields[0].trim();
      const specialty = fields[1].trim();
      const titles = JSON.parse(fields[2]);
      const synonyms = fields[3] ? JSON.parse(fields[3]) : {};
      const content = fields[4] ? JSON.parse(fields[4]) : {};
      const tags = fields[5] ? JSON.parse(fields[5]) : [];
      if (!id || !specialty) continue;
      rows.push({ id, specialty, titles, synonyms, content, tags });
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
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
      setResult(null);
    };
    reader.readAsText(file, 'utf-8');
  }, []);

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    for (const row of rows) {
      const { error } = await supabase.from('procedures' as any).upsert(
        {
          id: row.id,
          specialty: row.specialty,
          titles: row.titles,
          synonyms: row.synonyms,
          content: row.content,
          tags: row.tags,
        } as any,
        { onConflict: 'id' }
      );
      if (error) {
        failed++;
        errors.push(`${row.id}: ${error.message}`);
      } else {
        success++;
      }
    }

    // Log import
    await supabase.from('import_logs' as any).insert({
      total: rows.length,
      success,
      failed,
      errors,
    } as any);

    setResult({ success, failed, errors });
    setImporting(false);
  };

  return (
    <div className="container max-w-3xl py-6 space-y-5">
      <h1 className="text-xl font-bold text-foreground">{t('import_procedures')}</h1>

      {/* Upload */}
      <Card className="clinical-shadow">
        <CardContent className="p-4">
          <label className="flex flex-col items-center gap-3 cursor-pointer rounded-lg border-2 border-dashed border-border p-6 hover:border-accent/50 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t('upload_csv')}</span>
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
              </h2>
              <button
                onClick={handleImport}
                disabled={importing}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {importing ? t('loading') : t('import_run')}
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {rows.map((r) => (
                <div key={r.id} className="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-muted/30">
                  <span className="font-mono text-muted-foreground">{r.id}</span>
                  <Badge variant="secondary" className="text-[10px]">{r.specialty}</Badge>
                  <span className="text-foreground truncate">{r.titles.fr || r.titles.en || '–'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card className="clinical-shadow">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {t('import_success')}: {result.success}/{rows.length}
              </span>
            </div>
            {result.failed > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">{t('import_failed')}: {result.failed}</span>
                </div>
                <ul className="max-h-40 overflow-y-auto space-y-0.5">
                  {result.errors.map((e, i) => (
                    <li key={i} className="text-xs text-muted-foreground font-mono">{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
