import type { Drug } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { normalizeDrug, dbRowToDrug } from '@/data/normalize/normalizeDrug';

export async function loadDrugsFromSupabase(): Promise<Drug[]> {
  const [drugRes, presentationRes, dilutionRes] = await Promise.all([
    supabase
      .from('drugs' as any)
      .select(
        'id,names,class,dosing,notes,contraindications,tags,presentations,standard_dilutions,compatibility_notes',
      ),
    supabase
      .from('drug_presentations' as any)
      .select('id,drug_id,label,total_mg,total_ml,mg_per_ml,solvent,form,is_reference'),
    supabase
      .from('standard_dilutions' as any)
      .select(
        'id,drug_id,presentation_id,label,syringe_ml,bag_ml,target_concentration_label,target_concentration_mg_per_ml,diluent,drug_volume_ml,diluent_volume_ml,notes',
      ),
  ]);

  const presentationsByDrug = new Map<string, any[]>();
  ((presentationRes.data as any[]) || []).forEach((item) => {
    const list = presentationsByDrug.get(item.drug_id) || [];
    list.push({
      id: item.id,
      label: item.label,
      total_mg: item.total_mg,
      total_ml: item.total_ml,
      mg_per_ml: item.mg_per_ml,
      solvent: item.solvent,
      form: item.form,
      is_reference: item.is_reference,
    });
    presentationsByDrug.set(item.drug_id, list);
  });

  const dilutionsByDrug = new Map<string, any[]>();
  ((dilutionRes.data as any[]) || []).forEach((item) => {
    const list = dilutionsByDrug.get(item.drug_id) || [];
    list.push({
      id: item.id,
      label: item.label,
      target_concentration: item.target_concentration_label,
      target_concentration_mg_per_ml: item.target_concentration_mg_per_ml,
      diluent: item.diluent,
      final_volume_ml: item.syringe_ml ?? item.bag_ml ?? null,
      drug_volume_ml: item.drug_volume_ml,
      diluent_volume_ml: item.diluent_volume_ml,
      notes: item.notes ? [item.notes] : [],
    });
    dilutionsByDrug.set(item.drug_id, list);
  });

  return ((drugRes.data as any[]) || []).map((row) =>
    dbRowToDrug({
      ...row,
      presentations: presentationsByDrug.get(row.id) || row.presentations || [],
      standard_dilutions: dilutionsByDrug.get(row.id) || row.standard_dilutions || [],
    }),
  );
}

export function normalizeDrugs(drugs: Drug[]): Drug[] {
  return drugs.map(normalizeDrug);
}

export function resolveDrugs(dbDrugs: Drug[], fallbackDrugs: Drug[]): Drug[] {
  if (dbDrugs.length > 0) return normalizeDrugs(dbDrugs);
  return normalizeDrugs(fallbackDrugs);
}
