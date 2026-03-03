import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.97.0';
import { jsonResponse, corsHeaders } from '../_shared/cors.ts';
import { buildPrompt } from './utils/buildPrompt.ts';
import { detectPII } from './utils/detectPII.ts';
import { logAIRequest } from './utils/logAIRequest.ts';
import { rateLimitCheck } from './utils/rateLimitCheck.ts';
import type {
  AIAnswerRequest,
  ConversationMessage,
  GuidelineContext,
  HospitalProtocolContext,
  JsonObject,
  JsonValue,
  ParsedAIAnswer,
  ProcedureContext,
} from './utils/types.ts';

const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
const DEFAULT_RATE_LIMIT_MAX = 20;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const DEFAULT_HISTORY_LIMIT = 20;

class HttpError extends Error {
  readonly status: number;
  readonly payload: Record<string, unknown>;

  constructor(status: number, message: string, payload: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.payload = {
      error: message,
      ...payload,
    };
  }
}

type AuthenticatedClients = {
  adminClient: SupabaseClient;
  userId: string;
};

type StoredMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type OpenAIUsage = {
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
};

type OpenAIResponsePayload = {
  output_text?: string;
  usage?: OpenAIUsage;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

function readEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new HttpError(500, `Missing required environment variable: ${name}`);
  }
  return value;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toJsonObject(value: unknown, fieldName: string): JsonObject | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!isJsonObject(value)) {
    throw new HttpError(400, `${fieldName} must be an object when provided.`);
  }

  return value;
}

function buildThreadTitle(question: string): string {
  const sanitized = question.replace(/\s+/g, ' ').trim();
  if (!sanitized) {
    return 'New AI thread';
  }

  const trimmed = sanitized.slice(0, 72).trim();
  return trimmed.length < sanitized.length ? `${trimmed}...` : trimmed;
}

function normalizeStringArray(value: unknown, limit = 5): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function extractOutputText(payload: OpenAIResponsePayload): string {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const fragments: string[] = [];

  for (const item of payload.output ?? []) {
    for (const contentItem of item.content ?? []) {
      if (contentItem.type === 'output_text' && typeof contentItem.text === 'string') {
        fragments.push(contentItem.text);
      }
    }
  }

  return fragments.join('\n').trim();
}

function parseAIAnswer(rawText: string): ParsedAIAnswer {
  if (!rawText) {
    throw new HttpError(502, 'AI response was empty.');
  }

  try {
    const parsed = JSON.parse(rawText) as Partial<ParsedAIAnswer>;
    const answer =
      typeof parsed.answer === 'string' && parsed.answer.trim() ? parsed.answer.trim() : rawText;

    return {
      answer,
      flags: normalizeStringArray(parsed.flags),
      followUpQuestions: normalizeStringArray(parsed.followUpQuestions, 3),
    };
  } catch {
    return {
      answer: rawText,
      flags: [],
      followUpQuestions: [],
    };
  }
}

function resolveHospitalProfileId(constraints: JsonObject | undefined): string | null {
  if (!constraints) {
    return null;
  }

  const candidate =
    typeof constraints.hospitalId === 'string'
      ? constraints.hospitalId
      : typeof constraints.hospitalProfileId === 'string'
        ? constraints.hospitalProfileId
        : null;

  return candidate?.trim() || null;
}

function buildOpenAITools(constraints: JsonObject | undefined) {
  if (!constraints) {
    return [];
  }

  const candidate =
    Array.isArray(constraints.vectorStoreIds)
      ? constraints.vectorStoreIds
      : Array.isArray(constraints.fileSearchVectorStoreIds)
        ? constraints.fileSearchVectorStoreIds
        : [];

  const vectorStoreIds = candidate.filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  );

  if (vectorStoreIds.length === 0) {
    return [];
  }

  return [
    {
      type: 'file_search',
      vector_store_ids: vectorStoreIds,
    },
  ];
}

async function authenticateRequest(req: Request): Promise<AuthenticatedClients> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new HttpError(401, 'Missing Authorization header.', { code: 'AUTH_REQUIRED' });
  }

  const supabaseUrl = readEnv('SUPABASE_URL');
  const supabaseAnonKey = readEnv('SUPABASE_ANON_KEY');
  const serviceRoleKey = readEnv('SUPABASE_SERVICE_ROLE_KEY');

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) {
    throw new HttpError(401, 'Unauthorized.', { code: 'AUTH_REQUIRED' });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return {
    adminClient,
    userId: user.id,
  };
}

