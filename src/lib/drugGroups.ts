export type DrugGroup = 'induction' | 'maintenance' | 'analgesia' | 'ponv' | 'prophylaxis' | 'other';

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
  morphine: 'analgesia',
  tramadol: 'analgesia',
  nefopam: 'analgesia',
  lidocaine: 'analgesia',
  
  ondansetron: 'ponv',
  dexamethasone: 'ponv',
  droperidol: 'ponv',
  
  cefazoline: 'prophylaxis',
  acide_tranexamique: 'prophylaxis',
  enoxaparine: 'prophylaxis',
  heparine: 'prophylaxis',
  amoxicilline: 'prophylaxis',
};

// Indication tags that override drug-based grouping
const INDICATION_GROUP_MAP: Record<string, DrugGroup> = {
  induction: 'induction',
  maintenance: 'maintenance',
  analgesia: 'analgesia',
  analgesie: 'analgesia',
  ponv: 'ponv',
  nvpo: 'ponv',
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

export const GROUP_ORDER: DrugGroup[] = ['induction', 'maintenance', 'analgesia', 'ponv', 'prophylaxis', 'other'];

export const GROUP_I18N_KEYS: Record<DrugGroup, string> = {
  induction: 'drug_group_induction',
  maintenance: 'drug_group_maintenance',
  analgesia: 'drug_group_analgesia',
  ponv: 'drug_group_ponv',
  prophylaxis: 'drug_group_prophylaxis',
  other: 'drug_group_other',
};

export function groupDrugs<T extends { drug_id: string; indication_tag?: string }>(drugs: T[]): Record<DrugGroup, T[]> {
  const groups: Record<DrugGroup, T[]> = {
    induction: [], maintenance: [], analgesia: [], ponv: [], prophylaxis: [], other: [],
  };
  for (const drug of drugs) {
    const group = getDrugGroup(drug.drug_id, drug.indication_tag);
    groups[group].push(drug);
  }
  return groups;
}
