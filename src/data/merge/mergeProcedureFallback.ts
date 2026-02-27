import type { Procedure } from '@/lib/types';
import { validateArray, ProcedureSchema } from '@/data/schemas/jsonSchemas';
import { mergeProcedureData, normalizeProcedure } from '../normalize/normalizeProcedure';

/**
 * Fill only missing procedure fields from JSON fallback (never overwrite DB data).
 */
export function mergeProcedureFallbackData(
  dbProcedures: Procedure[],
  jsonProcedures: Procedure[],
): Procedure[] {
  const jsonMap = new Map(jsonProcedures.map((p) => [p.id, p]));
  return dbProcedures.map((proc) => {
    const normalized = normalizeProcedure(proc);
    const fallback = jsonMap.get(proc.id);
    if (!fallback) return normalized;
    return mergeProcedureData(normalized, normalizeProcedure(fallback));
  });
}

export async function mergeProcedureFallback(dbProcedures: Procedure[]): Promise<Procedure[]> {
  try {
    const jsonRaw = await fetch('/data/procedures.v3.json').then((r) => {
      if (!r.ok) throw new Error(`procedures.v3.json: ${r.status}`);
      return r.json();
    });
    const jsonProcedures = validateArray<Procedure>(
      jsonRaw,
      ProcedureSchema,
      'procedures-fallback',
    );
    return mergeProcedureFallbackData(dbProcedures, jsonProcedures);
  } catch (_e) {
    return dbProcedures.map(normalizeProcedure);
  }
}
