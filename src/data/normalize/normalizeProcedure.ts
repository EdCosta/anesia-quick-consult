import type { Procedure } from '@/lib/types';
import { mergeMissing, normalizeLocalizedValue } from './i18n';

function createEmptyQuick() {
  return { preop: [], intraop: [], postop: [], red_flags: [], drugs: [] };
}

function createEmptyDeep() {
  return { clinical: [], pitfalls: [], references: [] };
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string' && value.trim()) {
    return [value];
  }

  return [];
}

function normalizeDrugRefs(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (typeof entry === 'string' && entry.trim()) {
      return [{ drug_id: entry, indication_tag: '' }];
    }

    if (!entry || typeof entry !== 'object') return [];

    const drugId =
      'drug_id' in entry && typeof entry.drug_id === 'string' ? entry.drug_id : null;
    if (!drugId) return [];

    const indicationTag =
      'indication_tag' in entry && typeof entry.indication_tag === 'string'
        ? entry.indication_tag
        : '';

    return [{ drug_id: drugId, indication_tag: indicationTag }];
  });
}

function normalizeReferences(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (typeof entry === 'string' && entry.trim()) {
      return [{ source: entry }];
    }

    if (!entry || typeof entry !== 'object') return [];

    const source = 'source' in entry && typeof entry.source === 'string' ? entry.source : null;
    if (!source) return [];

    const reference: {
      source: string;
      year?: number;
      note?: string;
      doi?: string;
      pmid?: string;
      url?: string;
    } = { source };

    if ('year' in entry && typeof entry.year === 'number') reference.year = entry.year;
    if ('note' in entry && typeof entry.note === 'string') reference.note = entry.note;
    if ('doi' in entry && typeof entry.doi === 'string') reference.doi = entry.doi;
    if ('pmid' in entry && typeof entry.pmid === 'string') reference.pmid = entry.pmid;
    if ('url' in entry && typeof entry.url === 'string') reference.url = entry.url;

    return [reference];
  });
}

function normalizeQuickContent(value: unknown) {
  const fallback = createEmptyQuick();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;

  const source = value as Record<string, unknown>;

  return {
    preop: normalizeStringList(source.preop),
    intraop: normalizeStringList(source.intraop),
    postop: normalizeStringList(source.postop),
    red_flags: normalizeStringList(source.red_flags),
    drugs: normalizeDrugRefs(source.drugs),
  };
}

function normalizeDeepContent(value: unknown) {
  const fallback = createEmptyDeep();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;

  const source = value as Record<string, unknown>;

  return {
    clinical: normalizeStringList(source.clinical),
    pitfalls: normalizeStringList(source.pitfalls),
    references: normalizeReferences(source.references),
  };
}

export function normalizeProcedure(input: Partial<Procedure>): Procedure {
  const quick = normalizeLocalizedValue(input.quick, createEmptyQuick);
  const deep = normalizeLocalizedValue(input.deep, createEmptyDeep);

  return {
    id: input.id || '',
    specialty: input.specialty || '',
    specialties: input.specialties || (input.specialty ? [input.specialty] : []),
    titles: normalizeLocalizedValue(input.titles, () => ''),
    synonyms: normalizeLocalizedValue(input.synonyms, () => []),
    quick: {
      fr: normalizeQuickContent(quick.fr),
      en: normalizeQuickContent(quick.en),
      pt: normalizeQuickContent(quick.pt),
    },
    deep: {
      fr: normalizeDeepContent(deep.fr),
      en: normalizeDeepContent(deep.en),
      pt: normalizeDeepContent(deep.pt),
    },
    tags: input.tags || [],
    is_pro: input.is_pro ?? false,
  };
}

/** Convert a Supabase DB row into the Procedure app model */
export function dbRowToProcedure(row: any): Procedure {
  return normalizeProcedure({
    id: row.id,
    specialty: row.specialty,
    specialties: row.specialties,
    titles: row.titles,
    synonyms: row.synonyms,
    quick: row.content?.quick,
    deep: row.content?.deep,
    tags: row.tags,
    is_pro: row.is_pro,
  });
}

export function mergeProcedureData(base: Procedure, fallback: Procedure): Procedure {
  return normalizeProcedure(mergeMissing(base, fallback));
}
