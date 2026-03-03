import type {
  HospitalProcedureContext,
  HospitalProfile,
  HospitalProtocolOverrides,
  Procedure,
  SupportedLang,
} from './types';

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'number' && Number.isFinite(item));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === 'string');
}

function isLocalizedString(value: unknown): value is Partial<Record<SupportedLang, string>> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === 'string');
}

function isLocalizedStringArray(value: unknown): value is Partial<Record<SupportedLang, string[]>> {
  return (
    isRecord(value) &&
    Object.values(value).every((item) => Array.isArray(item) && item.every((entry) => typeof entry === 'string'))
  );
}

function getProtocolOverrides(
  profile: HospitalProfile | null | undefined,
): HospitalProtocolOverrides | null {
  const raw = profile?.protocol_overrides;
  return isRecord(raw) ? (raw as HospitalProtocolOverrides) : null;
}

function normalizeProcedureKey(procedure: Procedure): string {
  const title = procedure.titles.fr || procedure.titles.en || procedure.titles.pt || procedure.id;
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function dedupeProcedures(procedures: Procedure[]): Procedure[] {
  const seen = new Set<string>();
  return procedures.filter((procedure) => {
    const key = `${procedure.specialty}::${normalizeProcedureKey(procedure)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getHospitalProcedureIds(profile: HospitalProfile | null | undefined): Set<string> | null {
  const ids = getProtocolOverrides(profile)?.procedure_ids;
  if (!isStringArray(ids) || ids.length === 0) return null;

  return new Set(ids.filter(Boolean));
}

export function getHospitalProcedureAliases(
  profile: HospitalProfile | null | undefined,
): Record<string, string> {
  const aliases = getProtocolOverrides(profile)?.procedure_aliases;
  return isStringRecord(aliases) ? aliases : {};
}

export function resolveHospitalProcedureId(
  procedureId: string,
  profile: HospitalProfile | null | undefined,
  isHospitalView: boolean,
): string {
  if (!isHospitalView || !procedureId) return procedureId;
  const aliases = getHospitalProcedureAliases(profile);
  return aliases[procedureId] || procedureId;
}

function parseHospitalProcedureContext(value: unknown): HospitalProcedureContext | null {
  if (!isRecord(value)) return null;

  const context: HospitalProcedureContext = {};

  if (isLocalizedString(value.title)) {
    context.title = value.title;
  }
  if (isLocalizedStringArray(value.summary)) {
    context.summary = value.summary;
  }
  if (isNumberArray(value.source_pages)) {
    context.source_pages = value.source_pages;
  }
  if (isStringArray(value.linked_procedure_ids)) {
    context.linked_procedure_ids = value.linked_procedure_ids;
  }

  return Object.keys(context).length > 0 ? context : null;
}

export function getHospitalProcedureContext(
  profile: HospitalProfile | null | undefined,
  procedureId: string,
  resolvedProcedureId = procedureId,
): HospitalProcedureContext | null {
  const contexts = getProtocolOverrides(profile)?.procedure_contexts;
  if (!isRecord(contexts)) return null;

  const context =
    parseHospitalProcedureContext(contexts[resolvedProcedureId]) ||
    (resolvedProcedureId !== procedureId ? parseHospitalProcedureContext(contexts[procedureId]) : null);

  return context;
}

export function filterProceduresForHospitalMode(
  procedures: Procedure[],
  profile: HospitalProfile | null | undefined,
  isHospitalView: boolean,
): Procedure[] {
  const scopedIds = getHospitalProcedureIds(profile);
  const source =
    isHospitalView && scopedIds
      ? procedures.filter((procedure) => scopedIds.has(procedure.id))
      : procedures;
  return dedupeProcedures(source);
}
