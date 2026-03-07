import type { SupportedLang } from '@/lib/types';

export type SearchIntent = {
  id: string;
  title: Record<SupportedLang, string>;
  description: Record<SupportedLang, string>;
  route: string;
  synonyms: string[];
};

const SEARCH_INTENTS: SearchIntent[] = [
  {
    id: 'ponv',
    title: {
      fr: 'NVPO',
      pt: 'NVPO',
      en: 'PONV',
    },
    description: {
      fr: 'Ouvrir directement le protocole NVPO.',
      pt: 'Abrir diretamente o protocolo NVPO.',
      en: 'Open the PONV protocol directly.',
    },
    route: '/protocoles?category=ponv&open=ponv-protocol',
    synonyms: ['nvpo', 'ponv', 'apfel', 'nausee', 'vomissements', 'nausea', 'vomiting'],
  },
  {
    id: 'airway',
    title: {
      fr: 'Voie aerienne',
      pt: 'Via aerea',
      en: 'Airway',
    },
    description: {
      fr: 'Aller vers l algorithme voie aerienne difficile.',
      pt: 'Ir para o algoritmo de via aerea dificil.',
      en: 'Jump to the difficult-airway algorithm.',
    },
    route: '/protocoles?search=airway&open=difficult-airway-algorithm',
    synonyms: ['voie aerienne', 'via aerea', 'airway', 'difficult airway', 'intubation', 'ett'],
  },
  {
    id: 'alr',
    title: {
      fr: 'ALR',
      pt: 'ALR',
      en: 'Regional',
    },
    description: {
      fr: 'Ouvrir rapidement les blocs regionaux les plus utiles.',
      pt: 'Abrir rapidamente os blocos regionais mais uteis.',
      en: 'Open high-yield regional blocks quickly.',
    },
    route: '/alr?region=lower_limb&open=peng-block',
    synonyms: ['alr', 'regional', 'block', 'peng', 'rachi', 'peridural', 'regional anesthesia'],
  },
  {
    id: 'antibiotic-prophylaxis',
    title: {
      fr: 'Antibioprophylaxie',
      pt: 'Antibioprofilaxia',
      en: 'Antibiotic prophylaxis',
    },
    description: {
      fr: 'Ouvrir la recommandation d antibioprophylaxie.',
      pt: 'Abrir a recomendacao de antibioprofilaxia.',
      en: 'Open the antibiotic prophylaxis recommendation.',
    },
    route: '/guidelines?search=antibioprophylaxie&open=antibioprophylaxie',
    synonyms: ['antibioprophylaxie', 'antibioprofilaxia', 'antibiotic prophylaxis', 'cefazoline'],
  },
  {
    id: 'fragile',
    title: {
      fr: 'Patient fragile',
      pt: 'Doente fragil',
      en: 'Fragile patient',
    },
    description: {
      fr: 'Lancer la consultation pre-anesthesique avec preset fragile.',
      pt: 'Lancar a consulta pre-anestesica com preset fragil.',
      en: 'Launch pre-anesthesia with the fragile-patient preset.',
    },
    route: '/preanest?preset=fragile',
    synonyms: ['fragile', 'frail', 'elderly', 'geriatr', 'comorbide', 'comorbidity'],
  },
  {
    id: 'rcri',
    title: {
      fr: 'Risque cardiaque',
      pt: 'Risco cardiaco',
      en: 'Cardiac risk',
    },
    description: {
      fr: 'Ouvrir directement le score RCRI.',
      pt: 'Abrir diretamente o score RCRI.',
      en: 'Open the RCRI score directly.',
    },
    route: '/calculateurs?open=rcri',
    synonyms: ['rcri', 'cardiac risk', 'risque cardiaque', 'risco cardiaco'],
  },
];

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
