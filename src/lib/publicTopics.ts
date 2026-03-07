import type { SupportedLang } from '@/i18n';

export interface PublicTopicDefinition {
  slug: string;
  label: Record<SupportedLang, string>;
  summary: Record<SupportedLang, string>;
  tokens: string[];
}

export const PUBLIC_TOPICS: PublicTopicDefinition[] = [
  {
    slug: 'nvpo',
    label: {
      fr: 'NVPO',
      pt: 'NVPO',
      en: 'PONV',
    },
    summary: {
      fr: 'Prophylaxie, score de risque, rescue et protocoles pratiques pour les NVPO.',
      pt: 'Profilaxia, score de risco, rescue e protocolos praticos para NVPO.',
      en: 'Prophylaxis, risk scoring, rescue treatment, and practical PONV protocols.',
    },
    tokens: ['nvpo', 'ponv', 'apfel', 'antiemetic', 'ondansetron', 'nausee', 'vomissement'],
  },
  {
    slug: 'voie-aerienne',
    label: {
      fr: 'Voie aerienne',
      pt: 'Via aerea',
      en: 'Airway',
    },
    summary: {
      fr: 'Algorithmes, checklists et points critiques pour la voie aerienne difficile.',
      pt: 'Algoritmos, checklists e pontos criticos para via aerea dificil.',
      en: 'Algorithms, checklists, and critical points for difficult airway management.',
    },
    tokens: ['airway', 'voie aerienne', 'via aerea', 'difficult airway', 'intubation', 'extubation'],
  },
  {
    slug: 'alr',
    label: {
      fr: 'ALR',
      pt: 'ALR',
      en: 'Regional anesthesia',
    },
    summary: {
      fr: 'Blocs, indications, contre-indications et techniques en anesthesie locoregionale.',
      pt: 'Bloqueios, indicacoes, contraindicacoes e tecnicas em anestesia locorregional.',
      en: 'Blocks, indications, contraindications, and techniques in regional anesthesia.',
    },
    tokens: ['alr', 'regional anesthesia', 'bloc', 'block', 'ultrasound', 'perineural'],
  },
  {
    slug: 'antibioprophylaxie',
    label: {
      fr: 'Antibioprophylaxie',
      pt: 'Antibioprofilaxia',
      en: 'Antibiotic prophylaxis',
    },
    summary: {
      fr: 'Timing, molecule, redosage et checks utiles pour l antibioprophylaxie peri-operatoire.',
      pt: 'Timing, molecula, redose e checks uteis para antibioprofilaxia perioperatoria.',
      en: 'Timing, agent selection, redosing, and key checks for perioperative antibiotic prophylaxis.',
    },
    tokens: ['antibioprophylaxie', 'antibioprofilaxia', 'antibiotic prophylaxis', 'cefazoline', 'antibiotic'],
  },
];

export function getPublicTopic(slug: string) {
  return PUBLIC_TOPICS.find((topic) => topic.slug === slug);
}
