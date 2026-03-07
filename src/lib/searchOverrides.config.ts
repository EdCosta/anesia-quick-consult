export type SearchRedirectOverride = {
  query: string;
  intentId: string;
  route?: string;
};

export type SearchIntentSynonymOverride = {
  intentId: string;
  extraSynonyms: string[];
};

// This file is meant to be easy to edit as search gaps appear in admin analytics.
export const SEARCH_REDIRECT_OVERRIDES: SearchRedirectOverride[] = [
  { query: 'voie difficile', intentId: 'airway' },
  { query: 'difficult airway', intentId: 'airway' },
  { query: 'rsi', intentId: 'emergency' },
  { query: 'crash induction', intentId: 'emergency' },
  { query: 'fracture col femoral', intentId: 'alr' },
];

export const SEARCH_INTENT_SYNONYM_OVERRIDES: SearchIntentSynonymOverride[] = [
  {
    intentId: 'airway',
    extraSynonyms: ['voie difficile', 'laryngoscopie difficile', 'mask ventilation'],
  },
  {
    intentId: 'emergency',
    extraSynonyms: ['rapid sequence', 'induction urgente', 'inducao urgente'],
  },
  {
    intentId: 'alr',
    extraSynonyms: ['hip fracture block', 'bloc fracture hanche', 'femoral neck fracture'],
  },
];
