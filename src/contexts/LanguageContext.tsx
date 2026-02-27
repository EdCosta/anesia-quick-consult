import React, { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { DEFAULT_LANG, isSupportedLang, translateUI, type SupportedLang } from "@/i18n";

export type Lang = SupportedLang;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  resolve: <T>(obj: Partial<Record<Lang, T>> | undefined) => T | undefined;
  resolveStr: (obj: Partial<Record<Lang, string>> | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("anesia-lang");
    if (isSupportedLang(saved)) return saved;
    return DEFAULT_LANG;
  });
  const warnedMissingTranslations = useRef(new Set<string>());

  const handleSetLang = useCallback((newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("anesia-lang", newLang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const result = translateUI(key, lang);

      if (result.missing) {
        const warningId = `${result.requestedLang}:${result.key}:${result.resolvedLang ?? "missing"}`;

        if (!warnedMissingTranslations.current.has(warningId)) {
          warnedMissingTranslations.current.add(warningId);
          console.warn(
            result.missingEverywhere
              ? `[i18n] Missing UI key "${result.key}" for ${result.requestedLang} with no fallback`
              : `[i18n] Missing UI key "${result.key}" for ${result.requestedLang}; using ${result.resolvedLang}`,
          );
        }
      }

      return result.value;
    },
    [lang],
  );

  const resolve = useCallback(
    <T,>(obj: Partial<Record<Lang, T>> | undefined): T | undefined => {
      if (!obj) return undefined;
      return obj[lang] ?? obj.fr ?? obj.en ?? obj.pt;
    },
    [lang],
  );

  const resolveStr = useCallback(
    (obj: Partial<Record<Lang, string>> | undefined): string => {
      if (!obj) return "";
      return obj[lang] ?? obj.fr ?? obj.en ?? obj.pt ?? "";
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t, resolve, resolveStr }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
