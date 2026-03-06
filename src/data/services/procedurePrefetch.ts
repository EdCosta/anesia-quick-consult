import type { Procedure } from '@/lib/types';
import { loadProcedureByIdFromSupabase } from '@/data/repositories/proceduresRepo';

const STORAGE_PREFIX = 'anesia-prefetch-procedure:';

const procedureCache = new Map<string, Procedure>();
const pendingCache = new Map<string, Promise<Procedure | null>>();

function isBrowser() {
  return typeof window !== 'undefined';
}

function readFromStorage(id: string): Procedure | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as Procedure;
  } catch {
    return null;
  }
}

function writeToStorage(procedure: Procedure) {
  if (!isBrowser()) return;

  try {
    window.sessionStorage.setItem(
      `${STORAGE_PREFIX}${procedure.id}`,
      JSON.stringify(procedure),
    );
  } catch {
    // Ignore storage failures.
  }
}

export function readPrefetchedProcedure(id: string): Procedure | null {
  const cached = procedureCache.get(id);
  if (cached) return cached;

  const stored = readFromStorage(id);
  if (stored) {
    procedureCache.set(id, stored);
    return stored;
  }

  return null;
}

export async function prefetchProcedureById(id: string): Promise<Procedure | null> {
  if (!id) return null;

  const cached = readPrefetchedProcedure(id);
  if (cached) return cached;

  const pending = pendingCache.get(id);
  if (pending) return pending;

  const next = loadProcedureByIdFromSupabase(id)
    .then((procedure) => {
      if (procedure) {
        procedureCache.set(id, procedure);
        writeToStorage(procedure);
      }
      return procedure;
    })
    .finally(() => {
      pendingCache.delete(id);
    });

  pendingCache.set(id, next);
  return next;
}
