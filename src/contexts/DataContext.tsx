import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  startTransition,
  ReactNode,
} from 'react';

export type {
  DrugRef, Reference, ProcedureQuick, ProcedureDeep, Procedure,
  DoseRule, Concentration, Drug, Guideline, Protocole, ALRBlock,
} from '@/lib/types';

import type { Procedure, Drug, Guideline, Protocole, ALRBlock } from '@/lib/types';
import type { SpecialtyRecord } from '@/data/repositories/specialtiesRepo';
import {
  loadFullDataSnapshot,
  loadProcedureIndexSnapshot,
  projectProcedureIndex,
  readCachedFullData,
  readCachedProcedureIndex,
  scheduleIdleTask,
} from '@/data/services/bootstrapData';

interface DataContextType {
  procedureIndex: Procedure[];
  procedures: Procedure[];
  drugs: Drug[];
  guidelines: Guideline[];
  protocoles: Protocole[];
  alrBlocks: ALRBlock[];
  indexLoading: boolean;
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
  const cachedIndexRef = useRef(readCachedProcedureIndex());
  const cachedFullRef = useRef(readCachedFullData());
  const cachedIndex = cachedIndexRef.current;
  const cachedFull = cachedFullRef.current;

  const [procedureIndex, setProcedureIndex] = useState<Procedure[]>(
    cachedIndex?.procedures ?? (cachedFull ? projectProcedureIndex(cachedFull.procedures) : [])
  );
  const [procedures, setProcedures] = useState<Procedure[]>(cachedFull?.procedures ?? []);
  const [drugs, setDrugs] = useState<Drug[]>(cachedFull?.drugs ?? []);
  const [guidelines, setGuidelines] = useState<Guideline[]>(cachedFull?.guidelines ?? []);
  const [protocoles, setProtocoles] = useState<Protocole[]>(cachedFull?.protocoles ?? []);
  const [alrBlocks, setAlrBlocks] = useState<ALRBlock[]>(cachedFull?.alrBlocks ?? []);
  const [specialtiesData, setSpecialtiesData] = useState<SpecialtyRecord[]>(
    cachedIndex?.specialtiesData ?? cachedFull?.specialtiesData ?? []
  );
  const [indexLoading, setIndexLoading] = useState(!cachedIndex && !cachedFull);
  const [loading, setLoading] = useState(!cachedFull);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let cancelIdle = () => {};

    const loadIndex = async () => {
      try {
        const snapshot = await loadProcedureIndexSnapshot();
        if (cancelled) return;
        startTransition(() => {
          setProcedureIndex(snapshot.procedures);
          setSpecialtiesData((current) =>
            snapshot.specialtiesData.length > 0 ? snapshot.specialtiesData : current
          );
          setIndexLoading(false);
        });
      } catch (err) {
        console.error('Failed to load procedure index:', err);
        if (!cancelled) {
          setIndexLoading(false);
        }
      }
    };

    const loadFull = async () => {
      try {
        const snapshot = await loadFullDataSnapshot();
        if (cancelled) return;
        startTransition(() => {
          setProcedureIndex(projectProcedureIndex(snapshot.procedures));
          setProcedures(snapshot.procedures);
          setDrugs(snapshot.drugs);
          setGuidelines(snapshot.guidelines);
          setProtocoles(snapshot.protocoles);
          setAlrBlocks(snapshot.alrBlocks);
          setSpecialtiesData(snapshot.specialtiesData);
          setLoading(false);
          setIndexLoading(false);
        });
      } catch (err) {
        console.error('Failed to load full data:', err);
        if (!cancelled) {
          if (!cachedFull && !cachedIndex) setError('data_load_error');
          setLoading(false);
          setIndexLoading(false);
        }
      }
    };

    void loadIndex();
    cancelIdle = scheduleIdleTask(() => {
      void loadFull();
    });

    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, []);

  const getDrug = useCallback((id: string) => drugs.find((d) => d.id === id), [drugs]);
  const getProcedure = useCallback((id: string) => procedures.find((p) => p.id === id), [procedures]);
  const specialties = React.useMemo(() => {
    const source = procedureIndex.length > 0 ? procedureIndex : procedures;
    const set = new Set(source.map((p) => p.specialty).filter(Boolean));
    return Array.from(set).sort();
  }, [procedureIndex, procedures]);

  return (
    <DataContext.Provider value={{ procedureIndex, procedures, drugs, guidelines, protocoles, alrBlocks, indexLoading, loading, error, getDrug, getProcedure, specialties, specialtiesData }}>
      {error && !loading ? <DataErrorFallback error={error} /> : children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
