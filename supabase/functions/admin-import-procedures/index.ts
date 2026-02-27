import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'npm:zod@3.25.76';
import { requireAdminUser } from '../_shared/admin.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

type ProcedurePayload = {
  id: string;
  specialty: string;
  titles: Record<string, unknown>;
  synonyms: Record<string, unknown>;
  content: Record<string, unknown>;
  tags: unknown[];
  created_at?: string;
  updated_at: string;
};

const MAX_LOGGED_ERRORS = 50;

const importRequestSchema = z.object({
  csv: z.string().min(1, 'CSV content is required'),
  filename: z.string().trim().min(1).max(255).default('procedures.csv'),
});

const procedureRowSchema = z.object({
  id: z.string().trim().min(1, 'id is required'),
  specialty: z.string().trim().min(1, 'specialty is required'),
  titles: z.record(z.unknown()).default({}),
  synonyms: z.record(z.unknown()).default({}),
  content: z.record(z.unknown()).default({}),
  tags: z.array(z.unknown()).default([]),
  created_at: z.string().datetime({ offset: true }).optional(),
});

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ';' && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields;
}

function parseJsonField(
  value: string,
  fallback: Record<string, unknown> | unknown[],
  fieldName: string,
  lineNumber: number,
): Record<string, unknown> | unknown[] {
  if (!value.trim()) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      throw new Error(`${fieldName} must be a JSON array`);
    }
    if (!Array.isArray(fallback) && (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object')) {
      throw new Error(`${fieldName} must be a JSON object`);
    }
    return parsed;
  } catch (error) {
    throw new Error(`Line ${lineNumber}: invalid ${fieldName} JSON (${(error as Error).message})`);
  }
}

function parseProcedureCsv(csv: string): { rows: ProcedurePayload[]; errors: string[] } {
  const cleaned = csv.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleaned.split('\n').filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return { rows: [], errors: ['CSV must include a header and at least one data row'] };
  }

  const header = parseCSVLine(lines[0]).map((field) => field.trim().toLowerCase());
  const fieldIndex = (name: string) => header.indexOf(name);
  const hasJsonTitles = fieldIndex('titles') >= 0;
  const hasMultiLangTitles = fieldIndex('title_fr') >= 0;
  const requiredColumns = ['id', 'specialty'];
  const errors: string[] = [];
  const dedupedRows = new Map<string, ProcedurePayload>();

  for (const column of requiredColumns) {
    if (fieldIndex(column) < 0) {
      errors.push(`Missing required column: ${column}`);
    }
  }

  if (!hasJsonTitles && !hasMultiLangTitles) {
    errors.push('Missing required title columns: titles or title_fr');
  }

  if (errors.length > 0) {
    return { rows: [], errors };
  }

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const values = parseCSVLine(lines[lineIndex]);
    const lineNumber = lineIndex + 1;
    const pick = (name: string) => {
      const index = fieldIndex(name);
      return index >= 0 && index < values.length ? values[index].trim() : '';
    };

    try {
      let titles: Record<string, unknown>;
      if (hasJsonTitles) {
        titles = parseJsonField(pick('titles'), {}, 'titles', lineNumber) as Record<
          string,
          unknown
        >;
      } else {
        const fr = pick('title_fr');
        const en = pick('title_en');
        const pt = pick('title_pt');

        if (!fr) {
          throw new Error(`Line ${lineNumber}: title_fr is required`);
        }

        titles = { fr };
        if (en) {
          titles.en = en;
        }
        if (pt) {
          titles.pt = pt;
        }
      }

      const parsedRow = procedureRowSchema.safeParse({
        id: pick('id'),
        specialty: pick('specialty'),
        titles,
        synonyms: parseJsonField(pick('synonyms'), {}, 'synonyms', lineNumber),
        content: parseJsonField(pick('content'), {}, 'content', lineNumber),
        tags: parseJsonField(pick('tags'), [], 'tags', lineNumber),
        created_at: pick('created_at') || undefined,
      });

      if (!parsedRow.success) {
        const issueText = parsedRow.error.issues
          .map((issue) => issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message)
          .join(', ');
        errors.push(`Line ${lineNumber}: ${issueText}`);
        continue;
      }

      dedupedRows.set(parsedRow.data.id, {
        ...parsedRow.data,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      errors.push((error as Error).message);
    }
  }

  return {
    rows: Array.from(dedupedRows.values()),
    errors,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { adminClient, userId } = await requireAdminUser(req);
    const requestBody = importRequestSchema.parse(await req.json());
    try {
      const { rows, errors } = parseProcedureCsv(requestBody.csv);
      const uniqueIds = rows.map((row) => row.id);
      let existingIds = new Set<string>();

      if (uniqueIds.length > 0) {
        const { data: existingRows, error: existingError } = await adminClient
          .from('procedures')
          .select('id')
          .in('id', uniqueIds);

        if (existingError) {
          throw new Error(`Failed to inspect existing procedures: ${existingError.message}`);
        }

        existingIds = new Set((existingRows ?? []).map((row: { id: string }) => row.id));
      }

      const rowsToInsert = rows.filter((row) => !existingIds.has(row.id)).map((row) => ({
        id: row.id,
        specialty: row.specialty,
        titles: row.titles,
        synonyms: row.synonyms,
        content: row.content,
        tags: row.tags,
        created_at: row.created_at ?? new Date().toISOString(),
        updated_at: row.updated_at,
      }));

      const rowsToUpdate = rows.filter((row) => existingIds.has(row.id)).map((row) => ({
        id: row.id,
        specialty: row.specialty,
        titles: row.titles,
        synonyms: row.synonyms,
        content: row.content,
        tags: row.tags,
        updated_at: row.updated_at,
      }));

      if (rowsToInsert.length > 0) {
        const { error: insertError } = await adminClient.from('procedures').insert(rowsToInsert);
        if (insertError) {
          throw new Error(`Failed to insert procedures: ${insertError.message}`);
        }
      }

      if (rowsToUpdate.length > 0) {
        const { error: upsertError } = await adminClient.from('procedures').upsert(rowsToUpdate, {
          onConflict: 'id',
        });
        if (upsertError) {
          throw new Error(`Failed to update procedures: ${upsertError.message}`);
        }
      }

      const loggedErrors = errors.slice(0, MAX_LOGGED_ERRORS);

      const { error: logError } = await adminClient.from('import_logs').insert({
        user_id: userId,
        entity: 'procedures',
        source: requestBody.filename,
        inserted_count: rowsToInsert.length,
        updated_count: rowsToUpdate.length,
        error_count: errors.length,
        errors: loggedErrors,
      });

      if (logError) {
        console.error('Failed to write import_logs entry:', logError.message);
      }

      return jsonResponse({
        inserted: rowsToInsert.length,
        updated: rowsToUpdate.length,
        errors: loggedErrors,
        total_errors: errors.length,
      });
    } catch (importError) {
      const message = importError instanceof Error ? importError.message : 'Unknown import error';
      const { error: logError } = await adminClient.from('import_logs').insert({
        user_id: userId,
        entity: 'procedures',
        source: requestBody.filename,
        inserted_count: 0,
        updated_count: 0,
        error_count: 1,
        errors: [message],
      });

      if (logError) {
        console.error('Failed to write import_logs entry:', logError.message);
      }

      throw importError;
    }
  } catch (error) {
    if (error instanceof Response) {
      const body = await error.text();
      return new Response(body, {
        status: error.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (error instanceof z.ZodError) {
      return jsonResponse(
        {
          error: 'Invalid request payload',
          details: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        400,
      );
    }

    console.error('admin-import-procedures error:', error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
});
