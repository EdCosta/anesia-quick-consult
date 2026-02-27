import type { Drug } from '@/lib/types';
import { normalizeLocalizedValue } from './i18n';

export function normalizeDrug(input: Partial<Drug>): Drug {
  return {
    id: input.id || '',
    name: normalizeLocalizedValue(input.name, () => ''),
    dose_rules: input.dose_rules || [],
    concentrations: input.concentrations || [],
    contraindications_notes: input.contraindications_notes || [],
    renal_hepatic_notes: input.renal_hepatic_notes || [],
    tags: input.tags || [],
  };
}

/** Convert a Supabase DB row into the Drug app model */
export function dbRowToDrug(row: any): Drug {
  return normalizeDrug({
    id: row.id,
    name: row.names,
    dose_rules: row.dosing?.dose_rules || [],
    concentrations: row.dosing?.concentrations || [],
    contraindications_notes: row.contraindications || [],
    renal_hepatic_notes: row.notes?.renal_hepatic_notes || [],
    tags: row.tags || [],
  });
}
