import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'npm:zod@3.25.76';
import { requireAdminUser } from '../_shared/admin.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

const requestSchema = z.object({
  payload: z.unknown().optional(),
  filename: z.string().trim().min(1).max(255).default('guidelines.json'),
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
    const requestBody = requestSchema.parse(await req.json());

    const { error: logError } = await adminClient.from('import_logs').insert({
      user_id: userId,
      entity: 'guidelines',
      source: requestBody.filename,
      inserted_count: 0,
      updated_count: 0,
      error_count: 1,
      errors: ['Guidelines import is not implemented yet'],
    });

    if (logError) {
      console.error('Failed to write import_logs entry:', logError.message);
    }

    return jsonResponse(
      {
        inserted: 0,
        updated: 0,
        errors: ['Guidelines import is not implemented yet'],
      },
      501,
    );
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
