import type { HospitalProfile, Procedure } from './types';

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
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
  const raw = profile?.protocol_overrides;
  if (!raw || typeof raw !== 'object') return null;

  const ids = (raw as Record<string, unknown>).procedure_ids;
  if (!isStringArray(ids) || ids.length === 0) return null;

  return new Set(ids.filter(Boolean));
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
