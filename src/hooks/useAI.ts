import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SupportedLang } from '@/lib/types';

interface AIRequestPayload {
  question: string;
  procedureId?: string;
  procedureTitle?: string;
  language: SupportedLang;
  patient?: Record<string, unknown>;
}

interface AIResponseBody {
  answer?: string;
  content?: string;
  text?: string;
  response?: string;
  message?: string;
}

function extractAnswer(payload: unknown) {
  if (typeof payload === 'string') {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const body = payload as AIResponseBody;

  return body.answer || body.content || body.text || body.response || body.message || '';
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

      const response = await fetch(new URL('/functions/v1/ai_answer', supabaseUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: publishableKey,
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
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
      const answer = extractAnswer(body).trim();

      if (!answer) {
        throw new Error('AI response was empty.');
      }

      return answer;
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
