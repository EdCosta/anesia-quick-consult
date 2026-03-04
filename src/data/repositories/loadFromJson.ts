import type { Procedure, Drug, Guideline, Protocole, ALRBlock } from '@/lib/types';
import {
  ProcedureSchema,
  DrugSchema,
  GuidelineSchema,
  ProtocoleSchema,
  ALRBlockSchema,
  validateArray,
} from '@/data/schemas/jsonSchemas';

function resolveAssetPath(path: string) {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${path.replace(/^\/+/, '')}`;
}

function fetchJson(path: string) {
  const resolvedPath = resolveAssetPath(path);
  return fetch(resolvedPath).then((r) => {
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

export async function loadGuidelinesFromJson() {
  const guidelinesRaw = await fetchJson('/data/guidelines.v1.json');
  return validateArray<Guideline>(guidelinesRaw, GuidelineSchema, 'guidelines');
}

export async function loadProtocolesFromJson() {
  const protocolesRaw = await fetchJson('/data/protocoles.v1.json');
  return validateArray<Protocole>(protocolesRaw, ProtocoleSchema, 'protocoles');
}

export async function loadALRBlocksFromJson() {
  const alrRaw = await fetchJson('/data/alr.v1.json');
  return validateArray<ALRBlock>(alrRaw, ALRBlockSchema, 'alrBlocks');
}

export async function loadFromJson() {
  const [procedures, drugs, guidelines, protocoles, alrBlocks] = await Promise.all([
    loadProceduresFromJson(),
    loadDrugsFromJson(),
    loadGuidelinesFromJson(),
    loadProtocolesFromJson(),
    loadALRBlocksFromJson(),
  ]);
  return {
    procedures,
    drugs,
    guidelines,
    protocoles,
    alrBlocks,
  };
}
