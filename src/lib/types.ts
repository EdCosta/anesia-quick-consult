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
  doi?: string;
  pmid?: string;
  url?: string;
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

export interface DrugPresentation {
  label: string;
  total_mg: number | null;
  total_ml: number | null;
  diluent?: string;
  container?: 'ampoule' | 'vial' | 'syringe' | 'bag';
}

export interface StandardDilution {
  label: string;
  target_concentration: string;
  diluent?: string;
  final_volume_ml?: number | null;
  notes?: string[];
}

export interface Drug {
  id: string;
  name: Localized<string>;
  dose_rules: DoseRule[];
  concentrations: Concentration[];
  presentations: DrugPresentation[];
  standard_dilutions: StandardDilution[];
  compatibility_notes: string[];
  contraindications_notes: string[];
  renal_hepatic_notes: string[];
  tags: string[];
}

export type EvidenceGrade = 'A' | 'B' | 'C';

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
  version?: string;
  source?: string;
  published_at?: string;
  review_at?: string;
  evidence_grade?: EvidenceGrade;
}

// Protocoles
export interface Protocole {
  id: string;
  category: string;
  titles: Localized<string>;
  steps: Localized<string[]>;
  references: Reference[];
  tags: string[];
  version?: string;
  source?: string;
  published_at?: string;
  review_at?: string;
  evidence_grade?: EvidenceGrade;
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

export interface HospitalFormularyEntry {
  drug_id: string;
  available: boolean;
  presentations?: DrugPresentation[];
  notes?: string[];
}

export interface HospitalProfile {
  id: string;
  name: string;
  country?: string;
  default_lang: SupportedLang;
  formulary: {
    drug_ids: string[];
    items?: HospitalFormularyEntry[];
    presentations?: DrugPresentation[];
  };
  protocol_overrides: Record<string, unknown>;
}
