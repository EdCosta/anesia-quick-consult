import type { SupportedLang } from '@/lib/types';
import { SEARCH_INTENTS_CONFIG } from '@/lib/searchIntents.config';
import {
  SEARCH_INTENT_SYNONYM_OVERRIDES,
  SEARCH_REDIRECT_OVERRIDES,
} from '@/lib/searchOverrides.config';

export type SearchIntent = {
  id: string;
  title: Record<SupportedLang, string>;
  description: Record<SupportedLang, string>;
  route: string;
  synonyms: string[];
};

const SEARCH_INTENTS: SearchIntent[] = SEARCH_INTENTS_CONFIG.map((intent) => {
  const override = SEARCH_INTENT_SYNONYM_OVERRIDES.find((entry) => entry.intentId === intent.id);
  return {
    ...intent,
    synonyms: Array.from(new Set([...(intent.synonyms || []), ...(override?.extraSynonyms || [])])),
  };
});

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getSearchExpansionTerms(query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const matches = SEARCH_INTENTS.filter((intent) =>
    intent.synonyms.some((synonym) => normalizedQuery.includes(normalize(synonym))),
  );

  return Array.from(
    new Set(
      matches.flatMap((intent) => intent.synonyms).filter((term) => normalize(term) !== normalizedQuery),
    ),
  ).slice(0, 6);
}

export function resolveSearchIntent(query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return null;

  const exactOverride = SEARCH_REDIRECT_OVERRIDES.find(
    (override) => normalize(override.query) === normalizedQuery,
  );

  if (exactOverride) {
    const baseIntent = SEARCH_INTENTS.find((intent) => intent.id === exactOverride.intentId);
    if (baseIntent) {
      return {
        ...baseIntent,
        route: exactOverride.route || baseIntent.route,
      };
    }
  }

  return (
    SEARCH_INTENTS.find((intent) =>
      intent.synonyms.some((synonym) => normalizedQuery.includes(normalize(synonym))),
    ) || null
  );
}

export function getAllSearchIntents() {
  return SEARCH_INTENTS;
}

export function getSearchActionRecommendations(
  queries: string[],
): Array<{ intent: SearchIntent; matchedQueries: string[] }> {
  const buckets = new Map<string, { intent: SearchIntent; matchedQueries: string[] }>();

  for (const query of queries) {
    const intent = resolveSearchIntent(query);
    if (!intent) continue;

    const bucket = buckets.get(intent.id) || { intent, matchedQueries: [] };
    bucket.matchedQueries.push(query);
    buckets.set(intent.id, bucket);
  }

  return Array.from(buckets.values()).sort(
    (left, right) => right.matchedQueries.length - left.matchedQueries.length,
  );
}

export type SearchRedirectSuggestion = {
  query: string;
  intent: SearchIntent;
  route: string;
  kind: 'redirect' | 'synonym';
};

export function getSearchRedirectSuggestions(queries: string[]): SearchRedirectSuggestion[] {
  const normalizedSeen = new Set<string>();
  const suggestions: SearchRedirectSuggestion[] = [];

  for (const query of queries) {
    const intent = resolveSearchIntent(query);
    if (!intent) continue;

    const normalizedQuery = normalize(query);
    const isKnownSynonym = intent.synonyms.some((synonym) => normalize(synonym) === normalizedQuery);
    const dedupeKey = `${intent.id}:${normalizedQuery}`;

    if (normalizedSeen.has(dedupeKey)) continue;
    normalizedSeen.add(dedupeKey);

    suggestions.push({
      query,
      intent,
      route: intent.route,
      kind: isKnownSynonym ? 'redirect' : 'synonym',
    });
  }

  return suggestions;
}

export function buildSearchOverrideConfig(queries: string[]) {
  const suggestions = getSearchRedirectSuggestions(queries);
  const synonymBuckets = new Map<string, Set<string>>();

  for (const suggestion of suggestions) {
    if (suggestion.kind !== 'synonym') continue;

    const bucket = synonymBuckets.get(suggestion.intent.id) || new Set<string>();
    bucket.add(suggestion.query);
    synonymBuckets.set(suggestion.intent.id, bucket);
  }

  return {
    searchRedirectOverrides: suggestions
      .filter((suggestion) => suggestion.kind === 'redirect')
      .map((suggestion) => ({
        query: suggestion.query,
        intentId: suggestion.intent.id,
        route: suggestion.route,
      })),
    searchIntentSynonymOverrides: Array.from(synonymBuckets.entries()).map(
      ([intentId, extraSynonyms]) => ({
        intentId,
        extraSynonyms: Array.from(extraSynonyms),
      }),
    ),
  };
}
