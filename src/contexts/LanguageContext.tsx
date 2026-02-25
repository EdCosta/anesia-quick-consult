import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Lang = 'fr' | 'pt' | 'en';

const UI: Record<string, Record<Lang, string>> = {
  search_placeholder: { fr: 'Rechercher une chirurgie...', pt: 'Pesquisar uma cirurgia...', en: 'Search a surgery...' },
  favorites: { fr: '⭐ Favoris', pt: '⭐ Favoritos', en: '⭐ Favorites' },
  recents: { fr: '🕘 Récents', pt: '🕘 Recentes', en: '🕘 Recents' },
  results: { fr: '🔎 Résultats', pt: '🔎 Resultados', en: '🔎 Results' },
  all_specialties: { fr: 'Toutes', pt: 'Todas', en: 'All' },
  all_procedures: { fr: 'Toutes les procédures', pt: 'Todos os procedimentos', en: 'All procedures' },
  preop: { fr: 'Pré-opératoire', pt: 'Pré-operatório', en: 'Pre-operative' },
  intraop: { fr: 'Intra-opératoire', pt: 'Intra-operatório', en: 'Intra-operative' },
  postop: { fr: 'Post-opératoire', pt: 'Pós-operatório', en: 'Post-operative' },
  red_flags: { fr: '🚩 Red Flags', pt: '🚩 Red Flags', en: '🚩 Red Flags' },
  drugs_doses: { fr: '💊 Médicaments & Doses', pt: '💊 Medicamentos & Doses', en: '💊 Drugs & Doses' },
  weight_kg: { fr: 'Poids (kg)', pt: 'Peso (kg)', en: 'Weight (kg)' },
  court: { fr: 'Court & clinique', pt: 'Curto & clínico', en: 'Quick & clinical' },
  detail: { fr: 'Détail scientifique', pt: 'Detalhe científico', en: 'Scientific detail' },
  clinical_notes: { fr: '📋 Notes cliniques', pt: '📋 Notas clínicas', en: '📋 Clinical notes' },
  pitfalls: { fr: '⚠️ Pièges & erreurs', pt: '⚠️ Armadilhas & erros', en: '⚠️ Pitfalls & errors' },
  references_title: { fr: '📚 Références', pt: '📚 Referências', en: '📚 References' },
  disclaimer: { fr: 'Support éducatif. Suivre protocoles locaux et jugement clinique.', pt: 'Suporte educativo. Seguir protocolos locais e julgamento clínico.', en: 'Educational support. Follow local protocols and clinical judgment.' },
  no_favorites: { fr: 'Aucun favori pour le moment', pt: 'Sem favoritos de momento', en: 'No favorites yet' },
  no_recents: { fr: 'Aucune consultation récente', pt: 'Sem consultas recentes', en: 'No recent views' },
  no_results: { fr: 'Aucun résultat trouvé', pt: 'Nenhum resultado encontrado', en: 'No results found' },
  admin_title: { fr: 'Gestion du contenu', pt: 'Gestão de conteúdo', en: 'Content Management' },
  back: { fr: '← Retour', pt: '← Voltar', en: '← Back' },
  dose_calc: { fr: 'Dose calculée', pt: 'Dose calculada', en: 'Calculated dose' },
  max_dose: { fr: 'Dose max', pt: 'Dose máx', en: 'Max dose' },
  volume: { fr: 'Volume', pt: 'Volume', en: 'Volume' },
  protocol_local: { fr: 'À définir selon protocole local', pt: 'A definir segundo protocolo local', en: 'Define per local protocol' },
  route_label: { fr: 'Voie', pt: 'Via', en: 'Route' },
  concentration: { fr: 'Concentration', pt: 'Concentração', en: 'Concentration' },
  contraindications: { fr: '⛔ Contre-indications', pt: '⛔ Contra-indicações', en: '⛔ Contraindications' },
  renal_hepatic: { fr: '🫘 Ajustement rénal/hépatique', pt: '🫘 Ajuste renal/hepático', en: '🫘 Renal/hepatic adjustment' },
  enter_weight: { fr: 'Entrer le poids pour calculer les doses', pt: 'Introduzir peso para calcular doses', en: 'Enter weight to calculate doses' },
  loading: { fr: 'Chargement...', pt: 'A carregar...', en: 'Loading...' },
  home: { fr: 'Accueil', pt: 'Início', en: 'Home' },
  admin: { fr: 'Gestion contenu', pt: 'Gestão conteúdo', en: 'Content mgmt' },
  mg_per_kg: { fr: 'mg/kg', pt: 'mg/kg', en: 'mg/kg' },
  select_concentration: { fr: 'Choisir concentration', pt: 'Escolher concentração', en: 'Select concentration' },
};

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
    const saved = localStorage.getItem('anesia-lang');
    if (saved === 'fr' || saved === 'pt' || saved === 'en') return saved;
    return 'fr';
  });

  const handleSetLang = useCallback((newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('anesia-lang', newLang);
  }, []);

  const t = useCallback((key: string): string => {
    const entry = UI[key];
    if (!entry) return key;
    return entry[lang] ?? entry['fr'] ?? entry['pt'] ?? entry['en'] ?? key;
  }, [lang]);

  const resolve = useCallback(<T,>(obj: Partial<Record<Lang, T>> | undefined): T | undefined => {
    if (!obj) return undefined;
    return obj[lang] ?? obj['fr'] ?? obj['pt'] ?? obj['en'];
  }, [lang]);

  const resolveStr = useCallback((obj: Partial<Record<Lang, string>> | undefined): string => {
    if (!obj) return '';
    return obj[lang] ?? obj['fr'] ?? obj['pt'] ?? obj['en'] ?? '';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t, resolve, resolveStr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
