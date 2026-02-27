import { supabase } from '@/integrations/supabase/client';
import { dbRowToGuideline, dbRowToProtocole, dbRowToALRBlock } from '../normalize/normalizeGuideline';
import type { Procedure, Drug, Guideline, Protocole, ALRBlock } from '@/lib/types';
import { loadProceduresFromSupabase } from './proceduresRepo';
import { loadDrugsFromSupabase } from './drugsRepo';

export async function loadFromSupabase(): Promise<{
  procedures: Procedure[];
  drugs: Drug[];
  guidelines: Guideline[];
  protocoles: Protocole[];
  alrBlocks: ALRBlock[];
} | null> {
  try {
    const [procedures, drugs, guideRes, protoRes, alrRes] = await Promise.all([
      loadProceduresFromSupabase(),
      loadDrugsFromSupabase(),
      supabase.from('guidelines' as any).select('*'),
      supabase.from('protocoles' as any).select('*'),
      supabase.from('alr_blocks' as any).select('*'),
    ]);

    if (procedures.length === 0) return null;

    return {
      procedures,
      drugs,
      guidelines: ((guideRes.data as any[]) || []).map(dbRowToGuideline),
      protocoles: ((protoRes.data as any[]) || []).map(dbRowToProtocole),
      alrBlocks: ((alrRes.data as any[]) || []).map(dbRowToALRBlock),
    };
  } catch (err) {
    console.warn('[AnesIA] Supabase load failed, falling back to JSON:', err);
    return null;
  }
}
