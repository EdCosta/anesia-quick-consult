import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';

export type {
  DrugRef, Reference, ProcedureQuick, ProcedureDeep, Procedure,
  DoseRule, Concentration, Drug, Guideline, Protocole, ALRBlock,
} from '@/lib/types';

import type { Procedure, Drug, Guideline, Protocole, ALRBlock } from '@/lib/types';
import { loadFromSupabase } from '@/data/repositories/loadFromSupabase';
import { loadFromJson, loadProceduresFromJson, loadDrugsFromJson } from '@/data/repositories/loadFromJson';
import { enrichMedicationPlan } from '@/data/merge/enrichMedicationPlan';
import { hydrateProcedures } from '@/data/repositories/proceduresRepo';
import { resolveDrugs } from '@/data/repositories/drugsRepo';
import { loadSpecialtiesFromSupabase, type SpecialtyRecord } from '@/data/repositories/specialtiesRepo';

// ---------------------------------------------------------------------------
// localStorage cache — stale-while-revalidate
// ---------------------------------------------------------------------------
const CACHE_KEY = 'anesia-data-v1';
const CACHE_TTL = 30 * 60 * 1000; // 30 min

interface CachedData {
  procedures: Procedure[];
  drugs: Drug[];
  guidelines: Guideline[];
  protocoles: Protocole[];
  alrBlocks: ALRBlock[];
  specialtiesData: SpecialtyRecord[];
}

function readCache(): CachedData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; data: CachedData };
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data: CachedData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // quota exceeded — silently ignore
  }
}

// ---------------------------------------------------------------------------

interface DataContextType {
  procedures: Procedure[];
  drugs: Drug[];
  guidelines: Guideline[];
  protocoles: Protocole[];
  alrBlocks: ALRBlock[];
  loading: boolean;
  error: string | null;
  getDrug: (id: string) => Drug | undefined;
  getProcedure: (id: string) => Procedure | undefined;
  specialties: string[];
  specialtiesData: SpecialtyRecord[];
}

const DataContext = createContext<DataContextType | null>(null);

function DataErrorFallback({ error }: { error: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-4">
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center max-w-md">
        <p className="text-sm font-semibold text-destructive mb-2">⚠️</p>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    </div>
  );
}

export function DataProvider({ children }: { children: ReactNode }) {
  // Read cache once synchronously before first render
  const cachedRef = useRef(readCache());
  const cached = cachedRef.current;

  const [procedures, setProcedures] = useState<Procedure[]>(cached?.procedures ?? []);
  const [drugs, setDrugs] = useState<Drug[]>(cached?.drugs ?? []);
  const [guidelines, setGuidelines] = useState<Guideline[]>(cached?.guidelines ?? []);
  const [protocoles, setProtocoles] = useState<Protocole[]>(cached?.protocoles ?? []);
  const [alrBlocks, setAlrBlocks] = useState<ALRBlock[]>(cached?.alrBlocks ?? []);
  const [specialtiesData, setSpecialtiesData] = useState<SpecialtyRecord[]>(cached?.specialtiesData ?? []);
  // If we have cached data, show content immediately (no loading spinner)
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [dbData, specialtyRows, fallbackProcedures] = await Promise.all([
          loadFromSupabase(),
          loadSpecialtiesFromSupabase().catch(() => []),
          loadProceduresFromJson().catch(() => []),
        ]);
        if (cancelled) return;
        setSpecialtiesData(specialtyRows);

        if (dbData) {
          console.log('[AnesIA] Data loaded from database');
          const fallbackDrugs = dbData.drugs.length === 0
            ? await loadDrugsFromJson().catch(() => [])
            : [];
          if (cancelled) return;
          const mergedProcs = await hydrateProcedures(
            dbData.procedures,
            fallbackProcedures.length > 0 ? fallbackProcedures : undefined,
          );
          if (cancelled) return;
          const activeDrugs = resolveDrugs(dbData.drugs, fallbackDrugs);
          const enriched = enrichMedicationPlan({ procedures: mergedProcs, drugs: activeDrugs });
          setProcedures(enriched.procedures);
          setDrugs(enriched.drugs);
          setGuidelines(dbData.guidelines);
          setProtocoles(dbData.protocoles);
          setAlrBlocks(dbData.alrBlocks);
          writeCache({
            procedures: enriched.procedures,
            drugs: enriched.drugs,
            guidelines: dbData.guidelines,
            protocoles: dbData.protocoles,
            alrBlocks: dbData.alrBlocks,
            specialtiesData: specialtyRows,
          });
        } else {
          console.log('[AnesIA] Falling back to JSON files');
          const jsonData = await loadFromJson();
          const mergedProcs = await hydrateProcedures(jsonData.procedures, jsonData.procedures);
          if (cancelled) return;
          const enriched = enrichMedicationPlan({
            procedures: mergedProcs,
            drugs: resolveDrugs([], jsonData.drugs),
          });
          setProcedures(enriched.procedures);
          setDrugs(enriched.drugs);
          setGuidelines(jsonData.guidelines);
          setProtocoles(jsonData.protocoles);
          setAlrBlocks(jsonData.alrBlocks);
          writeCache({
            procedures: enriched.procedures,
            drugs: enriched.drugs,
            guidelines: jsonData.guidelines,
            protocoles: jsonData.protocoles,
            alrBlocks: jsonData.alrBlocks,
            specialtiesData: specialtyRows,
          });
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        if (!cancelled) {
          // Only show error if we have no cached data to fall back on
          if (!cached) setError('data_load_error');
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const getDrug = useCallback((id: string) => drugs.find((d) => d.id === id), [drugs]);
  const getProcedure = useCallback((id: string) => procedures.find((p) => p.id === id), [procedures]);
  const specialties = React.useMemo(() => {
    const set = new Set(procedures.map((p) => p.specialty).filter(Boolean));
    return Array.from(set).sort();
  }, [procedures]);

  return (
    <DataContext.Provider value={{ procedures, drugs, guidelines, protocoles, alrBlocks, loading, error, getDrug, getProcedure, specialties, specialtiesData }}>
      {error && !loading ? <DataErrorFallback error={error} /> : children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
