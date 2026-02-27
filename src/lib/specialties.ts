import type { SupportedLang } from '@/i18n';

type SpecialtyNameMap = Partial<Record<SupportedLang, string>>;

export interface SpecialtyLike {
  id: string;
  name?: SpecialtyNameMap;
}

function normalizeSpecialtyToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function findSpecialtyRecord(
  specialty: string | undefined,
  specialties: SpecialtyLike[],
): SpecialtyLike | undefined {
  if (!specialty) return undefined;

  const target = normalizeSpecialtyToken(specialty);

  return specialties.find((record) =>
    [record.id, record.name?.fr, record.name?.pt, record.name?.en]
      .filter(Boolean)
      .some((candidate) => normalizeSpecialtyToken(candidate as string) === target),
  );
}

export function getSpecialtyDisplayName(
  specialty: string | undefined,
  specialties: SpecialtyLike[],
  lang: SupportedLang,
): string {
  if (!specialty) return '';

  const record = findSpecialtyRecord(specialty, specialties);
  if (!record?.name) return specialty;

  return record.name[lang] || record.name.fr || record.name.en || record.name.pt || specialty;
}

export function getSpecialtyTrackingKey(
  specialty: string | undefined,
  specialties: SpecialtyLike[],
): string {
  if (!specialty) return '';
  return findSpecialtyRecord(specialty, specialties)?.id || specialty;
}
