import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Lang } from '@/contexts/LanguageContext';

interface AutoTranslationResult {
  translatedContent: any | null;
  isTranslating: boolean;
  isAutoTranslated: boolean;
  isPersisted: boolean;
  reviewStatus: 'pending' | 'approved' | 'rejected' | null;
  error: string | null;
}

export function useAutoTranslation(
  procedureId: string,
  lang: Lang,
  contentFr: any | null,
  enabled: boolean
): AutoTranslationResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['auto-translation', procedureId, lang],
    queryFn: async () => {
      const { data: persistedRow, error: persistedError } = await supabase
        .from('procedure_translations' as any)
        .select('translated_content, review_status')
        .eq('procedure_id', procedureId)
        .eq('lang', lang)
        .eq('section', 'quick')
        .maybeSingle();

      if (persistedError) throw new Error(persistedError.message || 'Translation lookup failed');
      if (persistedRow?.translated_content) {
        return {
          translated: persistedRow.translated_content,
          source: 'database' as const,
          reviewStatus: (persistedRow.review_status as 'pending' | 'approved' | 'rejected' | null) ?? 'pending',
        };
      }

      // Check localStorage cache first
      const cacheKey = `anesia-translation-${procedureId}-${lang}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          return {
            translated: JSON.parse(cached),
            source: 'cache' as const,
            reviewStatus: 'pending' as const,
          };
        } catch { /* ignore bad cache */ }
      }

      const { data: fnData, error: fnError } = await supabase.functions.invoke('translate-content', {
        body: { content: contentFr, targetLang: lang },
      });

      if (fnError) throw new Error(fnError.message || 'Translation failed');
      if (fnData?.error) throw new Error(fnData.error);

      const translated = fnData?.translated;
      if (translated) {
        localStorage.setItem(cacheKey, JSON.stringify(translated));
      }
      return {
        translated,
        source: 'generated' as const,
        reviewStatus: translated ? 'pending' as const : null,
      };
    },
    enabled: enabled && lang !== 'fr' && !!contentFr && !!procedureId,
    staleTime: 24 * 60 * 60 * 1000, // 24h
    retry: 1,
  });

  return {
    translatedContent: data?.translated ?? null,
    isTranslating: isLoading && enabled,
    isAutoTranslated: !!data?.translated && enabled,
    isPersisted: data?.source === 'database',
    reviewStatus: data?.reviewStatus ?? null,
    error: error ? (error as Error).message : null,
  };
}
