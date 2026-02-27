import type { Procedure } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { dbRowToProcedure, normalizeProcedure } from '@/data/normalize/normalizeProcedure';
import { mergeProcedureFallback, mergeProcedureFallbackData } from '@/data/merge/mergeProcedureFallback';

export async function loadProceduresFromSupabase(): Promise<Procedure[]> {
  const { data } = await supabase
    .from('procedures' as any)
    .select('id,specialty,specialties,titles,synonyms,content,tags,is_pro');
  return ((data as any[]) || []).map(dbRowToProcedure);
}

export async function loadProcedureIndexFromSupabase(): Promise<Procedure[]> {
  const { data } = await supabase
    .from('procedures' as any)
    .select('id,specialty,specialties,titles,synonyms,tags,is_pro')
    .order('specialty')
    .order('id');

  return ((data as any[]) || []).map((row) =>
    normalizeProcedure({
      id: row.id,
      specialty: row.specialty,
      specialties: row.specialties,
      titles: row.titles,
      synonyms: row.synonyms,
      tags: row.tags,
      is_pro: row.is_pro,
    })
  );
}

export function normalizeProcedures(procedures: Procedure[]): Procedure[] {
  return procedures.map(normalizeProcedure);
}

export async function hydrateProcedures(procedures: Procedure[], fallbackProcedures?: Procedure[]): Promise<Procedure[]> {
  const normalized = normalizeProcedures(procedures);
  if (fallbackProcedures) {
    return mergeProcedureFallbackData(normalized, normalizeProcedures(fallbackProcedures));
  }
  return mergeProcedureFallback(normalized);
}
