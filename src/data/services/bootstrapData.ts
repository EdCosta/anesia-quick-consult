import type { ALRBlock, Drug, Guideline, Procedure, Protocole } from '@/lib/types';
import { normalizeProcedure } from '@/data/normalize/normalizeProcedure';
import { enrichMedicationPlan } from '@/data/merge/enrichMedicationPlan';
import { resolveDrugs } from '@/data/repositories/drugsRepo';
import { loadFromSupabase } from '@/data/repositories/loadFromSupabase';
import {
  hydrateProcedures,
  loadProcedureIndexFromSupabase,
} from '@/data/repositories/proceduresRepo';
import {
  loadSpecialtiesFromSupabase,
  type SpecialtyRecord,
} from '@/data/repositories/specialtiesRepo';

const INDEX_CACHE_KEY = 'anesia-data-index-v1';
const FULL_CACHE_KEY = 'anesia-data-full-v1';
const INDEX_TTL = 15 * 60 * 1000;
const FULL_TTL = 30 * 60 * 1000;

interface TimedCache<T> {
  ts: number;
  data: T;
}

export interface ProcedureIndexSnapshot {
  procedures: Procedure[];
  specialtiesData: SpecialtyRecord[];
}

export interface FullDataSnapshot extends ProcedureIndexSnapshot {
  drugs: Drug[];
  guidelines: Guideline[];
  protocoles: Protocole[];
  alrBlocks: ALRBlock[];
}

function readCache<T>(key: string, ttl: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TimedCache<T>;
    if (!parsed?.ts || Date.now() - parsed.ts > ttl) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // Ignore quota or serialization failures.
  }
}

export function projectProcedureIndex(procedures: Procedure[]): Procedure[] {
  return procedures.map((procedure) =>
    normalizeProcedure({
      id: procedure.id,
      specialty: procedure.specialty,
      specialties: procedure.specialties,
      titles: procedure.titles,
      synonyms: procedure.synonyms,
      tags: procedure.tags,
      is_pro: procedure.is_pro,
    }),
  );
}

function toIndexSnapshot(
  procedures: Procedure[],
  specialtiesData: SpecialtyRecord[],
): ProcedureIndexSnapshot {
  return {
    procedures: projectProcedureIndex(procedures),
    specialtiesData,
  };
}

function writeIndexSnapshot(snapshot: ProcedureIndexSnapshot): void {
  writeCache(INDEX_CACHE_KEY, snapshot);
}

function writeFullSnapshot(snapshot: FullDataSnapshot): void {
  writeCache(FULL_CACHE_KEY, snapshot);
  writeIndexSnapshot(toIndexSnapshot(snapshot.procedures, snapshot.specialtiesData));
}

export function readCachedProcedureIndex(): ProcedureIndexSnapshot | null {
  const cachedIndex = readCache<ProcedureIndexSnapshot>(INDEX_CACHE_KEY, INDEX_TTL);
  if (cachedIndex) return cachedIndex;

  const cachedFull = readCache<FullDataSnapshot>(FULL_CACHE_KEY, FULL_TTL);
  if (!cachedFull) return null;
  return toIndexSnapshot(cachedFull.procedures, cachedFull.specialtiesData);
}

export function readCachedFullData(): FullDataSnapshot | null {
  return readCache<FullDataSnapshot>(FULL_CACHE_KEY, FULL_TTL);
}

export async function loadProcedureIndexSnapshot(): Promise<ProcedureIndexSnapshot> {
  const [procedures, specialtiesData] = await Promise.all([
    loadProcedureIndexFromSupabase(),
    loadSpecialtiesFromSupabase().catch(() => []),
  ]);

  if (procedures.length === 0) {
    throw new Error('No procedures available in Supabase');
  }

  const snapshot = { procedures, specialtiesData };
  writeIndexSnapshot(snapshot);
  return snapshot;
}

export async function loadFullDataSnapshot(): Promise<FullDataSnapshot> {
  const [dbData, specialtyRows] = await Promise.all([
    loadFromSupabase(),
    loadSpecialtiesFromSupabase().catch(() => []),
  ]);

  if (!dbData) {
    throw new Error('Supabase knowledge base is empty or unavailable');
  }

  const mergedProcedures = await hydrateProcedures(dbData.procedures);
  const enriched = enrichMedicationPlan({
    procedures: mergedProcedures,
    drugs: resolveDrugs(dbData.drugs, []),
  });

  const snapshot: FullDataSnapshot = {
    procedures: enriched.procedures,
    drugs: enriched.drugs,
    guidelines: dbData.guidelines,
    protocoles: dbData.protocoles,
    alrBlocks: dbData.alrBlocks,
    specialtiesData: specialtyRows,
  };
  writeFullSnapshot(snapshot);
  return snapshot;
}

export function scheduleIdleTask(task: () => void): () => void {
  const scope = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

  if (typeof scope.requestIdleCallback === 'function') {
    const handle = scope.requestIdleCallback(() => task(), { timeout: 1200 });
    return () => scope.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(task, 32);
  return () => window.clearTimeout(handle);
}
