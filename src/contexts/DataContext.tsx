import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';

export type {
  DrugRef, Reference, ProcedureQuick, ProcedureDeep, Procedure,
  DoseRule, Concentration, Drug, Guideline, Protocole, ALRBlock,
} from '@/lib/types';

import type { Procedure, Drug, Guideline, Protocole, ALRBlock } from '@/lib/types';
import { loadFromSupabase } from '@/data/repositories/loadFromSupabase';
import { loadFromJson } from '@/data/repositories/loadFromJson';
import { mergeProcedureFallback } from '@/data/merge/mergeProcedureFallback';
import { enrichMedicationPlan } from '@/data/merge/enrichMedicationPlan';

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
  specialtiesData: Array<{ id: string; name: Record<string, string>; sort_base: number }>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const dbData = await loadFromSupabase();
        if (cancelled) return;

        if (dbData) {
          console.log('[AnesIA] Data loaded from database');
          const mergedProcs = await mergeProcedureFallback(dbData.procedures);
          let activeDrugs = dbData.drugs;
          if (cancelled) return;
          // Fall back to JSON drugs if DB drugs table is not yet seeded
          if (dbData.drugs.length === 0) {
            console.log('[AnesIA] DB drugs empty — using JSON drugs fallback');
            const jsonData = await loadFromJson();
            if (cancelled) return;
            activeDrugs = jsonData.drugs;
          }
          const enriched = enrichMedicationPlan({ procedures: mergedProcs, drugs: activeDrugs });
          setProcedures(enriched.procedures);
          setDrugs(enriched.drugs);
          setGuidelines(dbData.guidelines);
          setProtocoles(dbData.protocoles);
          setAlrBlocks(dbData.alrBlocks);
        } else {
          console.log('[AnesIA] Falling back to JSON files');
          const jsonData = await loadFromJson();
          if (cancelled) return;
          const enriched = enrichMedicationPlan({ procedures: jsonData.procedures, drugs: jsonData.drugs });
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
    const set = new Set(procedures.map((p) => p.specialty));
    return Array.from(set).sort();
  }, [procedures]);

  const [specialtiesData, setSpecialtiesData] = useState<Array<{ id: string; name: Record<string, string>; sort_base: number }>>([]);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('specialties' as any).select('*').eq('is_active', true).order('sort_base');
        if (data && (data as any[]).length > 0) {
          setSpecialtiesData((data as any[]).map((r: any) => ({ id: r.id, name: r.name || {}, sort_base: r.sort_base || 0 })));
        }
      } catch { /* fallback: specialtiesData stays empty */ }
    })();
  }, []);

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
