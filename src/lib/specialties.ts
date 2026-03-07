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

export function slugifySpecialtyLabel(value: string): string {
  return normalizeSpecialtyToken(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

export function getSpecialtyCanonicalName(
  specialty: string | undefined,
  specialties: SpecialtyLike[],
): string {
  if (!specialty) return '';

  const record = findSpecialtyRecord(specialty, specialties);
  if (!record?.name) return specialty;

  return record.name.fr || record.name.en || record.name.pt || specialty;
}

export function buildPublicSpecialtyPath(
  specialty: string | undefined,
  specialties: SpecialtyLike[],
): string {
  const canonical = getSpecialtyCanonicalName(specialty, specialties);
  const slug = slugifySpecialtyLabel(canonical);
  return slug ? `/specialties/${slug}` : '/';
}

export interface SpecialtySlugMatch {
  id: string;
  label: string;
  aliases: string[];
}

export interface SpecialtyContentCount {
  specialty: string;
  count: number;
}

export function getSpecialtyContentCounts<T extends { specialty?: string }>(
  items: T[],
  specialties: SpecialtyLike[],
): SpecialtyContentCount[] {
  const counts = new Map<string, number>();

  for (const item of items) {
    if (!item.specialty) continue;
    const key = getSpecialtyTrackingKey(item.specialty, specialties) || item.specialty;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()]
    .map(([specialty, count]) => ({ specialty, count }))
    .sort((left, right) => right.count - left.count || left.specialty.localeCompare(right.specialty));
}

export function findSpecialtyBySlug(
  slug: string,
  specialties: SpecialtyLike[],
  fallbackSpecialties: string[] = [],
): SpecialtySlugMatch | undefined {
  const target = slugifySpecialtyLabel(slug);
  if (!target) return undefined;

  const records = specialties.map((record) => {
    const aliases = [record.id, record.name?.fr, record.name?.en, record.name?.pt].filter(
      Boolean,
    ) as string[];

    return {
      id: record.id,
      label: record.name?.fr || record.name?.en || record.name?.pt || record.id,
      aliases,
    };
  });

  const fallbackRecords = fallbackSpecialties
    .filter((specialty) => !records.some((record) => record.aliases.includes(specialty)))
    .map((specialty) => ({
      id: specialty,
      label: specialty,
      aliases: [specialty],
    }));

  return [...records, ...fallbackRecords].find((record) =>
    record.aliases.some((alias) => slugifySpecialtyLabel(alias) === target),
  );
}

export function specialtyMatchesSlug(
  specialty: string | undefined,
  match: SpecialtySlugMatch | undefined,
  specialties: SpecialtyLike[],
): boolean {
  if (!specialty || !match) return false;

  const record = findSpecialtyRecord(specialty, specialties);
  if (record?.id && record.id === match.id) return true;

  return match.aliases.some(
    (candidate) => normalizeSpecialtyToken(candidate) === normalizeSpecialtyToken(specialty),
  );
}

export function getSpecialtyTrackingKey(
  specialty: string | undefined,
  specialties: SpecialtyLike[],
): string {
  if (!specialty) return '';
  return findSpecialtyRecord(specialty, specialties)?.id || specialty;
}
