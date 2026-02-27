import React, {
  createContext,
  useContext,
  useEffect,
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
import { loadFromJson } from '@/data/repositories/loadFromJson';
import { enrichMedicationPlan } from '@/data/merge/enrichMedicationPlan';
import { hydrateProcedures } from '@/data/repositories/proceduresRepo';
import { resolveDrugs } from '@/data/repositories/drugsRepo';
import { loadSpecialtiesFromSupabase, type SpecialtyRecord } from '@/data/repositories/specialtiesRepo';

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
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [protocoles, setProtocoles] = useState<Protocole[]>([]);
  const [alrBlocks, setAlrBlocks] = useState<ALRBlock[]>([]);
  const [specialtiesData, setSpecialtiesData] = useState<SpecialtyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [dbData, jsonData, specialtyRows] = await Promise.all([
          loadFromSupabase(),
          loadFromJson(),
          loadSpecialtiesFromSupabase().catch(() => []),
        ]);
        if (cancelled) return;
        setSpecialtiesData(specialtyRows);

        if (dbData) {
          console.log('[AnesIA] Data loaded from database');
          const mergedProcs = await hydrateProcedures(dbData.procedures, jsonData.procedures);
          if (cancelled) return;
          const activeDrugs = resolveDrugs(dbData.drugs, jsonData.drugs);
          const enriched = enrichMedicationPlan({ procedures: mergedProcs, drugs: activeDrugs });
          setProcedures(enriched.procedures);
          setDrugs(enriched.drugs);
          setGuidelines(dbData.guidelines);
          setProtocoles(dbData.protocoles);
          setAlrBlocks(dbData.alrBlocks);
        } else {
          console.log('[AnesIA] Falling back to JSON files');
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
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        if (!cancelled) {
          setError('data_load_error');
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
