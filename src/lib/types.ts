export type SupportedLang = 'fr' | 'en' | 'pt';

export type Localized<T> = Record<SupportedLang, T>;

export interface DrugRef {
  drug_id: string;
  indication_tag: string;
}

export interface Reference {
  source: string;
  year?: number;
  note?: string;
}

export interface ProcedureQuick {
  preop: string[];
  intraop: string[];
  postop: string[];
  red_flags: string[];
  drugs: DrugRef[];
}

export interface ProcedureDeep {
  clinical: string[];
  pitfalls: string[];
  references: Reference[];
}

export interface Procedure {
  id: string;
  specialty: string;
  specialties: string[];
  titles: Localized<string>;
  synonyms: Localized<string[]>;
  quick: Localized<ProcedureQuick>;
  deep: Localized<ProcedureDeep>;
  tags: string[];
  is_pro?: boolean;
}

export interface DoseRule {
  indication_tag: string;
  route: string;
  mg_per_kg: number | null;
  max_mg: number | null;
  notes: string[];
  unit_override?: string;
  dose_scalar?: 'TBW' | 'IBW' | 'LBW' | 'AdjBW' | 'TITRATE';
}

export interface Concentration {
  label: string;
  mg_per_ml: number | null;
}

export interface Drug {
  id: string;
  name: Localized<string>;
  dose_rules: DoseRule[];
  concentrations: Concentration[];
  contraindications_notes: string[];
  renal_hepatic_notes: string[];
  tags: string[];
}

// Guidelines
export interface Guideline {
  id: string;
  category: string;
  titles: Localized<string>;
  items: Localized<string[]>;
  references: Reference[];
  tags: string[];
  specialties: string[];
  organization?: string;
  recommendation_strength?: number;
}

// Protocoles
export interface Protocole {
  id: string;
  category: string;
  titles: Localized<string>;
  steps: Localized<string[]>;
  references: Reference[];
  tags: string[];
}

// ALR Blocks
export interface ALRBlock {
  id: string;
  region: string;
  titles: Localized<string>;
  indications: Localized<string[]>;
  contraindications: Localized<string[]>;
  technique: Localized<string[]>;
  drugs: Localized<string[]>;
  tags: string[];
}
