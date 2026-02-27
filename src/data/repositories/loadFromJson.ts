import type { Procedure, Drug, Guideline, Protocole, ALRBlock } from '@/lib/types';
import {
  ProcedureSchema,
  DrugSchema,
  GuidelineSchema,
  ProtocoleSchema,
  ALRBlockSchema,
  validateArray,
} from '@/data/schemas/jsonSchemas';

function fetchJson(path: string) {
  return fetch(path).then((r) => {
    if (!r.ok) throw new Error(`${path}: ${r.status}`);
    return r.json();
  });
}

export async function loadProceduresFromJson() {
  const procsRaw = await fetchJson('/data/procedures.v3.json');
  return validateArray<Procedure>(procsRaw, ProcedureSchema, 'procedures');
}

export async function loadDrugsFromJson() {
  const drugsRaw = await fetchJson('/data/drugs.v1.json');
  return validateArray<Drug>(drugsRaw, DrugSchema, 'drugs');
}

export async function loadFromJson() {
  const [procedures, drugs, guidelinesRaw, protocolesRaw, alrRaw] = await Promise.all([
    loadProceduresFromJson(),
    loadDrugsFromJson(),
    fetchJson('/data/guidelines.v1.json'),
    fetchJson('/data/protocoles.v1.json'),
    fetchJson('/data/alr.v1.json'),
  ]);
  return {
    procedures,
    drugs,
    guidelines: validateArray<Guideline>(guidelinesRaw, GuidelineSchema, 'guidelines'),
    protocoles: validateArray<Protocole>(protocolesRaw, ProtocoleSchema, 'protocoles'),
    alrBlocks: validateArray<ALRBlock>(alrRaw, ALRBlockSchema, 'alrBlocks'),
  };
}
