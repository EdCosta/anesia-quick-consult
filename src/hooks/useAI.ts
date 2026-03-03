import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SupportedLang } from '@/lib/types';

interface AIRequestPayload {
  question: string;
  procedureId?: string;
  threadId?: string;
  language: SupportedLang;
  patient?: Record<string, unknown>;
  constraints?: Record<string, unknown>;
}

interface AIResponseBody {
  threadId?: string;
  flags?: string[];
  followUpQuestions?: string[];
  answer?: string;
  content?: string;
  text?: string;
  response?: string;
  message?: string;
}

interface AIResult {
  answer: string;
  flags: string[];
  followUpQuestions: string[];
  threadId?: string;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

function parseResponse(payload: unknown): AIResult {
  if (typeof payload === 'string') {
    return {
      answer: payload,
      flags: [],
      followUpQuestions: [],
    };
  }

  if (!payload || typeof payload !== 'object') {
    return {
      answer: '',
      flags: [],
      followUpQuestions: [],
    };
  }

  const body = payload as AIResponseBody;

  return {
    answer: body.answer || body.content || body.text || body.response || body.message || '',
    flags: normalizeStringArray(body.flags),
    followUpQuestions: normalizeStringArray(body.followUpQuestions),
    threadId: typeof body.threadId === 'string' && body.threadId.trim() ? body.threadId : undefined,
  };
}

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
  }, []);

  useEffect(() => cancel, [cancel]);

  const ask = useCallback(async (payload: AIRequestPayload) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !publishableKey) {
      const envError = 'Supabase configuration is missing.';
      setError(envError);
      throw new Error(envError);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setError(null);
    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Inicie sessao para utilizar o assistente IA.');
      }

      const response = await fetch(new URL('/functions/v1/ai_answer', supabaseUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: publishableKey,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'AI request failed.');
      }

      // Kept on fetch so we can switch to streamed reads from response.body later.
      const contentType = response.headers.get('content-type') || '';
      const body = contentType.includes('application/json')
        ? await response.json()
        : await response.text();
      const result = parseResponse(body);
      const answer = result.answer.trim();

      if (!answer) {
        throw new Error('AI response was empty.');
      }

      return {
        ...result,
        answer,
      };
    } catch (requestError) {
      const nextError =
        requestError instanceof Error ? requestError.message : 'Unable to reach the AI service.';
      setError(nextError);
      throw requestError;
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsLoading(false);
    }
  }, []);

  return {
    ask,
    cancel,
    error,
    isLoading,
  };
}

export type { AIRequestPayload };
