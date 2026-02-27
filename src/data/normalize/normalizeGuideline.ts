import type { Guideline, Protocole, ALRBlock, Reference } from '@/lib/types';
import { normalizeLocalizedValue } from './i18n';

function normalizeReferences(input: Reference[] | undefined): Reference[] {
  return (input || []).map((item) => ({
    source: item.source || '',
    year: item.year,
    note: item.note || undefined,
    doi: item.doi || undefined,
    pmid: item.pmid || undefined,
    url: item.url || undefined,
  }));
}

export function normalizeGuideline(input: Partial<Guideline>): Guideline {
  return {
    id: input.id || '',
    category: input.category || '',
    titles: normalizeLocalizedValue(input.titles, () => ''),
    items: normalizeLocalizedValue(input.items, () => []),
    references: normalizeReferences(input.references),
    tags: input.tags || [],
    specialties: input.specialties || [],
    organization: input.organization,
    recommendation_strength: input.recommendation_strength,
    version: input.version || undefined,
    source: input.source || undefined,
    published_at: input.published_at || undefined,
    review_at: input.review_at || undefined,
    evidence_grade: input.evidence_grade,
  };
}

export function dbRowToGuideline(row: any): Guideline {
  return normalizeGuideline({
    id: row.id,
    category: row.category,
    titles: row.titles,
    items: row.items,
    references: row.references || row.refs || [],
    tags: row.tags || [],
    specialties: row.specialties || [],
    organization: row.organization || undefined,
    recommendation_strength: row.recommendation_strength ?? undefined,
    version: row.version || undefined,
    source: row.source || undefined,
    published_at: row.published_at || undefined,
    review_at: row.review_at || undefined,
    evidence_grade: row.evidence_grade || undefined,
  });
}

export function normalizeProtocole(input: Partial<Protocole>): Protocole {
  return {
    id: input.id || '',
    category: input.category || '',
    titles: normalizeLocalizedValue(input.titles, () => ''),
    steps: normalizeLocalizedValue(input.steps, () => []),
    references: normalizeReferences(input.references),
    tags: input.tags || [],
    version: input.version || undefined,
    source: input.source || undefined,
    published_at: input.published_at || undefined,
    review_at: input.review_at || undefined,
    evidence_grade: input.evidence_grade,
  };
}

export function dbRowToProtocole(row: any): Protocole {
  return normalizeProtocole({
    id: row.id,
    category: row.category,
    titles: row.titles,
    steps: row.steps,
    references: row.references || row.refs || [],
    tags: row.tags || [],
    version: row.version || undefined,
    source: row.source || undefined,
    published_at: row.published_at || undefined,
    review_at: row.review_at || undefined,
    evidence_grade: row.evidence_grade || undefined,
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
