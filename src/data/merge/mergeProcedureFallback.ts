import type { Procedure } from '@/lib/types';
import { validateArray } from '../repositories/loadFromJson';
import { z } from 'zod';

const ProcedureSchema = z.object({ id: z.string(), specialty: z.string(), titles: z.object({ fr: z.string() }).passthrough(), quick: z.object({ fr: z.any() }).passthrough() }).passthrough();

/**
 * Fill missing quick.{lang}.drugs from JSON fallback (never overwrite DB data).
 */
export async function mergeProcedureFallback(dbProcedures: Procedure[]): Promise<Procedure[]> {
  let jsonProcedures: Procedure[] = [];
  try {
    const jsonRaw = await fetch('/data/procedures.v3.json').then(r => {
      if (!r.ok) throw new Error(`procedures.v3.json: ${r.status}`);
      return r.json();
    });
    jsonProcedures = validateArray<Procedure>(jsonRaw, ProcedureSchema, 'procedures-fallback');
  } catch (_e) {
    return dbProcedures;
  }

  const jsonMap = new Map(jsonProcedures.map(p => [p.id, p]));

  for (const proc of dbProcedures) {
    const jsonProc = jsonMap.get(proc.id);
    if (!jsonProc) continue;
    for (const langKey of ['fr', 'en', 'pt'] as const) {
      const qLang = (proc.quick as any)?.[langKey];
      const jLang = (jsonProc.quick as any)?.[langKey];
      if (qLang && (!qLang.drugs || qLang.drugs.length === 0) && jLang?.drugs?.length > 0) {
        qLang.drugs = jLang.drugs;
      }
    }
  }

  return dbProcedures;
}
