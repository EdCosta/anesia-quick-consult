import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RecommendationTagsState {
  procedureTagIds: Set<string> | null;
  guidelineTagIds: Map<string, string[]>;
}

function normalizeTagId(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function useRecommendationTags(procedureId: string | undefined, guidelineIds: string[]) {
  const [state, setState] = useState<RecommendationTagsState>({
    procedureTagIds: null,
    guidelineTagIds: new Map(),
  });

  useEffect(() => {
    if (!procedureId || guidelineIds.length === 0) {
      setState({ procedureTagIds: null, guidelineTagIds: new Map() });
      return;
    }

    let active = true;

    (async () => {
      try {
        const [
          { data: procedureTags, error: procedureError },
          { data: guidelineTags, error: guidelineError },
        ] = await Promise.all([
          supabase
            .from('procedure_tags' as any)
            .select('tag_id')
            .eq('procedure_id', procedureId),
          supabase
            .from('guideline_tags' as any)
            .select('guideline_id, tag_id')
            .in('guideline_id', guidelineIds),
        ]);

        if (procedureError) throw procedureError;
        if (guidelineError) throw guidelineError;
        if (!active) return;

        const procedureTagIds = new Set(
          ((procedureTags as any[]) || []).map((row) => normalizeTagId(row.tag_id)).filter(Boolean),
        );

        const guidelineTagIds = new Map<string, string[]>();
        for (const row of (guidelineTags as any[]) || []) {
          const guidelineId = row.guideline_id;
          const tagId = normalizeTagId(row.tag_id);
          if (!guidelineId || !tagId) continue;

          const current = guidelineTagIds.get(guidelineId) || [];
          current.push(tagId);
          guidelineTagIds.set(guidelineId, current);
        }

        setState({ procedureTagIds, guidelineTagIds });
      } catch (error) {
        console.warn(
          '[AnesIA] Failed to load normalized recommendation tags, falling back to legacy tags.',
          error,
        );
        if (!active) return;
        setState({ procedureTagIds: null, guidelineTagIds: new Map() });
      }
    })();

    return () => {
      active = false;
    };
  }, [procedureId, guidelineIds.join('|')]);

  return state;
}
