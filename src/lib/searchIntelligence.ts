import type { SupportedLang } from '@/lib/types';
import { SEARCH_INTENTS_CONFIG } from '@/lib/searchIntents.config';

export type SearchIntent = {
  id: string;
  title: Record<SupportedLang, string>;
  description: Record<SupportedLang, string>;
  route: string;
  synonyms: string[];
};

const SEARCH_INTENTS: SearchIntent[] = SEARCH_INTENTS_CONFIG;

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