async function resolveThreadId(
  adminClient: SupabaseClient,
  userId: string,
  threadId: string | undefined,
  question: string,
  language: string,
  procedureId: string | undefined,
): Promise<string> {
  if (threadId) {
    const { data, error } = await adminClient
      .from('ai_threads')
      .select('id,user_id')
      .eq('id', threadId)
      .maybeSingle();

    if (error) {
      throw new HttpError(500, 'Failed to verify thread ownership.', {
        code: 'THREAD_LOOKUP_FAILED',
      });
    }

    if (!data) {
      throw new HttpError(404, 'Thread not found.', { code: 'THREAD_NOT_FOUND' });
    }

    if ((data as { user_id?: string }).user_id !== userId) {
      throw new HttpError(403, 'You do not have access to this thread.', {
        code: 'THREAD_FORBIDDEN',
      });
    }

    return threadId;
  }

  const insertPayload: Record<string, string> = {
    user_id: userId,
    title: buildThreadTitle(question),
    language,
  };

  if (procedureId) {
    insertPayload.procedure_id = procedureId;
  }

  const { data, error } = await adminClient
    .from('ai_threads')
    .insert(insertPayload)
    .select('id')
    .single();

  if (error || !data) {
    throw new HttpError(500, 'Failed to create thread.', { code: 'THREAD_CREATE_FAILED' });
  }

  return (data as { id: string }).id;
}

async function fetchThreadHistory(
  adminClient: SupabaseClient,
  threadId: string,
): Promise<ConversationMessage[]> {
  const { data, error } = await adminClient
    .from('ai_messages')
    .select('role,content')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(DEFAULT_HISTORY_LIMIT);

  if (error) {
    throw new HttpError(500, 'Failed to load thread history.', { code: 'HISTORY_LOOKUP_FAILED' });
  }

  return (Array.isArray(data) ? data : [])
    .map((row) => row as StoredMessage)
    .filter(
      (row) =>
        (row.role === 'user' || row.role === 'assistant') &&
        typeof row.content === 'string' &&
        row.content.trim().length > 0,
    )
    .map((row) => ({
      role: row.role,
      content: row.content,
    }));
}

async function insertMessage(
  adminClient: SupabaseClient,
  payload: {
    threadId: string;
    userId: string;
    role: 'user' | 'assistant';
    content: string;
  },
): Promise<void> {
  const { error } = await adminClient.from('ai_messages').insert({
    thread_id: payload.threadId,
    user_id: payload.userId,
    role: payload.role,
    content: payload.content,
  });

  if (error) {
    throw new HttpError(500, 'Failed to save chat message.', { code: 'MESSAGE_SAVE_FAILED' });
  }
}

async function fetchProcedureContext(
  adminClient: SupabaseClient,
  procedureId: string | undefined,
): Promise<ProcedureContext | null> {
  if (!procedureId) {
    return null;
  }

  const { data, error } = await adminClient
    .from('procedures')
    .select('id,specialty,titles,content,tags')
    .eq('id', procedureId)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, 'Failed to load procedure context.', {
      code: 'PROCEDURE_LOOKUP_FAILED',
    });
  }

  if (!data) {
    return null;
  }

  const row = data as {
    id: string;
    specialty?: string | null;
    titles?: JsonValue;
    content?: JsonValue;
    tags?: JsonValue;
  };

  return {
    id: row.id,
    specialty: row.specialty ?? null,
    titles: row.titles,
    content: row.content,
    tags: row.tags,
  };
}

