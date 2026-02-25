import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

export type {
  DrugRef, Reference, ProcedureQuick, ProcedureDeep, Procedure,
  DoseRule, Concentration, Drug, Guideline, Protocole, ALRBlock,
} from '@/lib/types';

import type { Procedure, Drug, Guideline, Protocole, ALRBlock } from '@/lib/types';

// Lightweight zod schemas for validation
const ProcedureSchema = z.object({ id: z.string(), specialty: z.string(), titles: z.object({ fr: z.string() }).passthrough(), quick: z.object({ fr: z.any() }).passthrough() }).passthrough();
const DrugSchema = z.object({ id: z.string(), name: z.object({ fr: z.string() }).passthrough() }).passthrough();
const GuidelineSchema = z.object({ id: z.string(), category: z.string(), titles: z.object({ fr: z.string() }).passthrough(), items: z.object({ fr: z.array(z.string()) }).passthrough() }).passthrough();
const ProtocoleSchema = z.object({ id: z.string(), category: z.string(), titles: z.object({ fr: z.string() }).passthrough(), steps: z.object({ fr: z.array(z.string()) }).passthrough() }).passthrough();
const ALRBlockSchema = z.object({ id: z.string(), region: z.string(), titles: z.object({ fr: z.string() }).passthrough() }).passthrough();

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

function validateArray<T>(data: unknown, schema: z.ZodType, label: string): T[] {
  if (!Array.isArray(data)) { console.warn(`[AnesIA] ${label}: expected array, got ${typeof data}`); return []; }
  const valid: T[] = [];
  data.forEach((item, i) => {
    const result = schema.safeParse(item);
    if (result.success) valid.push(item as T);
    else console.warn(`[AnesIA] ${label}[${i}] invalid, skipping:`, result.error.issues);
  });
  return valid;
}

function fetchJson(path: string) {
  return fetch(path).then((r) => { if (!r.ok) throw new Error(`${path}: ${r.status}`); return r.json(); });
}

// Transform DB row to Procedure shape
function dbRowToProcedure(row: any): Procedure {
  return {
    id: row.id,
    specialty: row.specialty,
    titles: row.titles,
    synonyms: row.synonyms || {},
    quick: row.content?.quick || {},
    deep: row.content?.deep || {},
  };
}

function dbRowToDrug(row: any): Drug {
  return {
    id: row.id,
    name: row.names,
    dose_rules: row.dosing?.dose_rules || [],
    concentrations: row.dosing?.concentrations || [],
    contraindications_notes: row.contraindications || [],
    renal_hepatic_notes: row.notes?.renal_hepatic_notes || [],
  };
}

function dbRowToGuideline(row: any): Guideline {
  return { id: row.id, category: row.category, titles: row.titles, items: row.items, references: row.refs || [] };
}

function dbRowToProtocole(row: any): Protocole {
  return { id: row.id, category: row.category, titles: row.titles, steps: row.steps, references: row.refs || [] };
}

function dbRowToALRBlock(row: any): ALRBlock {
  return { id: row.id, region: row.region, titles: row.titles, indications: row.indications || {}, contraindications: row.contraindications || {}, technique: row.technique || {}, drugs: row.drugs || {} };
}

async function loadFromSupabase(): Promise<{
  procedures: Procedure[]; drugs: Drug[]; guidelines: Guideline[]; protocoles: Protocole[]; alrBlocks: ALRBlock[];
} | null> {
  try {
    const [procRes, drugRes, guideRes, protoRes, alrRes] = await Promise.all([
      supabase.from('procedures' as any).select('*'),
      supabase.from('drugs' as any).select('*'),
      supabase.from('guidelines' as any).select('*'),
      supabase.from('protocoles' as any).select('*'),
      supabase.from('alr_blocks' as any).select('*'),
    ]);

    const procData = (procRes.data as any[]) || [];
    const drugData = (drugRes.data as any[]) || [];
    const guideData = (guideRes.data as any[]) || [];
    const protoData = (protoRes.data as any[]) || [];
    const alrData = (alrRes.data as any[]) || [];

    if (procData.length === 0) return null;

    // Load JSON as fallback for missing drug data
    let jsonProcedures: Procedure[] = [];
    try {
      const jsonRaw = await fetchJson('/data/procedures.v3.json');
      jsonProcedures = validateArray<Procedure>(jsonRaw, ProcedureSchema, 'procedures-fallback');
    } catch { /* ignore JSON fallback errors */ }

    const dbProcedures = procData.map(dbRowToProcedure);

    // Merge: fill missing quick.{lang}.drugs from JSON fallback
    const jsonMap = new Map(jsonProcedures.map(p => [p.id, p]));
    for (const proc of dbProcedures) {
      const jsonProc = jsonMap.get(proc.id);
      if (!jsonProc) continue;
      for (const langKey of ['fr', 'en', 'pt'] as const) {
        const qLang = (proc.quick as any)?.[langKey];
        const jLang = (jsonProc.quick as any)?.[langKey];
        if (qLang && (!qLang.drugs || qLang.drugs.length === 0) && jLang?.drugs?.length > 0) {
          qLang.drugs = jLang.drugs;
        }
      }
    }

    return {
      procedures: dbProcedures,
      drugs: drugData.map(dbRowToDrug),
      guidelines: guideData.map(dbRowToGuideline),
      protocoles: protoData.map(dbRowToProtocole),
      alrBlocks: alrData.map(dbRowToALRBlock),
    };
  } catch (err) {
    console.warn('[AnesIA] Supabase load failed, falling back to JSON:', err);
    return null;
  }
}

async function loadFromJson() {
  const [procsRaw, drugsRaw, guidelinesRaw, protocolesRaw, alrRaw] = await Promise.all([
    fetchJson('/data/procedures.v3.json'),
    fetchJson('/data/drugs.v1.json'),
    fetchJson('/data/guidelines.v1.json'),
    fetchJson('/data/protocoles.v1.json'),
    fetchJson('/data/alr.v1.json'),
  ]);
  return {
    procedures: validateArray<Procedure>(procsRaw, ProcedureSchema, 'procedures'),
    drugs: validateArray<Drug>(drugsRaw, DrugSchema, 'drugs'),
    guidelines: validateArray<Guideline>(guidelinesRaw, GuidelineSchema, 'guidelines'),
    protocoles: validateArray<Protocole>(protocolesRaw, ProtocoleSchema, 'protocoles'),
    alrBlocks: validateArray<ALRBlock>(alrRaw, ALRBlockSchema, 'alrBlocks'),
  };
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
        // Try Supabase first
        const dbData = await loadFromSupabase();
        if (cancelled) return;

        if (dbData) {
          console.log('[AnesIA] Data loaded from database');
          setProcedures(dbData.procedures);
          setDrugs(dbData.drugs);
          setGuidelines(dbData.guidelines);
          setProtocoles(dbData.protocoles);
          setAlrBlocks(dbData.alrBlocks);
        } else {
          // Fallback to JSON
          console.log('[AnesIA] Falling back to JSON files');
          const jsonData = await loadFromJson();
          if (cancelled) return;
          setProcedures(jsonData.procedures);
          setDrugs(jsonData.drugs);
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

  if (error && !loading) return <DataErrorFallback error={error} />;

  return (
    <DataContext.Provider value={{ procedures, drugs, guidelines, protocoles, alrBlocks, loading, error, getDrug, getProcedure, specialties }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
