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
  titles: { fr: string; pt?: string; en?: string };
  synonyms: { fr?: string[]; pt?: string[]; en?: string[] };
  quick: { fr: ProcedureQuick; pt?: ProcedureQuick; en?: ProcedureQuick };
  deep: { fr: ProcedureDeep; pt?: ProcedureDeep; en?: ProcedureDeep };
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
  name: { fr: string; pt?: string; en?: string };
  dose_rules: DoseRule[];
  concentrations: Concentration[];
  contraindications_notes: string[];
  renal_hepatic_notes: string[];
}

// Guidelines
export interface Guideline {
  id: string;
  category: string;
  titles: { fr: string; pt?: string; en?: string };
  items: { fr: string[]; pt?: string[]; en?: string[] };
  references: Reference[];
}

// Protocoles
export interface Protocole {
  id: string;
  category: string;
  titles: { fr: string; pt?: string; en?: string };
  steps: { fr: string[]; pt?: string[]; en?: string[] };
  references: Reference[];
}

// ALR Blocks
export interface ALRBlock {
  id: string;
  region: string;
  titles: { fr: string; pt?: string; en?: string };
  indications: { fr: string[]; pt?: string[]; en?: string[] };
  contraindications: { fr: string[]; pt?: string[]; en?: string[] };
  technique: { fr: string[]; pt?: string[]; en?: string[] };
  drugs: { fr: string[]; pt?: string[]; en?: string[] };
}
