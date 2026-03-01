import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'npm:zod@3.25.76';
import { requireAdminUser } from '../_shared/admin.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

const MAX_LOGGED_ERRORS = 50;

const referenceSchema = z.object({
  source: z.string(),
  year: z.number().optional(),
  note: z.string().optional(),
  doi: z.string().optional(),
  pmid: z.string().optional(),
  url: z.string().optional(),
});

const guidelineRowSchema = z.object({
  id: z.string().trim().min(1, 'id is required'),
  category: z.string().trim().min(1, 'category is required'),
  titles: z
    .object({ fr: z.string().min(1, 'titles.fr is required') })
    .passthrough(),
  items: z
    .object({ fr: z.array(z.string()).default([]) })
    .passthrough()
    .default({ fr: [] }),
  refs: z.array(referenceSchema).default([]),
  tags: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
  organization: z.string().optional(),
  recommendation_strength: z.number().optional(),
  version: z.string().optional(),
  source: z.string().optional(),
  published_at: z.string().datetime({ offset: true }).optional(),
  review_at: z.string().datetime({ offset: true }).optional(),
  evidence_grade: z.enum(['A', 'B', 'C']).optional(),
});

type GuidelinePayload = z.infer<typeof guidelineRowSchema>;

const importRequestSchema = z.object({
  json: z.string().min(1, 'JSON content is required'),
  filename: z.string().trim().min(1).max(255).default('guidelines.json'),
});

function parseGuidelinesJson(raw: string): { rows: GuidelinePayload[]; errors: string[] } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { rows: [], errors: [`Invalid JSON: ${(e as Error).message}`] };
  }

  if (!Array.isArray(parsed)) {
    return { rows: [], errors: ['JSON root must be an array of guideline objects'] };
  }

  const rows: GuidelinePayload[] = [];
  const errors: string[] = [];
  const seen = new Map<string, number>();

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i] as Record<string, unknown>;
    // Accept `references` as alias for the DB column `refs`
    if (item.references !== undefined && item.refs === undefined) {
      item.refs = item.references;
    }

    const result = guidelineRowSchema.safeParse(item);
    if (!result.success) {
      const issues = result.error.issues
        .map((iss) =>
          iss.path.length > 0 ? `${iss.path.join('.')}: ${iss.message}` : iss.message,
        )
        .join(', ');
      errors.push(`Item ${i + 1} (id=${String(item.id ?? '?')}): ${issues}`);
      continue;
    }

    const { id } = result.data;
    if (seen.has(id)) {
      errors.push(`Item ${i + 1}: duplicate id "${id}" — last entry wins`);
    }
    seen.set(id, i);

    // Replace previous entry for duplicate id (last wins)
    const existingIndex = rows.findIndex((r) => r.id === id);
    if (existingIndex >= 0) {
      rows[existingIndex] = result.data;
    } else {
      rows.push(result.data);
    }
  }

  return { rows, errors };
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
      const { rows, errors } = parseGuidelinesJson(requestBody.json);
      const uniqueIds = rows.map((r) => r.id);
      let existingIds = new Set<string>();

      if (uniqueIds.length > 0) {
        const { data: existingRows, error: existingError } = await adminClient
          .from('guidelines')
          .select('id')
          .in('id', uniqueIds);

        if (existingError) {
          throw new Error(`Failed to inspect existing guidelines: ${existingError.message}`);
        }

        existingIds = new Set((existingRows ?? []).map((row: { id: string }) => row.id));
      }

      const rowsToInsert = rows.filter((r) => !existingIds.has(r.id));
      const rowsToUpdate = rows.filter((r) => existingIds.has(r.id));

      if (rowsToInsert.length > 0) {
        const { error: insertError } = await adminClient.from('guidelines').insert(rowsToInsert);
        if (insertError) {
          throw new Error(`Failed to insert guidelines: ${insertError.message}`);
        }
      }

      if (rowsToUpdate.length > 0) {
        const { error: upsertError } = await adminClient
          .from('guidelines')
          .upsert(rowsToUpdate, { onConflict: 'id' });
        if (upsertError) {
          throw new Error(`Failed to update guidelines: ${upsertError.message}`);
        }
      }

      const loggedErrors = errors.slice(0, MAX_LOGGED_ERRORS);

      const { error: logError } = await adminClient.from('import_logs').insert({
        user_id: userId,
        entity: 'guidelines',
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
      await adminClient.from('import_logs').insert({
        user_id: userId,
        entity: 'guidelines',
        source: requestBody.filename,
        inserted_count: 0,
        updated_count: 0,
        error_count: 1,
        errors: [message],
      });
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

    console.error('admin-import-guidelines error:', error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
});
