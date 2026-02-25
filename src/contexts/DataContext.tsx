import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export interface DrugRef {
  drug_id: string;
  indication_tag: string;
}

export interface Reference {
  source: string;
  year?: number;
  note?: string;
}

export interface ProcedureQuick {
  preop: string[];
  intraop: string[];
  postop: string[];
  red_flags: string[];
  drugs: DrugRef[];
}

export interface ProcedureDeep {
  clinical: string[];
  pitfalls: string[];
  references: Reference[];
}

export interface Procedure {
  id: string;
  specialty: string;
  titles: { fr: string; pt?: string; en?: string };
  synonyms: { fr?: string[]; pt?: string[]; en?: string[] };
  quick: { fr: ProcedureQuick; pt?: ProcedureQuick; en?: ProcedureQuick };
  deep: { fr: ProcedureDeep; pt?: ProcedureDeep; en?: ProcedureDeep };
}

export interface DoseRule {
  indication_tag: string;
  route: string;
  mg_per_kg: number | null;
  max_mg: number | null;
  notes: string[];
  unit_override?: string;
}

export interface Concentration {
  label: string;
  mg_per_ml: number | null;
}

export interface Drug {
  id: string;
  name: { fr: string; pt?: string; en?: string };
  dose_rules: DoseRule[];
  concentrations: Concentration[];
  contraindications_notes: string[];
  renal_hepatic_notes: string[];
}

interface DataContextType {
  procedures: Procedure[];
  drugs: Drug[];
  loading: boolean;
  getDrug: (id: string) => Drug | undefined;
  getProcedure: (id: string) => Procedure | undefined;
  specialties: string[];
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/data/procedures.v3.json').then(r => r.json()),
      fetch('/data/drugs.v1.json').then(r => r.json()),
    ]).then(([procs, drgs]) => {
      if (!cancelled) {
        setProcedures(procs);
        setDrugs(drgs);
        setLoading(false);
      }
    }).catch(err => {
      console.error('Failed to load data:', err);
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const getDrug = useCallback((id: string) => drugs.find(d => d.id === id), [drugs]);
  const getProcedure = useCallback((id: string) => procedures.find(p => p.id === id), [procedures]);

  const specialties = React.useMemo(() => {
    const set = new Set(procedures.map(p => p.specialty));
    return Array.from(set).sort();
  }, [procedures]);

  return (
    <DataContext.Provider value={{ procedures, drugs, loading, getDrug, getProcedure, specialties }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
