import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Lang } from '@/contexts/LanguageContext';

type ProcedureTranslationSection = 'quick' | 'deep';

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
  section: ProcedureTranslationSection,
  contentFr: any | null,
  enabled: boolean
): AutoTranslationResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['auto-translation', procedureId, lang, section],
    queryFn: async () => {
      // Try to load persisted translation
      try {
        const { data: persistedRow, error: persistedError } = await supabase
          .from('procedure_translations' as any)
          .select('*')
          .eq('procedure_id', procedureId)
          .eq('lang', lang)
          .eq('section', section)
          .maybeSingle();

        if (!persistedError && persistedRow) {
          const row = persistedRow as any;
          if (row.translated_content) {
            return {
              translated: row.translated_content,
              source: 'database' as const,
              reviewStatus: (row.review_status as 'pending' | 'approved' | 'rejected' | null) ?? 'pending',
            };
          }
        }
      } catch {
        // Table may not exist yet, continue to cache/generation
      }

      // Check localStorage cache first
      const cacheKey = `anesia-translation-${procedureId}-${lang}-${section}`;
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
