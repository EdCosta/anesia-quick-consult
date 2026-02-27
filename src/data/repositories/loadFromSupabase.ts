import { supabase } from '@/integrations/supabase/client';
import {
  dbRowToGuideline,
  dbRowToProtocole,
  dbRowToALRBlock,
} from '../normalize/normalizeGuideline';
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
      supabase
        .from('guidelines' as any)
        .select(
          'id,category,titles,items,refs,tags,specialties,organization,recommendation_strength,version,source,published_at,review_at,evidence_grade',
        ),
      supabase
        .from('protocoles' as any)
        .select(
          'id,category,titles,steps,refs,tags,version,source,published_at,review_at,evidence_grade',
        ),
      supabase
        .from('alr_blocks' as any)
        .select('id,region,titles,indications,contraindications,technique,drugs,tags'),
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
