import { createContext, useContext, ReactNode } from 'react';
import { useDataLoader } from '@/data/hooks/useDataLoader';
import type { DataState } from '@/data/hooks/useDataLoader';
import { DataErrorFallback } from '@/components/DataErrorFallback';

export type {
  DrugRef,
  Reference,
  ProcedureQuick,
  ProcedureDeep,
  Procedure,
  DoseRule,
  Concentration,
  Drug,
  Guideline,
  Protocole,
  ALRBlock,
} from '@/lib/types';

export type DataContextType = DataState;

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const value = useDataLoader();
  return (
    <DataContext.Provider value={value}>
      {value.error && !value.loading ? <DataErrorFallback error={value.error} /> : children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
