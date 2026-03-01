import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'npm:zod@3.25.76';
import { requireAdminUser } from '../_shared/admin.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

const publishRequestSchema = z.object({
  id: z.string().trim().min(1, 'id is required'),
  version: z.string().trim().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { adminClient, userId } = await requireAdminUser(req);
    const { id, version } = publishRequestSchema.parse(await req.json());

    const publishedAt = new Date().toISOString();
    const updatePayload: Record<string, unknown> = { published_at: publishedAt };
    if (version !== undefined) {
      updatePayload.version = version;
    }

    const { error: updateError } = await adminClient
      .from('guidelines')
      .update(updatePayload)
      .eq('id', id);

    if (updateError) {
      throw new Error(`Failed to publish guideline: ${updateError.message}`);
    }

    const { error: logError } = await adminClient.from('import_logs').insert({
      user_id: userId,
      entity: 'guidelines',
      source: 'publish',
      inserted_count: 0,
      updated_count: 1,
      error_count: 0,
      errors: [],
    });

    if (logError) {
      console.error('Failed to write import_logs entry:', logError.message);
    }

    return jsonResponse({ ok: true, id, published_at: publishedAt });
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

    console.error('admin-publish-guideline-version error:', error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
});
