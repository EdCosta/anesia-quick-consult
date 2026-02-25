import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

export type Lang = 'fr' | 'pt' | 'en';

const UI: Record<string, Record<Lang, string>> = {
  search_placeholder: {
    fr: 'Rechercher une chirurgie...',
    pt: 'Pesquisar uma cirurgia...',
    en: 'Search a surgery...',
  },
  favorites: { fr: '⭐ Favoris', pt: '⭐ Favoritos', en: '⭐ Favorites' },
  recents: { fr: '🕘 Récents', pt: '🕘 Recentes', en: '🕘 Recents' },
  results: { fr: '🔎 Résultats', pt: '🔎 Resultados', en: '🔎 Results' },
  all_specialties: { fr: 'Toutes', pt: 'Todas', en: 'All' },
  all_procedures: {
    fr: 'Toutes les procédures',
    pt: 'Todos os procedimentos',
    en: 'All procedures',
  },
  preop: { fr: 'Pré-opératoire', pt: 'Pré-operatório', en: 'Pre-operative' },
  intraop: {
    fr: 'Intra-opératoire',
    pt: 'Intra-operatório',
    en: 'Intra-operative',
  },
  postop: {
    fr: 'Post-opératoire',
    pt: 'Pós-operatório',
    en: 'Post-operative',
  },
  red_flags: { fr: '🚩 Red Flags', pt: '🚩 Red Flags', en: '🚩 Red Flags' },
  drugs_doses: {
    fr: '💊 Médicaments & Doses',
    pt: '💊 Medicamentos & Doses',
    en: '💊 Drugs & Doses',
  },
  weight_kg: { fr: 'Poids (kg)', pt: 'Peso (kg)', en: 'Weight (kg)' },
  court: {
    fr: 'Court & clinique',
    pt: 'Curto & clínico',
    en: 'Quick & clinical',
  },
  detail: {
    fr: 'Détail scientifique',
    pt: 'Detalhe científico',
    en: 'Scientific detail',
  },
  clinical_notes: {
    fr: '📋 Notes cliniques',
    pt: '📋 Notas clínicas',
    en: '📋 Clinical notes',
  },
  pitfalls: {
    fr: '⚠️ Pièges & erreurs',
    pt: '⚠️ Armadilhas & erros',
    en: '⚠️ Pitfalls & errors',
  },
  references_title: {
    fr: '📚 Références',
    pt: '📚 Referências',
    en: '📚 References',
  },
  disclaimer: {
    fr: 'Support éducatif. Suivre protocoles locaux et jugement clinique.',
    pt: 'Suporte educativo. Seguir protocolos locais e julgamento clínico.',
    en: 'Educational support. Follow local protocols and clinical judgment.',
  },
  no_favorites: {
    fr: 'Aucun favori pour le moment',
    pt: 'Sem favoritos de momento',
    en: 'No favorites yet',
  },
  no_recents: {
    fr: 'Aucune consultation récente',
    pt: 'Sem consultas recentes',
    en: 'No recent views',
  },
  no_results: {
    fr: 'Aucun résultat trouvé',
    pt: 'Nenhum resultado encontrado',
    en: 'No results found',
  },
  admin_title: {
    fr: 'Gestion du contenu',
    pt: 'Gestão de conteúdo',
    en: 'Content Management',
  },
  back: { fr: '← Retour', pt: '← Voltar', en: '← Back' },
  dose_calc: {
    fr: 'Dose calculée',
    pt: 'Dose calculada',
    en: 'Calculated dose',
  },
  max_dose: { fr: 'Dose max', pt: 'Dose máx', en: 'Max dose' },
  volume: { fr: 'Volume', pt: 'Volume', en: 'Volume' },
  protocol_local: {
    fr: 'À définir selon protocole local',
    pt: 'A definir segundo protocolo local',
    en: 'Define per local protocol',
  },
  route_label: { fr: 'Voie', pt: 'Via', en: 'Route' },
  concentration: {
    fr: 'Concentration',
    pt: 'Concentração',
    en: 'Concentration',
  },
  contraindications: {
    fr: '⛔ Contre-indications',
    pt: '⛔ Contra-indicações',
    en: '⛔ Contraindications',
  },
  renal_hepatic: {
    fr: '🫘 Ajustement rénal/hépatique',
    pt: '🫘 Ajuste renal/hepático',
    en: '🫘 Renal/hepatic adjustment',
  },
  enter_weight: {
    fr: 'Entrer le poids pour calculer les doses',
    pt: 'Introduzir peso para calcular doses',
    en: 'Enter weight to calculate doses',
  },
  loading: { fr: 'Chargement...', pt: 'A carregar...', en: 'Loading...' },
  home: { fr: 'Accueil', pt: 'Início', en: 'Home' },
  admin: {
    fr: 'Gestion contenu',
    pt: 'Gestão conteúdo',
    en: 'Content mgmt',
  },
  mg_per_kg: { fr: 'mg/kg', pt: 'mg/kg', en: 'mg/kg' },
  select_concentration: {
    fr: 'Choisir concentration',
    pt: 'Escolher concentração',
    en: 'Select concentration',
  },
  guidelines: { fr: 'Guidelines', pt: 'Guidelines', en: 'Guidelines' },
  guidelines_desc: {
    fr: 'Recommandations et bonnes pratiques',
    pt: 'Recomendações e boas práticas',
    en: 'Recommendations and best practices',
  },
  alr: { fr: 'ALR', pt: 'ALR', en: 'ALR' },
  alr_full: {
    fr: 'Anesthésie Loco-Régionale',
    pt: 'Anestesia Loco-Regional',
    en: 'Regional Anesthesia',
  },
  calculateurs: { fr: 'Calculateurs', pt: 'Calculadoras', en: 'Calculators' },
  calculateurs_desc: {
    fr: 'Outils de calcul de doses et scores',
    pt: 'Ferramentas de cálculo de doses e scores',
    en: 'Dose and score calculation tools',
  },
  protocoles: { fr: 'Protocoles', pt: 'Protocolos', en: 'Protocols' },
  protocoles_desc: {
    fr: 'Checklists et protocoles standardisés',
    pt: 'Checklists e protocolos padronizados',
    en: 'Standardized checklists and protocols',
  },
  coming_soon: { fr: 'À venir', pt: 'Em breve', en: 'Coming soon' },
  quick_access: {
    fr: 'Accès rapide',
    pt: 'Acesso rápido',
    en: 'Quick access',
  },
  tagline: {
    fr: "Votre assistant d'anesthésie",
    pt: 'O seu assistente de anestesia',
    en: 'Your anesthesia assistant',
  },
  available: { fr: 'Disponible', pt: 'Disponível', en: 'Available' },
  procedures_title: {
    fr: 'Procédures',
    pt: 'Procedimentos',
    en: 'Procedures',
  },

  // Dilution keys
  dilution_title: {
    fr: 'Préparer une dilution',
    pt: 'Preparar uma diluição',
    en: 'Prepare a dilution',
  },
  stock_concentration: {
    fr: 'Concentration stock (mg/mL)',
    pt: 'Concentração stock (mg/mL)',
    en: 'Stock concentration (mg/mL)',
  },
  target_concentration: {
    fr: 'Concentration cible (mg/mL)',
    pt: 'Concentração alvo (mg/mL)',
    en: 'Target concentration (mg/mL)',
  },
  final_volume: {
    fr: 'Volume final (mL)',
    pt: 'Volume final (mL)',
    en: 'Final volume (mL)',
  },
  syringe_size: {
    fr: 'Taille seringue',
    pt: 'Tamanho da seringa',
    en: 'Syringe size',
  },
  desired_dose: {
    fr: 'Dose souhaitée (mg)',
    pt: 'Dose desejada (mg)',
    en: 'Desired dose (mg)',
  },
  prepare_dilution: {
    fr: 'Préparer dilution',
    pt: 'Preparar diluição',
    en: 'Prepare dilution',
  },
  volume_unavailable: {
    fr: 'Volume : non disponible (concentration non définie)',
    pt: 'Volume: não disponível (concentração não definida)',
    en: 'Volume: unavailable (concentration not defined)',
  },
  copy_checklist: {
    fr: 'Copier checklist',
    pt: 'Copiar checklist',
    en: 'Copy checklist',
  },
  copied: { fr: 'Copié !', pt: 'Copiado!', en: 'Copied!' },
  warning: { fr: 'Attention', pt: 'Atenção', en: 'Warning' },
  data_load_error: {
    fr: 'Erreur de chargement des données',
    pt: 'Erro ao carregar dados',
    en: 'Failed to load data',
  },
  dilution_draw: {
    fr: 'Prélever',
    pt: 'Aspirar',
    en: 'Draw',
  },
  dilution_add_diluent: {
    fr: 'de diluant',
    pt: 'de diluente',
    en: 'of diluent',
  },
  dilution_result_label: {
    fr: 'Résultat',
    pt: 'Resultado',
    en: 'Result',
  },
  dilution_of_drug: {
    fr: 'de produit',
    pt: 'de produto',
    en: 'of drug',
  },
  dilution_at_conc: {
    fr: 'à',
    pt: 'a',
    en: 'at',
  },
  or: { fr: 'ou', pt: 'ou', en: 'or' },
  close: { fr: 'Fermer', pt: 'Fechar', en: 'Close' },

  // Warnings for dilution
  warning_invalid_stock: {
    fr: 'Concentration stock invalide',
    pt: 'Concentração stock inválida',
    en: 'Invalid stock concentration',
  },
  warning_no_volume: {
    fr: 'Volume final requis',
    pt: 'Volume final necessário',
    en: 'Final volume required',
  },
  warning_no_target: {
    fr: 'Concentration cible ou dose requise',
    pt: 'Concentração alvo ou dose necessária',
    en: 'Target concentration or dose required',
  },
  warning_target_exceeds_stock: {
    fr: 'La concentration cible dépasse le stock',
    pt: 'Concentração alvo excede o stock',
    en: 'Target concentration exceeds stock',
  },
  warning_drug_exceeds_volume: {
    fr: 'Le volume de produit dépasse le volume final',
    pt: 'O volume de produto excede o volume final',
    en: 'Drug volume exceeds final volume',
  },
  warning_negative_diluent: {
    fr: 'Volume de diluant négatif',
    pt: 'Volume de diluente negativo',
    en: 'Negative diluent volume',
  },
  warning_exceeds_syringe: {
    fr: 'Le volume final dépasse la seringue',
    pt: 'O volume final excede a seringa',
    en: 'Final volume exceeds syringe',
  },
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

  const t = useCallback(
    (key: string): string => {
      const entry = UI[key];
      if (!entry) return key;
      return entry[lang] ?? entry['fr'] ?? entry['pt'] ?? entry['en'] ?? key;
    },
    [lang]
  );

  const resolve = useCallback(
    <T,>(obj: Partial<Record<Lang, T>> | undefined): T | undefined => {
      if (!obj) return undefined;
      return obj[lang] ?? obj['fr'] ?? obj['pt'] ?? obj['en'];
    },
    [lang]
  );

  const resolveStr = useCallback(
    (obj: Partial<Record<Lang, string>> | undefined): string => {
      if (!obj) return '';
      return obj[lang] ?? obj['fr'] ?? obj['pt'] ?? obj['en'] ?? '';
    },
    [lang]
  );

  return (
    <LanguageContext.Provider
      value={{ lang, setLang: handleSetLang, t, resolve, resolveStr }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
