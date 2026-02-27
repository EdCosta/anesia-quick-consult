import type { Drug, DrugPresentation, StandardDilution } from '@/lib/types';
import { normalizeLocalizedValue } from './i18n';

function normalizePresentations(input: DrugPresentation[] | undefined): DrugPresentation[] {
  return (input || []).map((item) => ({
    label: item.label || '',
    total_mg: item.total_mg ?? null,
    total_ml: item.total_ml ?? null,
    diluent: item.diluent || undefined,
    container: item.container || undefined,
  }));
}

function normalizeStandardDilutions(input: StandardDilution[] | undefined): StandardDilution[] {
  return (input || []).map((item) => ({
    label: item.label || '',
    target_concentration: item.target_concentration || '',
    diluent: item.diluent || undefined,
    final_volume_ml: item.final_volume_ml ?? null,
    notes: item.notes || [],
  }));
}

export function normalizeDrug(input: Partial<Drug>): Drug {
  return {
    id: input.id || '',
    name: normalizeLocalizedValue(input.name, () => ''),
    dose_rules: input.dose_rules || [],
    concentrations: input.concentrations || [],
    presentations: normalizePresentations(input.presentations),
    standard_dilutions: normalizeStandardDilutions(input.standard_dilutions),
    compatibility_notes: input.compatibility_notes || [],
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
    presentations: row.presentations || [],
    standard_dilutions: row.standard_dilutions || [],
    compatibility_notes: row.compatibility_notes || row.notes?.compatibility_notes || [],
    contraindications_notes: row.contraindications || [],
    renal_hepatic_notes: row.notes?.renal_hepatic_notes || [],
    tags: row.tags || [],
  });
}
