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

  // ETT / Intubation keys
  intubation_guide: {
    fr: 'IOT / Intubation (guide rapide)',
    en: 'IOT / Intubation (quick guide)',
    pt: 'IOT / Intubação (guia rápido)',
  },
  ett_calculator: {
    fr: 'Calculateur ETT',
    en: 'ETT Calculator',
    pt: 'Calculadora ETT',
  },
  age_years: { fr: 'Âge (années)', en: 'Age (years)', pt: 'Idade (anos)' },
  age_months: { fr: 'Âge (mois)', en: 'Age (months)', pt: 'Idade (meses)' },
  height_cm: { fr: 'Taille (cm)', en: 'Height (cm)', pt: 'Altura (cm)' },
  sex: { fr: 'Sexe', en: 'Sex', pt: 'Sexo' },
  male: { fr: 'Homme', en: 'Male', pt: 'Homem' },
  female: { fr: 'Femme', en: 'Female', pt: 'Mulher' },
  ett_cuffed: { fr: 'ETT cuffé', en: 'Cuffed ETT', pt: 'ETT cuffado' },
  ett_uncuffed: { fr: 'ETT non cuffé', en: 'Uncuffed ETT', pt: 'ETT não cuffado' },
  oral_depth: { fr: 'Prof. orale', en: 'Oral depth', pt: 'Prof. oral' },
  nasal_depth: { fr: 'Prof. nasale', en: 'Nasal depth', pt: 'Prof. nasal' },
  blade_size: { fr: 'Lame', en: 'Blade', pt: 'Lâmina' },
  lma_size: { fr: 'ML (taille)', en: 'LMA (size)', pt: 'ML (tamanho)' },
  ett_result: { fr: 'Résultat', en: 'Result', pt: 'Resultado' },
  ett_disclaimer: {
    fr: 'Confirmer cliniquement et par capnographie. Ajuster au patient. Outil éducatif uniquement.',
    en: 'Confirm clinically and with capnography. Adjust to patient. Educational tool only.',
    pt: 'Confirmar clinicamente e por capnografia. Ajustar ao doente. Ferramenta educativa apenas.',
  },
  pediatric: { fr: 'Pédiatrique', en: 'Pediatric', pt: 'Pediátrico' },
  adult: { fr: 'Adulte', en: 'Adult', pt: 'Adulto' },
  neonate: { fr: 'Néonatal / Nourrisson', en: 'Neonate / Infant', pt: 'Neonatal / Lactente' },
  cuff_pressure: { fr: 'Pression cuff', en: 'Cuff pressure', pt: 'Pressão cuff' },
  armed_tube: { fr: 'Tube armé', en: 'Reinforced tube', pt: 'Tubo armado' },
  adjust_small_child: {
    fr: 'Enfant petit pour l\'âge : taille réduite de 0.5 mm',
    en: 'Child small for age: size reduced by 0.5 mm',
    pt: 'Criança pequena para a idade: tamanho reduzido 0.5 mm',
  },
  adjust_large_child: {
    fr: 'Enfant grand pour l\'âge : taille augmentée de 0.5 mm',
    en: 'Child large for age: size increased by 0.5 mm',
    pt: 'Criança grande para a idade: tamanho aumentado 0.5 mm',
  },

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

  // Favorites & recents
  no_favorites_hint: {
    fr: 'Marque tes chirurgies fréquentes',
    pt: 'Marca as tuas cirurgias frequentes',
    en: 'Mark your frequent surgeries',
  },
  no_favorites_empty: {
    fr: 'Aucun favori pour le moment',
    pt: 'Ainda sem favoritos',
    en: 'No favorites yet',
  },
  view_all_procedures: {
    fr: 'Voir toutes les procédures',
    pt: 'Ver todos os procedimentos',
    en: 'View all procedures',
  },
  clear_recents: {
    fr: 'Effacer récents',
    pt: 'Limpar recentes',
    en: 'Clear recents',
  },
  favorites_first: {
    fr: 'Favoris en premier',
    pt: 'Favoritos primeiro',
    en: 'Favorites first',
  },
  only_favorites: {
    fr: '⭐ Favoris uniquement',
    pt: '⭐ Só favoritos',
    en: '⭐ Favorites only',
  },
  open_ett_calculator: {
    fr: 'Calculateur ETT',
    pt: 'Calculadora ETT',
    en: 'ETT Calculator',
  },

  // Guidelines / Protocoles / ALR
  search_guidelines: {
    fr: 'Rechercher une guideline...',
    pt: 'Pesquisar uma guideline...',
    en: 'Search guidelines...',
  },
  search_protocoles: {
    fr: 'Rechercher un protocole...',
    pt: 'Pesquisar um protocolo...',
    en: 'Search protocols...',
  },
  search_alr: {
    fr: 'Rechercher un bloc...',
    pt: 'Pesquisar um bloqueio...',
    en: 'Search a block...',
  },
  category: { fr: 'Catégorie', pt: 'Categoria', en: 'Category' },
  steps: { fr: 'Étapes', pt: 'Passos', en: 'Steps' },
  indications: { fr: 'Indications', pt: 'Indicações', en: 'Indications' },
  contraindications_alr: {
    fr: 'Contre-indications',
    pt: 'Contra-indicações',
    en: 'Contraindications',
  },
  technique: { fr: 'Technique', pt: 'Técnica', en: 'Technique' },
  drugs_alr: { fr: 'Médicaments', pt: 'Medicamentos', en: 'Drugs' },
  region: { fr: 'Région', pt: 'Região', en: 'Region' },
  upper_limb: { fr: 'Membre supérieur', pt: 'Membro superior', en: 'Upper limb' },
  lower_limb: { fr: 'Membre inférieur', pt: 'Membro inferior', en: 'Lower limb' },
  trunk: { fr: 'Tronc', pt: 'Tronco', en: 'Trunk' },
  head_neck: { fr: 'Tête & Cou', pt: 'Cabeça & Pescoço', en: 'Head & Neck' },
  all_categories: { fr: 'Toutes', pt: 'Todas', en: 'All' },
  all_regions: { fr: 'Toutes', pt: 'Todas', en: 'All' },
  references_label: { fr: 'Références', pt: 'Referências', en: 'References' },
  safety: { fr: 'Sécurité', pt: 'Segurança', en: 'Safety' },
  emergency: { fr: 'Urgence', pt: 'Emergência', en: 'Emergency' },
  preop_cat: { fr: 'Pré-opératoire', pt: 'Pré-operatório', en: 'Preoperative' },
  airway_cat: { fr: 'Voies aériennes', pt: 'Via aérea', en: 'Airway' },
  hemodynamics: { fr: 'Hémodynamique', pt: 'Hemodinâmica', en: 'Hemodynamics' },
  temperature_cat: { fr: 'Température', pt: 'Temperatura', en: 'Temperature' },
  ponv: { fr: 'NVPO', pt: 'NVPO', en: 'PONV' },
  pain: { fr: 'Douleur', pt: 'Dor', en: 'Pain' },
  fluid: { fr: 'Remplissage', pt: 'Reposição', en: 'Fluid' },
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
      return entry[lang] ?? entry['fr'] ?? entry['en'] ?? entry['pt'] ?? key;
    },
    [lang]
  );

  const resolve = useCallback(
    <T,>(obj: Partial<Record<Lang, T>> | undefined): T | undefined => {
      if (!obj) return undefined;
      return obj[lang] ?? obj['fr'] ?? obj['en'] ?? obj['pt'];
    },
    [lang]
  );

  const resolveStr = useCallback(
    (obj: Partial<Record<Lang, string>> | undefined): string => {
      if (!obj) return '';
      return obj[lang] ?? obj['fr'] ?? obj['en'] ?? obj['pt'] ?? '';
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
