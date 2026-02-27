import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RecommendationTagsState {
  procedureTagIds: Set<string> | null;
  guidelineTagIds: Map<string, string[]>;
}

const EMPTY_STATE: RecommendationTagsState = {
  procedureTagIds: null,
  guidelineTagIds: new Map(),
};

function normalizeTagId(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

async function fetchRecommendationTags(
  procedureId: string,
  guidelineIds: string[],
): Promise<RecommendationTagsState> {
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

  return { procedureTagIds, guidelineTagIds };
}

export function useRecommendationTags(procedureId: string | undefined, guidelineIds: string[]) {
  const guidelineKey = guidelineIds.join('|');
  const enabled = !!procedureId && guidelineIds.length > 0;

  const { data } = useQuery({
    queryKey: ['recommendation-tags', procedureId, guidelineKey],
    queryFn: () => fetchRecommendationTags(procedureId!, guidelineIds),
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });

  if (!enabled) return EMPTY_STATE;
  return data ?? EMPTY_STATE;
}
