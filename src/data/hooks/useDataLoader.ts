import { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
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

export interface DataState {
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

export function useDataLoader(): DataState {
  const cachedIndexRef = useRef(readCachedProcedureIndex());
  const cachedFullRef = useRef(readCachedFullData());
  const cachedIndex = cachedIndexRef.current;
  const cachedFull = cachedFullRef.current;

  const [procedureIndex, setProcedureIndex] = useState<Procedure[]>(
    cachedIndex?.procedures ?? (cachedFull ? projectProcedureIndex(cachedFull.procedures) : []),
  );
  const [procedures, setProcedures] = useState<Procedure[]>(cachedFull?.procedures ?? []);
  const [drugs, setDrugs] = useState<Drug[]>(cachedFull?.drugs ?? []);
  const [guidelines, setGuidelines] = useState<Guideline[]>(cachedFull?.guidelines ?? []);
  const [protocoles, setProtocoles] = useState<Protocole[]>(cachedFull?.protocoles ?? []);
  const [alrBlocks, setAlrBlocks] = useState<ALRBlock[]>(cachedFull?.alrBlocks ?? []);
  const [specialtiesData, setSpecialtiesData] = useState<SpecialtyRecord[]>(
    cachedIndex?.specialtiesData ?? cachedFull?.specialtiesData ?? [],
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
            snapshot.specialtiesData.length > 0 ? snapshot.specialtiesData : current,
          );
          setIndexLoading(false);
        });
      } catch (err) {
        console.error('Failed to load procedure index:', err);
        if (!cancelled) setIndexLoading(false);
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
  const getProcedure = useCallback(
    (id: string) => procedures.find((p) => p.id === id),
    [procedures],
  );
  const specialties = useMemo(() => {
    const source = procedureIndex.length > 0 ? procedureIndex : procedures;
    const set = new Set(source.map((p) => p.specialty).filter(Boolean));
    return Array.from(set).sort();
  }, [procedureIndex, procedures]);

  return {
    procedureIndex,
    procedures,
    drugs,
    guidelines,
    protocoles,
    alrBlocks,
    indexLoading,
    loading,
    error,
    getDrug,
    getProcedure,
    specialties,
    specialtiesData,
  };
}
