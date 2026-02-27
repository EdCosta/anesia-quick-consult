import type { Procedure } from '@/lib/types';
import { validateArray } from '../repositories/loadFromJson';
import { z } from 'zod';
import { mergeProcedureData, normalizeProcedure } from '../normalize/normalizeProcedure';

const ProcedureSchema = z.object({ id: z.string(), specialty: z.string(), titles: z.object({ fr: z.string() }).passthrough(), quick: z.object({ fr: z.any() }).passthrough() }).passthrough();

/**
 * Fill only missing procedure fields from JSON fallback (never overwrite DB data).
 */
export function mergeProcedureFallbackData(dbProcedures: Procedure[], jsonProcedures: Procedure[]): Procedure[] {
  const jsonMap = new Map(jsonProcedures.map(p => [p.id, p]));
  return dbProcedures.map((proc) => {
    const normalized = normalizeProcedure(proc);
    const fallback = jsonMap.get(proc.id);
    if (!fallback) return normalized;
    return mergeProcedureData(normalized, normalizeProcedure(fallback));
  });
}

export async function mergeProcedureFallback(dbProcedures: Procedure[]): Promise<Procedure[]> {
  try {
    const jsonRaw = await fetch('/data/procedures.v3.json').then(r => {
      if (!r.ok) throw new Error(`procedures.v3.json: ${r.status}`);
      return r.json();
    });
    const jsonProcedures = validateArray<Procedure>(jsonRaw, ProcedureSchema, 'procedures-fallback');
    return mergeProcedureFallbackData(dbProcedures, jsonProcedures);
  } catch (_e) {
    return dbProcedures.map(normalizeProcedure);
  }
}
