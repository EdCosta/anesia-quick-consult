import type { Drug, DoseRule, Procedure, DrugRef } from '@/lib/types';

const EXTRA_DOSE_RULES: Record<string, DoseRule[]> = {
  propofol: [
    {
      indication_tag: 'sédation',
      route: 'IVD',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Sédation IVD : bolus 0.5-1 mg/kg, titrer selon effet',
        'Entretien possible en AIVOC 1.5-3 ug/mL',
      ],
      unit_override: 'IVD / AIVOC',
    },
    {
      indication_tag: 'TIVA',
      route: 'AIVOC / IVSE',
      mg_per_kg: null,
      max_mg: null,
      notes: ['AIVOC : cible 2-4 ug/mL', 'IVSE : 4-8 mg/kg/h selon profondeur anesthésique'],
      unit_override: 'ug/mL ou mg/kg/h',
    },
  ],
  dexamethasone: [
    {
      indication_tag: 'anti-oedème',
      route: 'IV',
      mg_per_kg: null,
      max_mg: null,
      notes: ['Dose usuelle adulte : 4-10 mg IV selon indication'],
      unit_override: 'mg',
    },
    {
      indication_tag: 'anti-oedème_laryngé',
      route: 'IV',
      mg_per_kg: null,
      max_mg: null,
      notes: ['Dose usuelle : 8-10 mg IV', 'Peut etre repetee selon evolution clinique'],
      unit_override: 'mg',
    },
  ],
  bupivacaine: [
    {
      indication_tag: 'bloc_axillaire',
      route: 'Peri-nerveux',
      mg_per_kg: 2,
      max_mg: 150,
      notes: ['Volume usuel : 20-30 mL', 'Ajuster selon echoguidage et territoire cible'],
    },
    {
      indication_tag: 'bloc_PECS',
      route: 'Peri-nerveux',
      mg_per_kg: 2,
      max_mg: 150,
      notes: ['Volume usuel : 20-30 mL (PECS I + II)', 'Ajuster dose totale en bilateral'],
    },
  ],
  lidocaine: [
    {
      indication_tag: 'adjuvant_bloc',
      route: 'Peri-nerveux',
      mg_per_kg: null,
      max_mg: null,
      notes: ['Adjuvant bloc : 20-40 mg selon technique', 'Respecter dose cumulée maximale'],
      unit_override: 'mg',
    },
  ],
  morphine: [
    {
      indication_tag: 'analgésie_IT',
      route: 'IT',
      mg_per_kg: null,
      max_mg: null,
      notes: ['Dose usuelle : 80-120 ug IT', 'Surveillance respiratoire prolongee'],
      unit_override: 'ug',
    },
  ],
  rocuronium: [
    {
      indication_tag: 'curarisation_profonde',
      route: 'IVSE',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Bolus initial 0.6-1 mg/kg puis entretien 0.3-0.6 mg/kg/h',
        'Monitorage TOF/PTC recommande',
      ],
      unit_override: 'mg/kg/h',
    },
  ],
};

const GA_DRUG_IDS = new Set([
  'propofol',
  'rocuronium',
  'sufentanil',
  'fentanyl',
  'remifentanil',
  'sevoflurane',
]);

const PROCEDURE_MED_PLAN: Record<string, DrugRef[]> = {
  pth: [
    { drug_id: 'propofol', indication_tag: 'induction' },
    { drug_id: 'rocuronium', indication_tag: 'intubation' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
  ],
  turp: [
    { drug_id: 'propofol', indication_tag: 'induction' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
  ],
  ureteroscopie_dj: [
    { drug_id: 'rocuronium', indication_tag: 'intubation' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
  ],
  cesarienne_urgente: [
    { drug_id: 'phenylephrine', indication_tag: 'hypotension' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
  ],
  cholecystectomie_lap: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
  ],
  appendicectomie_urgente: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
  ],
  hernie_discale_lombaire: [
    { drug_id: 'propofol', indication_tag: 'induction' },
    { drug_id: 'rocuronium', indication_tag: 'intubation' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
  ],
  arthroscopie_epaule: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
  ],
  hysteroscopie_ambulatoire: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
  ],
  amygdalectomie_enfant: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
  ],
  arthroscopie_genou: [
    { drug_id: 'propofol', indication_tag: 'induction' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'rocuronium', indication_tag: 'intubation' },
  ],
  ptg: [
    { drug_id: 'propofol', indication_tag: 'induction' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
  ],
  fracture_radius: [{ drug_id: 'propofol', indication_tag: 'sédation' }],
  osteosynthese_cheville: [
    { drug_id: 'propofol', indication_tag: 'induction' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
  ],
  laminectomie_lombaire: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
  ],
  arthrodese_cervicale: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
  ],
  rtu_bexiga: [
    { drug_id: 'propofol', indication_tag: 'induction' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'rocuronium', indication_tag: 'intubation' },
  ],
  nephrostomie_dj: [
    { drug_id: 'propofol', indication_tag: 'sédation' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
  ],
  cesarienne_elective: [
    { drug_id: 'phenylephrine', indication_tag: 'hypotension' },
    { drug_id: 'propofol', indication_tag: 'induction' },
    { drug_id: 'rocuronium', indication_tag: 'ISR' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
  ],
  conisation_leep: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
  ],
  hernie_inguinale: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
  ],
  thyroidectomie: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
  ],
  mastectomie: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
  ],
  septoplastie: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
  ],
  microlaryngoscopie: [
    { drug_id: 'propofol', indication_tag: 'TIVA' },
    { drug_id: 'remifentanil', indication_tag: 'TIVA' },
  ],
};

