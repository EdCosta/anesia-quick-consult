import type { Drug, DrugPresentation, StandardDilution } from '@/lib/types';
import { normalizeLocalizedValue } from './i18n';

function normalizePresentations(input: DrugPresentation[] | undefined): DrugPresentation[] {
  return (input || []).map((item) => ({
    id: item.id || undefined,
    label: item.label || '',
    total_mg: item.total_mg ?? null,
    total_ml: item.total_ml ?? null,
    mg_per_ml: item.mg_per_ml ?? null,
    diluent: item.diluent || undefined,
    solvent: item.solvent || undefined,
    container: item.container || undefined,
    form: item.form || undefined,
    is_reference: item.is_reference ?? false,
  }));
}

function normalizeStandardDilutions(input: StandardDilution[] | undefined): StandardDilution[] {
  return (input || []).map((item) => ({
    id: item.id || undefined,
    label: item.label || '',
    target_concentration: item.target_concentration || '',
    target_concentration_mg_per_ml: item.target_concentration_mg_per_ml ?? null,
    diluent: item.diluent || undefined,
    final_volume_ml: item.final_volume_ml ?? null,
    drug_volume_ml: item.drug_volume_ml ?? null,
    diluent_volume_ml: item.diluent_volume_ml ?? null,
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
  const embeddedConcentrations = row.dosing?.concentrations || [];
  const presentationConcentrations = (row.presentations || [])
    .filter((item: any) => item?.mg_per_ml !== null && item?.mg_per_ml > 0)
    .map((item: any) => ({
      label: `Stock: ${item.label}`,
      mg_per_ml: item.mg_per_ml,
    }));
  const dilutionConcentrations = (row.standard_dilutions || [])
    .filter(
      (item: any) =>
        item?.target_concentration_mg_per_ml !== null && item?.target_concentration_mg_per_ml > 0,
    )
    .map((item: any) => ({
      label: `Dilution: ${item.label}`,
      mg_per_ml: item.target_concentration_mg_per_ml,
    }));
  const concentrationMap = new Map<string, { label: string; mg_per_ml: number | null }>();

  [...embeddedConcentrations, ...presentationConcentrations, ...dilutionConcentrations].forEach(
    (item: any) => {
      const key = `${item.label}::${item.mg_per_ml ?? 'null'}`;
      if (!concentrationMap.has(key)) {
        concentrationMap.set(key, item);
      }
    },
  );

  return normalizeDrug({
    id: row.id,
    name: row.names,
    dose_rules: row.dosing?.dose_rules || [],
    concentrations: Array.from(concentrationMap.values()),
    presentations: row.presentations || [],
    standard_dilutions: row.standard_dilutions || [],
    compatibility_notes: row.compatibility_notes || row.notes?.compatibility_notes || [],
    contraindications_notes: row.contraindications || [],
    renal_hepatic_notes: row.notes?.renal_hepatic_notes || [],
    tags: row.tags || [],
  });
}
