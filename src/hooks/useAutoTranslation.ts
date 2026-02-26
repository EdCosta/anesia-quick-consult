import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Lang } from '@/contexts/LanguageContext';

interface AutoTranslationResult {
  translatedContent: any | null;
  isTranslating: boolean;
  isAutoTranslated: boolean;
  error: string | null;
}

export function useAutoTranslation(
  procedureId: string,
  lang: Lang,
  contentFr: any | null,
  enabled: boolean
): AutoTranslationResult {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['auto-translation', procedureId, lang],
    queryFn: async () => {
      // Check localStorage cache first
      const cacheKey = `anesia-translation-${procedureId}-${lang}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch { /* ignore bad cache */ }
      }

      const { data: fnData, error: fnError } = await supabase.functions.invoke('translate-content', {
        body: { content: contentFr, targetLang: lang },
      });

      if (fnError) throw new Error(fnError.message || 'Translation failed');
      if (data?.error) throw new Error(data.error);

      const translated = fnData?.translated;
      if (translated) {
        localStorage.setItem(cacheKey, JSON.stringify(translated));
      }
      return translated;
    },
    enabled: enabled && lang !== 'fr' && !!contentFr && !!procedureId,
    staleTime: 24 * 60 * 60 * 1000, // 24h
    retry: 1,
  });

  return {
    translatedContent: data ?? null,
    isTranslating: isLoading && enabled,
    isAutoTranslated: !!data && enabled,
    error: error ? (error as Error).message : null,
  };
}
