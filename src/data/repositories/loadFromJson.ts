import { z } from 'zod';
import type { Procedure, Drug, Guideline, Protocole, ALRBlock } from '@/lib/types';

const ProcedureSchema = z.object({ id: z.string(), specialty: z.string(), titles: z.object({ fr: z.string() }).passthrough(), quick: z.object({ fr: z.any() }).passthrough() }).passthrough();
const DrugSchema = z.object({ id: z.string(), name: z.object({ fr: z.string() }).passthrough() }).passthrough();
const GuidelineSchema = z.object({ id: z.string(), category: z.string(), titles: z.object({ fr: z.string() }).passthrough(), items: z.object({ fr: z.array(z.string()) }).passthrough() }).passthrough();
const ProtocoleSchema = z.object({ id: z.string(), category: z.string(), titles: z.object({ fr: z.string() }).passthrough(), steps: z.object({ fr: z.array(z.string()) }).passthrough() }).passthrough();
const ALRBlockSchema = z.object({ id: z.string(), region: z.string(), titles: z.object({ fr: z.string() }).passthrough() }).passthrough();

export function validateArray<T>(data: unknown, schema: z.ZodType, label: string): T[] {
  if (!Array.isArray(data)) {
    console.warn(`[AnesIA] ${label}: expected array, got ${typeof data}`);
    return [];
  }
  const valid: T[] = [];
  data.forEach((item, i) => {
    const result = schema.safeParse(item);
    if (result.success) valid.push(item as T);
    else console.warn(`[AnesIA] ${label}[${i}] invalid, skipping:`, result.error.issues);
  });
  return valid;
}

function fetchJson(path: string) {
  return fetch(path).then((r) => {
    if (!r.ok) throw new Error(`${path}: ${r.status}`);
    return r.json();
  });
}

export async function loadFromJson() {
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
