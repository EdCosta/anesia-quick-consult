import { supabase } from '@/integrations/supabase/client';
import { dbRowToProcedure } from '../normalize/normalizeProcedure';
import { dbRowToDrug } from '../normalize/normalizeDrug';
import { dbRowToGuideline, dbRowToProtocole, dbRowToALRBlock } from '../normalize/normalizeGuideline';
import type { Procedure, Drug, Guideline, Protocole, ALRBlock } from '@/lib/types';

export async function loadFromSupabase(): Promise<{
  procedures: Procedure[];
  drugs: Drug[];
  guidelines: Guideline[];
  protocoles: Protocole[];
  alrBlocks: ALRBlock[];
} | null> {
  try {
    const [procRes, drugRes, guideRes, protoRes, alrRes] = await Promise.all([
      supabase.from('procedures' as any).select('*'),
      supabase.from('drugs' as any).select('*'),
      supabase.from('guidelines' as any).select('*'),
      supabase.from('protocoles' as any).select('*'),
      supabase.from('alr_blocks' as any).select('*'),
    ]);

    const procData = (procRes.data as any[]) || [];
    if (procData.length === 0) return null;

    return {
      procedures: procData.map(dbRowToProcedure),
      drugs: ((drugRes.data as any[]) || []).map(dbRowToDrug),
      guidelines: ((guideRes.data as any[]) || []).map(dbRowToGuideline),
      protocoles: ((protoRes.data as any[]) || []).map(dbRowToProtocole),
      alrBlocks: ((alrRes.data as any[]) || []).map(dbRowToALRBlock),
    };
  } catch (err) {
    console.warn('[AnesIA] Supabase load failed, falling back to JSON:', err);
    return null;
  }
}
