import type { Guideline, Protocole, ALRBlock } from '@/lib/types';
import { normalizeLocalizedValue } from './i18n';

export function normalizeGuideline(input: Partial<Guideline>): Guideline {
  return {
    id: input.id || '',
    category: input.category || '',
    titles: normalizeLocalizedValue(input.titles, () => ''),
    items: normalizeLocalizedValue(input.items, () => []),
    references: input.references || [],
    tags: input.tags || [],
    specialties: input.specialties || [],
    organization: input.organization,
    recommendation_strength: input.recommendation_strength,
  };
}

export function dbRowToGuideline(row: any): Guideline {
  return normalizeGuideline({
    id: row.id,
    category: row.category,
    titles: row.titles,
    items: row.items,
    references: row.refs || [],
    tags: row.tags || [],
    specialties: row.specialties || [],
    organization: row.organization || undefined,
    recommendation_strength: row.recommendation_strength ?? undefined,
  });
}

export function normalizeProtocole(input: Partial<Protocole>): Protocole {
  return {
    id: input.id || '',
    category: input.category || '',
    titles: normalizeLocalizedValue(input.titles, () => ''),
    steps: normalizeLocalizedValue(input.steps, () => []),
    references: input.references || [],
    tags: input.tags || [],
  };
}

export function dbRowToProtocole(row: any): Protocole {
  return normalizeProtocole({
    id: row.id,
    category: row.category,
    titles: row.titles,
    steps: row.steps,
    references: row.refs || [],
    tags: row.tags || [],
  });
}

export function normalizeALRBlock(input: Partial<ALRBlock>): ALRBlock {
  return {
    id: input.id || '',
    region: input.region || '',
    titles: normalizeLocalizedValue(input.titles, () => ''),
    indications: normalizeLocalizedValue(input.indications, () => []),
    contraindications: normalizeLocalizedValue(input.contraindications, () => []),
    technique: normalizeLocalizedValue(input.technique, () => []),
    drugs: normalizeLocalizedValue(input.drugs, () => []),
    tags: input.tags || [],
  };
}

export function dbRowToALRBlock(row: any): ALRBlock {
  return normalizeALRBlock({
    id: row.id,
    region: row.region,
    titles: row.titles,
    indications: row.indications || {},
    contraindications: row.contraindications || {},
    technique: row.technique || {},
    drugs: row.drugs || {},
    tags: row.tags || [],
  });
}