async function fetchGuidelineContext(
  adminClient: SupabaseClient,
  procedureId: string | undefined,
): Promise<GuidelineContext[]> {
  if (!procedureId) {
    return [];
  }

  const { data, error } = await adminClient
    .from('recommendations')
    .select(
      'id,version_id,title,recommendation_text,strength,evidence_level,contraindications,references',
    )
    .eq('procedure_id', procedureId)
    .limit(8);

  if (error) {
    throw new HttpError(500, 'Failed to load guideline recommendations.', {
      code: 'GUIDELINE_LOOKUP_FAILED',
    });
  }

  const recommendationRows = (Array.isArray(data) ? data : []).map((row) =>
    row as {
      id: string;
      version_id: string;
      title: string;
      recommendation_text: string;
      strength?: string | null;
      evidence_level?: string | null;
      contraindications?: string | null;
      references?: JsonValue;
    },
  );

  if (recommendationRows.length === 0) {
    return [];
  }

  const versionIds = [...new Set(recommendationRows.map((row) => row.version_id).filter(Boolean))];

  const { data: versionData, error: versionError } = await adminClient
    .from('guideline_versions')
    .select('id,source_id,status,version_label,published_date')
    .in('id', versionIds);

  if (versionError) {
    throw new HttpError(500, 'Failed to load guideline versions.', {
      code: 'GUIDELINE_VERSION_LOOKUP_FAILED',
    });
  }

  const activeVersions = new Map(
    (Array.isArray(versionData) ? versionData : [])
      .map((row) =>
        row as {
          id: string;
          source_id?: string | null;
          status?: string | null;
          version_label?: string | null;
          published_date?: string | null;
        },
      )
      .filter((row) => row.status === 'active')
      .map((row) => [row.id, row]),
  );

  if (activeVersions.size === 0) {
    return [];
  }

  const sourceIds = [
    ...new Set(
      Array.from(activeVersions.values())
        .map((row) => row.source_id)
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    ),
  ];

  const sourceById = new Map<string, { name?: string | null; organization?: string | null; region?: string | null; url?: string | null }>();

  if (sourceIds.length > 0) {
    const { data: sourceData, error: sourceError } = await adminClient
      .from('guideline_sources')
      .select('id,name,organization,region,url')
      .in('id', sourceIds);

    if (sourceError) {
      throw new HttpError(500, 'Failed to load guideline sources.', {
        code: 'GUIDELINE_SOURCE_LOOKUP_FAILED',
      });
    }

    for (const row of Array.isArray(sourceData) ? sourceData : []) {
      const source = row as {
        id: string;
        name?: string | null;
        organization?: string | null;
        region?: string | null;
        url?: string | null;
      };

      sourceById.set(source.id, {
        name: source.name ?? null,
        organization: source.organization ?? null,
        region: source.region ?? null,
        url: source.url ?? null,
      });
    }
  }

  return recommendationRows
    .filter((row) => activeVersions.has(row.version_id))
    .map((row) => {
      const version = activeVersions.get(row.version_id);
      const source = version?.source_id ? sourceById.get(version.source_id) : undefined;

      return {
        id: row.id,
        title: row.title,
        recommendationText: row.recommendation_text,
        strength: row.strength ?? null,
        evidenceLevel: row.evidence_level ?? null,
        contraindications: row.contraindications ?? null,
        references: row.references,
        source: {
          ...source,
          versionLabel: version?.version_label ?? null,
          publishedDate: version?.published_date ?? null,
        },
      };
    });
}

async function fetchHospitalProtocolContext(
  adminClient: SupabaseClient,
  hospitalProfileId: string | null,
): Promise<HospitalProtocolContext | null> {
  if (!hospitalProfileId) {
    return null;
  }

  const { data, error } = await adminClient
    .from('hospital_profiles')
    .select('id,name,country,default_lang,protocol_overrides')
    .eq('id', hospitalProfileId)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, 'Failed to load hospital protocol.', {
      code: 'HOSPITAL_PROTOCOL_LOOKUP_FAILED',
    });
  }

  if (!data) {
    return null;
  }

  const row = data as {
    id: string;
    name: string;
    country?: string | null;
    default_lang?: string | null;
    protocol_overrides?: JsonValue;
  };

  return {
    id: row.id,
    name: row.name,
    country: row.country ?? null,
    defaultLang: row.default_lang ?? null,
    protocolOverrides: row.protocol_overrides ?? null,
  };
}

