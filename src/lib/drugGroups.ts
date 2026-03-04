export type DrugGroup =
  | 'induction'
  | 'maintenance'
  | 'analgesia'
  | 'ponv'
  | 'prophylaxis'
  | 'other';

const DRUG_GROUP_MAP: Record<string, DrugGroup> = {
  propofol: 'induction',
  sufentanil: 'induction',
  fentanyl: 'induction',
  rocuronium: 'induction',
  cisatracurium: 'induction',
  succinylcholine: 'induction',
  thiopental: 'induction',
  etomidate: 'induction',
  midazolam: 'induction',

  sevoflurane: 'maintenance',
  desflurane: 'maintenance',
  isoflurane: 'maintenance',
  remifentanil: 'maintenance',

  paracetamol: 'analgesia',
  ibuprofene: 'analgesia',
  ketorolac: 'analgesia',
  diclofenac: 'analgesia',
  morphine: 'analgesia',
  tramadol: 'analgesia',
  nefopam: 'analgesia',
  lidocaine: 'analgesia',
  s_ketamine: 'analgesia',

  ondansetron: 'ponv',
  dexamethasone: 'ponv',
  droperidol: 'ponv',

  cefazoline: 'prophylaxis',
  amoxicillin_clavulanate: 'prophylaxis',
  acide_tranexamique: 'prophylaxis',
  enoxaparine: 'prophylaxis',
  heparine: 'prophylaxis',
  amoxicilline: 'prophylaxis',
};

// Indication tags that override drug-based grouping (lowercase, accents preserved as-is)
const INDICATION_GROUP_MAP: Record<string, DrugGroup> = {
  // Induction / NMB / reversal
  induction: 'induction',
  intubation: 'induction',
  isr: 'induction',
  'sédation': 'induction',
  prémédication: 'induction',
  curarisation_profonde: 'induction',
  reversal: 'induction',
  reversal_urgence: 'induction',

  // Maintenance / TIVA
  maintenance: 'maintenance',
  entretien: 'maintenance',
  tiva: 'maintenance',

  // Analgesia (EN + FR avec et sans accents)
  analgesia: 'analgesia',
  analgesie: 'analgesia',
  'analgésie': 'analgesia',
  'analgésie_perop': 'analgesia',
  'analgésie_postop': 'analgesia',
  'analgésie_secours': 'analgesia',
  'analgésie_it': 'analgesia',
  'co-analgésie': 'analgesia',

  // PONV / anti-oedème
  ponv: 'ponv',
  nvpo: 'ponv',
  'ponv_anti-oedème': 'ponv',
  'anti-oedème': 'ponv',
  'anti-oedème_laryngé': 'ponv',

  // Prophylaxis
  prophylaxis: 'prophylaxis',
  prophylaxie: 'prophylaxis',
  antibioprophylaxie: 'prophylaxis',
  thromboprophylaxie: 'prophylaxis',
  tev: 'prophylaxis',
  antifibrinolytique: 'prophylaxis',
};

export function getDrugGroup(drugId: string, indicationTag?: string): DrugGroup {
  if (indicationTag) {
    const tagLower = indicationTag.toLowerCase();
    const fromTag = INDICATION_GROUP_MAP[tagLower];
    if (fromTag) return fromTag;
  }
  return DRUG_GROUP_MAP[drugId] ?? 'other';
}

export const GROUP_ORDER: DrugGroup[] = [
  'induction',
  'maintenance',
  'analgesia',
  'ponv',
  'prophylaxis',
  'other',
];

export const GROUP_I18N_KEYS: Record<DrugGroup, string> = {
  induction: 'drug_group_induction',
  maintenance: 'drug_group_maintenance',
  analgesia: 'drug_group_analgesia',
  ponv: 'drug_group_ponv',
  prophylaxis: 'drug_group_prophylaxis',
  other: 'drug_group_other',
};

export function groupDrugs<T extends { drug_id: string; indication_tag?: string }>(
  drugs: T[],
): Record<DrugGroup, T[]> {
  const groups: Record<DrugGroup, T[]> = {
    induction: [],
    maintenance: [],
    analgesia: [],
    ponv: [],
    prophylaxis: [],
    other: [],
  };
  for (const drug of drugs) {
    const group = getDrugGroup(drug.drug_id, drug.indication_tag);
    groups[group].push(drug);
  }
  return groups;
}
