import enCatalog from "./en.json";
import frCatalog from "./fr.json";
import ptCatalog from "./pt.json";

export const SUPPORTED_LANGS = ["fr", "pt", "en"] as const;

export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export type TranslationCatalog = Record<string, string>;

export interface TranslationResolution {
  key: string;
  requestedLang: SupportedLang;
  resolvedLang: SupportedLang | null;
  value: string;
  missing: boolean;
  missingEverywhere: boolean;
}

const catalogs: Record<SupportedLang, TranslationCatalog> = {
  fr: frCatalog,
  pt: ptCatalog,
  en: enCatalog,
};

const fallbackOrder: Record<SupportedLang, SupportedLang[]> = {
  fr: ["fr", "en", "pt"],
  pt: ["pt", "fr", "en"],
  en: ["en", "fr", "pt"],
};

const baseCatalog = catalogs.fr;
const catalogKeys = Array.from(
  new Set(Object.values(catalogs).flatMap((catalog) => Object.keys(catalog))),
).sort();

export const DEFAULT_LANG: SupportedLang = "fr";

function hasOwnTranslation(lang: SupportedLang, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(catalogs[lang], key) && catalogs[lang][key] !== "";
}

export function isSupportedLang(value: string | null | undefined): value is SupportedLang {
  return !!value && SUPPORTED_LANGS.includes(value as SupportedLang);
}

export function translateUI(key: string, lang: SupportedLang): TranslationResolution {
  const requestedHasValue = hasOwnTranslation(lang, key);

  for (const candidate of fallbackOrder[lang]) {
    if (!hasOwnTranslation(candidate, key)) continue;

    return {
      key,
      requestedLang: lang,
      resolvedLang: candidate,
      value: catalogs[candidate][key],
      missing: !requestedHasValue,
      missingEverywhere: false,
    };
  }

  return {
    key,
    requestedLang: lang,
    resolvedLang: null,
    value: key,
    missing: true,
    missingEverywhere: true,
  };
}

export function getMissingCatalogKeys(lang: SupportedLang): string[] {
  if (lang === DEFAULT_LANG) {
    return catalogKeys.filter((key) => !hasOwnTranslation(lang, key));
  }

  return Object.keys(baseCatalog).filter((key) => !hasOwnTranslation(lang, key));
}

export function getMissingCatalogReport(): Record<SupportedLang, string[]> {
  return {
    fr: getMissingCatalogKeys("fr"),
    pt: getMissingCatalogKeys("pt"),
    en: getMissingCatalogKeys("en"),
  };
}