async function callOpenAI(
  promptMessages: ConversationMessage[],
  model: string,
  constraints: JsonObject | undefined,
): Promise<{ parsed: ParsedAIAnswer; usage: Required<OpenAIUsage> }> {
  const apiKey = readEnv('OPENAI_API_KEY');
  const tools = buildOpenAITools(constraints);

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: promptMessages.map((message) => ({
        role: message.role,
        content: [
          {
            type: 'input_text',
            text: message.content,
          },
        ],
      })),
      text: {
        format: {
          type: 'json_schema',
          name: 'clinical_ai_answer',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              answer: {
                type: 'string',
              },
              flags: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              followUpQuestions: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
            required: ['answer', 'flags', 'followUpQuestions'],
          },
        },
      },
      ...(tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI Responses API error:', response.status, errorText);

    if (response.status === 429) {
      throw new HttpError(429, 'AI provider rate limit reached. Please try again shortly.', {
        code: 'OPENAI_RATE_LIMIT',
      });
    }

    throw new HttpError(502, 'AI provider request failed.', {
      code: 'OPENAI_REQUEST_FAILED',
    });
  }

  const payload = (await response.json()) as OpenAIResponsePayload;
  const rawText = extractOutputText(payload);
  const parsed = parseAIAnswer(rawText);

  if (!parsed.answer.trim()) {
    throw new HttpError(502, 'AI response did not contain an answer.', {
      code: 'OPENAI_EMPTY_ANSWER',
    });
  }

  return {
    parsed,
    usage: {
      input_tokens: payload.usage?.input_tokens ?? 0,
      output_tokens: payload.usage?.output_tokens ?? 0,
      total_tokens:
        payload.usage?.total_tokens ??
        (payload.usage?.input_tokens ?? 0) + (payload.usage?.output_tokens ?? 0),
    },
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  try {
    const { adminClient, userId } = await authenticateRequest(req);

    let requestBody: AIAnswerRequest;
    try {
      requestBody = (await req.json()) as AIAnswerRequest;
    } catch {
      throw new HttpError(400, 'Invalid JSON payload.', { code: 'INVALID_JSON' });
    }

    const question =
      typeof requestBody.question === 'string' ? requestBody.question.trim() : '';
    const language =
      typeof requestBody.language === 'string' ? requestBody.language.trim() : '';
    const procedureId =
      typeof requestBody.procedureId === 'string' ? requestBody.procedureId.trim() : undefined;
    const threadId =
      typeof requestBody.threadId === 'string' ? requestBody.threadId.trim() : undefined;
    const patient = toJsonObject(requestBody.patient, 'patient');
    const constraints = toJsonObject(requestBody.constraints, 'constraints');

    if (!question) {
      throw new HttpError(400, 'question is required.', { code: 'QUESTION_REQUIRED' });
    }

    if (!language) {
      throw new HttpError(400, 'language is required.', { code: 'LANGUAGE_REQUIRED' });
    }

    const piiResult = detectPII([question, patient, constraints]);
    if (piiResult.detected) {
      return jsonResponse(
        {
          error:
            'For privacy, remove identifying details such as emails, phone numbers, or long identifiers before sending the request.',
          code: 'PII_DETECTED',
          flags: piiResult.matches.map((match) => match.type),
        },
        400,
      );
    }

    const rateLimit = await rateLimitCheck(adminClient, userId, {
      maxRequests: DEFAULT_RATE_LIMIT_MAX,
      windowMs: DEFAULT_RATE_LIMIT_WINDOW_MS,
    });

    if (!rateLimit.allowed) {
      return jsonResponse(
        {
          error: 'Hourly limit reached. Please wait before sending another AI request.',
          code: 'RATE_LIMITED',
          resetAt: rateLimit.resetAt,
        },
        429,
      );
    }

    const resolvedThreadId = await resolveThreadId(
      adminClient,
      userId,
      threadId,
      question,
      language,
      procedureId,
    );

    const history = await fetchThreadHistory(adminClient, resolvedThreadId);

    await insertMessage(adminClient, {
      threadId: resolvedThreadId,
      userId,
      role: 'user',
      content: question,
    });

    const hospitalProfileId = resolveHospitalProfileId(constraints);
    const [procedure, guidelines, hospitalProtocol] = await Promise.all([
      fetchProcedureContext(adminClient, procedureId),
      fetchGuidelineContext(adminClient, procedureId),
      fetchHospitalProtocolContext(adminClient, hospitalProfileId),
    ]);

    const promptMessages = buildPrompt({
      question,
      language,
      history,
      procedure,
      guidelines,
      hospitalProtocol,
      patient,
      constraints,
    });

    const model = Deno.env.get('OPENAI_MODEL')?.trim() || DEFAULT_OPENAI_MODEL;
    const { parsed, usage } = await callOpenAI(promptMessages, model, constraints);

    await insertMessage(adminClient, {
      threadId: resolvedThreadId,
      userId,
      role: 'assistant',
      content: parsed.answer,
    });

    try {
      await logAIRequest({
        adminClient,
        userId,
        threadId: resolvedThreadId,
        model,
        promptTokens: usage.input_tokens,
        completionTokens: usage.output_tokens,
        totalTokens: usage.total_tokens,
        flags: parsed.flags,
        piiDetected: false,
      });
    } catch (logError) {
      console.error('ai_answer logAIRequest failed:', logError);
    }

    return jsonResponse({
      threadId: resolvedThreadId,
      answer: parsed.answer,
      flags: parsed.flags,
      followUpQuestions: parsed.followUpQuestions,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse(error.payload, error.status);
    }

    console.error('ai_answer unexpected error:', error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unknown server error.',
      },
      500,
    );
  }
});