function dedupeRefs(refs: DrugRef[]): DrugRef[] {
  const seen = new Set<string>();
  const out: DrugRef[] = [];
  for (const ref of refs) {
    const key = `${ref.drug_id}:${ref.indication_tag}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ref);
  }
  return out;
}

function hasGeneralAnesthesiaProfile(proc: Procedure): boolean {
  const quickFr = proc.quick?.fr;
  if (!quickFr) return false;
  const text = quickFr.intraop.join(' ').toLowerCase();
  const textualMarker =
    /(anesthesie generale|ag\b|iotr|iot\b|intubation|masque larynge|isr|tiva)/i.test(
      text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    );
  const drugMarker = quickFr.drugs.some((d) => GA_DRUG_IDS.has(d.drug_id));
  return textualMarker || drugMarker;
}

function hasTivaProfile(proc: Procedure): boolean {
  const quickFr = proc.quick?.fr;
  if (!quickFr) return false;
  const text = quickFr.intraop.join(' ').toLowerCase();
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return (
    normalized.includes('tiva') ||
    quickFr.drugs.some((d) => d.indication_tag.toLowerCase() === 'tiva')
  );
}

function addDefaultMedicationPhases(proc: Procedure): Procedure {
  if (!hasGeneralAnesthesiaProfile(proc)) return proc;

  const nextQuick = { ...proc.quick };
  for (const [lang, quick] of Object.entries(nextQuick)) {
    const refs = [...quick.drugs];
    const hasMaintenance = refs.some((r) => r.indication_tag.toLowerCase() === 'entretien');
    if (!hasMaintenance) refs.push({ drug_id: 'sevoflurane', indication_tag: 'entretien' });

    if (hasTivaProfile(proc)) {
      const hasTiva = refs.some((r) => r.drug_id === 'propofol' && r.indication_tag === 'TIVA');
      if (!hasTiva) refs.push({ drug_id: 'propofol', indication_tag: 'TIVA' });
    }

    (nextQuick as any)[lang] = { ...quick, drugs: dedupeRefs(refs) };
  }

  return { ...proc, quick: nextQuick };
}

function addProcedureMedicationPlan(proc: Procedure): Procedure {
  const additions = PROCEDURE_MED_PLAN[proc.id];
  if (!additions || additions.length === 0) return proc;

  const nextQuick = { ...proc.quick };
  for (const [lang, quick] of Object.entries(nextQuick)) {
    const refs = dedupeRefs([...quick.drugs, ...additions]);
    (nextQuick as any)[lang] = { ...quick, drugs: refs };
  }

  return { ...proc, quick: nextQuick };
}

export function enrichMedicationPlan(data: { procedures: Procedure[]; drugs: Drug[] }) {
  const drugs = data.drugs.map((drug) => {
    const extras = EXTRA_DOSE_RULES[drug.id] ?? [];
    if (extras.length === 0) return drug;
    const tags = new Set(drug.dose_rules.map((rule) => rule.indication_tag));
    const mergedRules = [
      ...drug.dose_rules,
      ...extras.filter((rule) => !tags.has(rule.indication_tag)),
    ];
    return { ...drug, dose_rules: mergedRules };
  });

  const procedures = data.procedures
    .map(addDefaultMedicationPhases)
    .map(addProcedureMedicationPlan);

  return { procedures, drugs };
}
