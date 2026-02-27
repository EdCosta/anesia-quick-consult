import type { Procedure } from '@/lib/types';
import { mergeMissing, normalizeLocalizedValue } from './i18n';

function createEmptyQuick() {
  return { preop: [], intraop: [], postop: [], red_flags: [], drugs: [] };
}

function createEmptyDeep() {
  return { clinical: [], pitfalls: [], references: [] };
}

export function normalizeProcedure(input: Partial<Procedure>): Procedure {
  return {
    id: input.id || '',
    specialty: input.specialty || '',
    specialties: input.specialties || (input.specialty ? [input.specialty] : []),
    titles: normalizeLocalizedValue(input.titles, () => ''),
    synonyms: normalizeLocalizedValue(input.synonyms, () => []),
    quick: normalizeLocalizedValue(input.quick, createEmptyQuick),
    deep: normalizeLocalizedValue(input.deep, createEmptyDeep),
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
