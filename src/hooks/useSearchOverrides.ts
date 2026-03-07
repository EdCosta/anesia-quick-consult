import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  SearchIntentSynonymOverride,
  SearchRedirectOverride,
} from '@/lib/searchOverrides.config';

type SearchOverrideRow = {
  id: string;
  active: boolean;
  intent_id: string;
  kind: string;
  query: string;
  route: string | null;
};

export function useSearchOverrides() {
  const query = useQuery({
    queryKey: ['search-override-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_override_rules')
        .select('id,active,intent_id,kind,query,route')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as SearchOverrideRow[];
    },
    staleTime: 60_000,
  });

  const mappedOverrides = useMemo(() => {
    const rows = query.data || [];
    const synonymBuckets = new Map<string, Set<string>>();
    const redirectOverrides: SearchRedirectOverride[] = [];

    rows.forEach((row) => {
      if (row.kind === 'redirect') {
        redirectOverrides.push({
          query: row.query,
          intentId: row.intent_id,
          route: row.route || undefined,
        });
        return;
      }

      if (row.kind === 'synonym') {
        const bucket = synonymBuckets.get(row.intent_id) || new Set<string>();
        bucket.add(row.query);
        synonymBuckets.set(row.intent_id, bucket);
      }
    });

    const synonymOverrides: SearchIntentSynonymOverride[] = Array.from(
      synonymBuckets.entries(),
    ).map(([intentId, extraSynonyms]) => ({
      intentId,
      extraSynonyms: Array.from(extraSynonyms),
    }));

    return {
      redirectOverrides,
      synonymOverrides,
    };
  }, [query.data]);

  return {
    ...query,
    overrides: mappedOverrides,
  };
}
