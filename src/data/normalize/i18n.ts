export const SUPPORTED_LANGS = ['fr', 'en', 'pt'] as const;

export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

function hasOwn(obj: object, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isLocalizedRecord<T>(value: unknown): value is Partial<Record<SupportedLang, T>> {
  if (!isPlainObject(value)) return false;
  return SUPPORTED_LANGS.some((lang) => hasOwn(value, lang));
}

export function normalizeLocalizedValue<T>(
  value: Partial<Record<SupportedLang, T>> | T | null | undefined,
  getFallback: () => T,
): Record<SupportedLang, T> {
  const source = isLocalizedRecord<T>(value) ? value : { fr: value as T };
  const fr = source.fr ?? getFallback();

  return {
    fr,
    en: source.en ?? fr,
    pt: source.pt ?? fr,
  };
}

export function mergeMissing<T>(target: T, fallback: T): T {
  if (target == null) return fallback;
  if (Array.isArray(target)) return target.length > 0 ? target : fallback;
  if (!isPlainObject(target) || !isPlainObject(fallback)) return target;

  const merged: Record<string, unknown> = { ...target };

  for (const key of Object.keys(fallback)) {
    const targetValue = merged[key];
    const fallbackValue = fallback[key];

    if (targetValue == null) {
      merged[key] = fallbackValue;
      continue;
    }

    if (Array.isArray(targetValue) && Array.isArray(fallbackValue)) {
      if (targetValue.length === 0 && fallbackValue.length > 0) {
        merged[key] = fallbackValue;
      }
      continue;
    }

    if (isPlainObject(targetValue) && isPlainObject(fallbackValue)) {
      merged[key] = mergeMissing(targetValue, fallbackValue);
    }
  }

  return merged as T;
}
