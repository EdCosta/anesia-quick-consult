import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { SupportedLang } from '@/lib/types';
import {
  createAIId,
  normalizeStructuredAIAnswer,
  sortAIThreads,
  type Message,
  type Thread,
} from '@/components/anesia/AIWidget.types';

type AIThreadRow = {
  id: string;
  title: string;
  language: string;
  procedure_id: string | null;
  created_at: string;
  updated_at: string;
  ai_messages?: Array<{
    id: string;
    role: string;
    content: string;
    created_at: string;
    meta: Json;
  }> | null;
};

type CreateThreadInput = {
  title: string;
  language: SupportedLang;
  procedureId?: string;
  messages: Message[];
};

const QUERY_KEY = ['ai-threads'];

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

function readMetaRecord(meta: Json) {
  return meta && typeof meta === 'object' && !Array.isArray(meta)
    ? (meta as Record<string, Json>)
    : {};
}

function normalizeRemoteThread(row: AIThreadRow): Thread {
  const messages = (row.ai_messages || [])
    .map((message) => {
      const meta = readMetaRecord(message.meta);

      return {
        id: message.id || createAIId('msg'),
        role:
          message.role === 'assistant' || message.role === 'system' || message.role === 'user'
            ? message.role
            : 'assistant',
        content: message.content,
        createdAt: message.created_at,
        flags: normalizeStringArray(meta.flags),
        followUpQuestions: normalizeStringArray(meta.followUpQuestions),
        structured: normalizeStructuredAIAnswer(meta.structured),
      } satisfies Message;
    })
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );

  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    procedureId: row.procedure_id || undefined,
    language:
      row.language === 'fr' || row.language === 'en' || row.language === 'pt'
        ? row.language
        : 'fr',
    messages,
  };
}

async function getCurrentUserId() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user?.id || null;
}

async function fetchAIThreads() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { userId: null, threads: [] as Thread[] };
  }

  const { data, error } = await supabase
    .from('ai_threads')
    .select('id,title,language,procedure_id,created_at,updated_at,ai_messages(id,role,content,created_at,meta)')
    .order('updated_at', { ascending: false })
    .order('created_at', { foreignTable: 'ai_messages', ascending: true });

  if (error) {
    throw error;
  }

  const threads = sortAIThreads(
    (Array.isArray(data) ? data : []).map((row) => normalizeRemoteThread(row as AIThreadRow)),
  );

  return { userId, threads };
}

function buildMessageMeta(message: Message) {
  return {
    flags: message.flags || [],
    followUpQuestions: message.followUpQuestions || [],
    structured: message.structured || null,
  };
}

export function useAIThreads() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUserId(session?.user?.id || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const threadsQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchAIThreads,
    staleTime: 30_000,
  });

  const renameThreadMutation = useMutation({
    mutationFn: async ({ threadId, title }: { threadId: string; title: string }) => {
      const { error } = await supabase.from('ai_threads').update({ title }).eq('id', threadId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const deleteThreadMutation = useMutation({
    mutationFn: async (threadId: string) => {
      const { error } = await supabase.from('ai_threads').delete().eq('id', threadId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const createThreadMutation = useMutation({
    mutationFn: async (input: CreateThreadInput) => {
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        throw new Error('Session required to save AI history.');
      }

      const { data: createdThread, error: threadError } = await supabase
        .from('ai_threads')
        .insert({
          user_id: currentUserId,
          title: input.title,
          language: input.language,
          procedure_id: input.procedureId || null,
        })
        .select('id,title,language,procedure_id,created_at,updated_at')
        .single();

      if (threadError || !createdThread) {
        throw threadError || new Error('Failed to create AI thread.');
      }

      const { error: messageError } = await supabase.from('ai_messages').insert(
        input.messages.map((message) => ({
          id: message.id.startsWith('msg-') ? undefined : message.id,
          thread_id: createdThread.id,
          user_id: currentUserId,
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: message.content,
          created_at: message.createdAt,
          meta: buildMessageMeta(message),
        })),
      );

      if (messageError) {
        throw messageError;
      }

      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      const refreshed = await fetchAIThreads();
      return refreshed.threads.find((thread) => thread.id === createdThread.id) || normalizeRemoteThread({
        ...(createdThread as AIThreadRow),
        ai_messages: input.messages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          created_at: message.createdAt,
          meta: buildMessageMeta(message),
        })),
      });
    },
  });

  return {
    userId,
    threads: useMemo(() => threadsQuery.data?.threads || [], [threadsQuery.data?.threads]),
    isLoading: threadsQuery.isLoading,
    isFetching: threadsQuery.isFetching,
    error: threadsQuery.error,
    refetch: threadsQuery.refetch,
    renameRemoteThread: renameThreadMutation.mutateAsync,
    deleteRemoteThread: deleteThreadMutation.mutateAsync,
    createRemoteThreadFromMessages: createThreadMutation.mutateAsync,
  };
}
