import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export type AIResponseMode = 'checklist' | 'plan' | 'quick' | 'risk';

const STORAGE_KEY = 'anesia-ai-response-mode';
const QUERY_KEY = ['ai-user-preferences'];

function normalizeResponseMode(value: string | null | undefined): AIResponseMode {
  return value === 'checklist' || value === 'quick' || value === 'risk' ? value : 'plan';
}

async function getCurrentUserId() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user?.id || null;
}

export function useAIPreferences() {
  const queryClient = useQueryClient();
  const [localResponseMode, setLocalResponseMode] = useLocalStorage<AIResponseMode>(
    STORAGE_KEY,
    'plan',
  );

  const preferencesQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) {
        return { userId: null, responseMode: localResponseMode };
      }

      const { data, error } = await supabase
        .from('user_ui_preferences')
        .select('ai_response_mode,user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return {
        userId,
        responseMode: normalizeResponseMode(data?.ai_response_mode),
      };
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  useEffect(() => {
    if (!preferencesQuery.data?.userId) {
      return;
    }

    if (preferencesQuery.data.responseMode !== localResponseMode) {
      setLocalResponseMode(preferencesQuery.data.responseMode);
    }
  }, [localResponseMode, preferencesQuery.data?.responseMode, preferencesQuery.data?.userId, setLocalResponseMode]);

  const setResponseMode = async (nextMode: AIResponseMode) => {
    setLocalResponseMode(nextMode);

    const userId = preferencesQuery.data?.userId || (await getCurrentUserId());
    if (!userId) {
      return;
    }

    const { error } = await supabase.from('user_ui_preferences').upsert({
      user_id: userId,
      ai_response_mode: nextMode,
    });

    if (error) {
      throw error;
    }

    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  return {
    responseMode: preferencesQuery.data?.responseMode || localResponseMode,
    setResponseMode,
    isLoading: preferencesQuery.isLoading,
  };
}
