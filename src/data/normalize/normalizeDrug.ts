import type { Drug } from '@/lib/types';

/** Convert a Supabase DB row into the Drug app model */
export function dbRowToDrug(row: any): Drug {
  return {
    id: row.id,
    name: row.names,
    dose_rules: row.dosing?.dose_rules || [],
    concentrations: row.dosing?.concentrations || [],
    contraindications_notes: row.contraindications || [],
    renal_hepatic_notes: row.notes?.renal_hepatic_notes || [],
  };
}
