import type { Procedure } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { dbRowToProcedure, normalizeProcedure } from '@/data/normalize/normalizeProcedure';
import { mergeProcedureFallback, mergeProcedureFallbackData } from '@/data/merge/mergeProcedureFallback';

export async function loadProceduresFromSupabase(): Promise<Procedure[]> {
  const { data } = await supabase.from('procedures' as any).select('*');
  return ((data as any[]) || []).map(dbRowToProcedure);
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
