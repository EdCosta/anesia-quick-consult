import type { DrugRef } from './types';

export interface DrugTemplate {
  specialty: string;
  drugs: DrugRef[];
}

export const DRUG_TEMPLATES: DrugTemplate[] = [
  {
    specialty: 'orthopedie',
    drugs: [
      { drug_id: 'propofol', indication_tag: 'induction' },
      { drug_id: 'sufentanil', indication_tag: 'induction' },
      { drug_id: 'rocuronium', indication_tag: 'induction' },
      { drug_id: 'sevoflurane', indication_tag: 'maintenance' },
      { drug_id: 'paracetamol', indication_tag: 'analgesia' },
      { drug_id: 'ketorolac', indication_tag: 'analgesia' },
      { drug_id: 'morphine', indication_tag: 'analgesia' },
      { drug_id: 'ondansetron', indication_tag: 'ponv' },
      { drug_id: 'cefazoline', indication_tag: 'antibioprophylaxie' },
      { drug_id: 'acide_tranexamique', indication_tag: 'antifibrinolytique' },
    ],
  },
  {
    specialty: 'digestif',
    drugs: [
      { drug_id: 'propofol', indication_tag: 'induction' },
      { drug_id: 'sufentanil', indication_tag: 'induction' },
      { drug_id: 'rocuronium', indication_tag: 'induction' },
      { drug_id: 'sevoflurane', indication_tag: 'maintenance' },
      { drug_id: 'paracetamol', indication_tag: 'analgesia' },
      { drug_id: 'morphine', indication_tag: 'analgesia' },
      { drug_id: 'ondansetron', indication_tag: 'ponv' },
      { drug_id: 'dexamethasone', indication_tag: 'ponv' },
      { drug_id: 'cefazoline', indication_tag: 'antibioprophylaxie' },
    ],
  },
  {
    specialty: 'urologie',
    drugs: [
      { drug_id: 'propofol', indication_tag: 'induction' },
      { drug_id: 'sufentanil', indication_tag: 'induction' },
      { drug_id: 'rocuronium', indication_tag: 'induction' },
      { drug_id: 'sevoflurane', indication_tag: 'maintenance' },
      { drug_id: 'paracetamol', indication_tag: 'analgesia' },
      { drug_id: 'ketorolac', indication_tag: 'analgesia' },
      { drug_id: 'ondansetron', indication_tag: 'ponv' },
      { drug_id: 'cefazoline', indication_tag: 'antibioprophylaxie' },
    ],
  },
  {
    specialty: 'gynecologie',
    drugs: [
      { drug_id: 'propofol', indication_tag: 'induction' },
      { drug_id: 'sufentanil', indication_tag: 'induction' },
      { drug_id: 'rocuronium', indication_tag: 'induction' },
      { drug_id: 'sevoflurane', indication_tag: 'maintenance' },
      { drug_id: 'paracetamol', indication_tag: 'analgesia' },
      { drug_id: 'morphine', indication_tag: 'analgesia' },
      { drug_id: 'ondansetron', indication_tag: 'ponv' },
      { drug_id: 'dexamethasone', indication_tag: 'ponv' },
      { drug_id: 'cefazoline', indication_tag: 'antibioprophylaxie' },
      { drug_id: 'enoxaparine', indication_tag: 'thromboprophylaxie' },
    ],
  },
];

export function getTemplateForSpecialty(specialty: string): DrugTemplate | undefined {
  return DRUG_TEMPLATES.find((t) => t.specialty === specialty);
}
