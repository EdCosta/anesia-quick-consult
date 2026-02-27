import type { Drug } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { normalizeDrug, dbRowToDrug } from '@/data/normalize/normalizeDrug';

export async function loadDrugsFromSupabase(): Promise<Drug[]> {
  const { data } = await supabase
    .from('drugs' as any)
    .select('id,names,class,dosing,notes,contraindications,tags');
  return ((data as any[]) || []).map(dbRowToDrug);
}

export function normalizeDrugs(drugs: Drug[]): Drug[] {
  return drugs.map(normalizeDrug);
}

export function resolveDrugs(dbDrugs: Drug[], fallbackDrugs: Drug[]): Drug[] {
  if (dbDrugs.length > 0) return normalizeDrugs(dbDrugs);
  return normalizeDrugs(fallbackDrugs);
}
