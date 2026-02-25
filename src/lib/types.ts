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
}

export interface DoseRule {
  indication_tag: string;
  route: string;
  mg_per_kg: number | null;
  max_mg: number | null;
  notes: string[];
  unit_override?: string;
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
