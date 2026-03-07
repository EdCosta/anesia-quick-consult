import type { SupportedLang } from '@/lib/types';

export type SearchIntentConfig = {
  id: string;
  title: Record<SupportedLang, string>;
  description: Record<SupportedLang, string>;
  route: string;
  synonyms: string[];
};

export const SEARCH_INTENTS_CONFIG: SearchIntentConfig[] = [
  {
    id: 'ponv',
    title: {
      fr: 'NVPO',
      pt: 'NVPO',
      en: 'PONV',
    },
    description: {
      fr: 'Ouvrir directement le protocole NVPO.',
      pt: 'Abrir diretamente o protocolo NVPO.',
      en: 'Open the PONV protocol directly.',
    },
    route: '/protocoles?category=ponv&open=ponv-protocol',
    synonyms: ['nvpo', 'ponv', 'apfel', 'nausee', 'vomissements', 'nausea', 'vomiting'],
  },
  {
    id: 'airway',
    title: {
      fr: 'Voie aerienne',
      pt: 'Via aerea',
      en: 'Airway',
    },
    description: {
      fr: 'Aller vers l algorithme voie aerienne difficile.',
      pt: 'Ir para o algoritmo de via aerea dificil.',
      en: 'Jump to the difficult-airway algorithm.',
    },
    route: '/protocoles?search=airway&open=difficult-airway-algorithm',
    synonyms: [
      'voie aerienne',
      'via aerea',
      'airway',
      'difficult airway',
      'intubation',
      'ett',
    ],
  },
  {
    id: 'alr',
    title: {
      fr: 'ALR',
      pt: 'ALR',
      en: 'Regional',
    },
    description: {
      fr: 'Ouvrir rapidement les blocs regionaux les plus utiles.',
      pt: 'Abrir rapidamente os blocos regionais mais uteis.',
      en: 'Open high-yield regional blocks quickly.',
    },
    route: '/alr?region=lower_limb&open=peng-block',
    synonyms: [
      'alr',
      'regional',
      'block',
      'peng',
      'rachi',
      'peridural',
      'regional anesthesia',
    ],
  },
  {
    id: 'antibiotic-prophylaxis',
    title: {
      fr: 'Antibioprophylaxie',
      pt: 'Antibioprofilaxia',
      en: 'Antibiotic prophylaxis',
    },
    description: {
      fr: 'Ouvrir la recommandation d antibioprophylaxie.',
      pt: 'Abrir a recomendacao de antibioprofilaxia.',
      en: 'Open the antibiotic prophylaxis recommendation.',
    },
    route: '/guidelines?search=antibioprophylaxie&open=antibioprophylaxie',
    synonyms: [
      'antibioprophylaxie',
      'antibioprofilaxia',
      'antibiotic prophylaxis',
      'cefazoline',
    ],
  },
  {
    id: 'fragile',
    title: {
      fr: 'Patient fragile',
      pt: 'Doente fragil',
      en: 'Fragile patient',
    },
    description: {
      fr: 'Lancer la consultation pre-anesthesique avec preset fragile.',
      pt: 'Lancar a consulta pre-anestesica com preset fragil.',
      en: 'Launch pre-anesthesia with the fragile-patient preset.',
    },
    route: '/preanest?preset=fragile',
    synonyms: ['fragile', 'frail', 'elderly', 'geriatr', 'comorbide', 'comorbidity'],
  },
  {
    id: 'rcri',
    title: {
      fr: 'Risque cardiaque',
      pt: 'Risco cardiaco',
      en: 'Cardiac risk',
    },
    description: {
      fr: 'Ouvrir directement le score RCRI.',
      pt: 'Abrir diretamente o score RCRI.',
      en: 'Open the RCRI score directly.',
    },
    route: '/calculateurs?open=rcri',
    synonyms: ['rcri', 'cardiac risk', 'risque cardiaque', 'risco cardiaco'],
  },
  {
    id: 'emergency',
    title: {
      fr: 'Urgence',
      pt: 'Urgencia',
      en: 'Emergency',
    },
    description: {
      fr: 'Ouvrir directement les protocoles d urgence.',
      pt: 'Abrir diretamente os protocolos de urgencia.',
      en: 'Open the emergency protocols directly.',
    },
    route: '/protocoles?category=emergency',
    synonyms: ['urgence', 'urgencia', 'emergency', 'rapid sequence', 'rsi', 'crash induction'],
  },
];
