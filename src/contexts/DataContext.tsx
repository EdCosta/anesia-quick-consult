import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { z } from 'zod';

// Re-export all types from lib/types for backward compatibility
export type {
  DrugRef,
  Reference,
  ProcedureQuick,
  ProcedureDeep,
  Procedure,
  DoseRule,
  Concentration,
  Drug,
} from '@/lib/types';

import type { Procedure, Drug } from '@/lib/types';

// Lightweight zod schemas for validation
const ProcedureSchema = z
  .object({
    id: z.string(),
    specialty: z.string(),
    titles: z.object({ fr: z.string() }).passthrough(),
    quick: z.object({ fr: z.any() }).passthrough(),
  })
  .passthrough();

const DrugSchema = z
  .object({
    id: z.string(),
    name: z.object({ fr: z.string() }).passthrough(),
  })
  .passthrough();

interface DataContextType {
  procedures: Procedure[];
  drugs: Drug[];
  loading: boolean;
  error: string | null;
  getDrug: (id: string) => Drug | undefined;
  getProcedure: (id: string) => Procedure | undefined;
  specialties: string[];
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

function validateArray<T>(
  data: unknown,
  schema: z.ZodType,
  label: string
): T[] {
  if (!Array.isArray(data)) {
    console.warn(`[AnesIA] ${label}: expected array, got ${typeof data}`);
    return [];
  }

  const valid: T[] = [];
  data.forEach((item, i) => {
    const result = schema.safeParse(item);
    if (result.success) {
      valid.push(item as T);
    } else {
      console.warn(
        `[AnesIA] ${label}[${i}] invalid, skipping:`,
        result.error.issues
      );
    }
  });
  return valid;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch('/data/procedures.v3.json').then((r) => {
        if (!r.ok) throw new Error(`procedures: ${r.status}`);
        return r.json();
      }),
      fetch('/data/drugs.v1.json').then((r) => {
        if (!r.ok) throw new Error(`drugs: ${r.status}`);
        return r.json();
      }),
    ])
      .then(([procsRaw, drugsRaw]) => {
        if (cancelled) return;

        const validProcs = validateArray<Procedure>(
          procsRaw,
          ProcedureSchema,
          'procedures'
        );
        const validDrugs = validateArray<Drug>(drugsRaw, DrugSchema, 'drugs');

        setProcedures(validProcs);
        setDrugs(validDrugs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load data:', err);
        if (!cancelled) {
          setError('data_load_error');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const getDrug = useCallback(
    (id: string) => drugs.find((d) => d.id === id),
    [drugs]
  );

  const getProcedure = useCallback(
    (id: string) => procedures.find((p) => p.id === id),
    [procedures]
  );

  const specialties = React.useMemo(() => {
    const set = new Set(procedures.map((p) => p.specialty));
    return Array.from(set).sort();
  }, [procedures]);

  if (error && !loading) {
    return <DataErrorFallback error={error} />;
  }

  return (
    <DataContext.Provider
      value={{
        procedures,
        drugs,
        loading,
        error,
        getDrug,
        getProcedure,
        specialties,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
