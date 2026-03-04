import type { Drug, DoseRule, Procedure, DrugRef } from '@/lib/types';

const EXTRA_DOSE_RULES: Record<string, DoseRule[]> = {
  // ── AGENTS D'INDUCTION ─────────────────────────────────────────────────
  propofol: [
    {
      indication_tag: 'induction',
      route: 'IVD',
      mg_per_kg: 2,
      max_mg: 200,
      notes: [
        'Adulte ASA I-II : 1.5–2.5 mg/kg IV lent (30 s)',
        'Sujet âgé / fragilisé : 1–1.5 mg/kg — titrer par bolus 20–40 mg',
        'Réduire de 20–30 % si prémédication opioïde associée',
      ],
    },
    {
      indication_tag: 'sédation',
      route: 'IVD',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Bolus sédation procédurale : 0.5–1 mg/kg IV, titré selon effet',
        'Entretien AIVOC : cible plasma 1–3 µg/mL',
      ],
      unit_override: 'mg (titration)',
    },
    {
      indication_tag: 'TIVA',
      route: 'AIVOC / IVSE',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'AIVOC mode effet : cible 2–4 µg/mL selon profondeur et opioïde',
        'IVSE : 4–8 mg/kg/h; ajuster sur index bispectral (BIS 40–60)',
      ],
      unit_override: 'µg/mL ou mg/kg/h',
    },
  ],

  etomidate: [
    {
      indication_tag: 'induction',
      route: 'IVD',
      mg_per_kg: 0.3,
      max_mg: 20,
      notes: [
        'Induction de choix chez le patient hémodynamiquement instable',
        'Inhibition transitoire cortisol (11β-hydroxylase) — usage unique recommandé',
        'Prévenir myoclonies : midazolam 1–2 mg IV avant ou fentanyl',
      ],
    },
  ],

  ketamine: [
    {
      indication_tag: 'induction',
      route: 'IVD',
      mg_per_kg: 1.5,
      max_mg: 150,
      notes: [
        'Anesthésie dissociative — maintien de la ventilation spontanée possible',
        'Associer midazolam 0.03 mg/kg pour réduire les phénomènes d\'émergence',
        'Indication privilégiée : choc hémorragique, état de mal asthmatique',
      ],
    },
    {
      indication_tag: 'sédation',
      route: 'IVD',
      mg_per_kg: 0.5,
      max_mg: 70,
      notes: [
        'Sédation procédurale : 0.5–1 mg/kg IV ; répétable 0.25 mg/kg si besoin',
        'Maintien IVSE anti-hyperalgésique : 0.1–0.3 mg/kg/h',
      ],
    },
    {
      indication_tag: 'co-analgésie',
      route: 'IVD/IVSE',
      mg_per_kg: 0.3,
      max_mg: 30,
      notes: [
        'Co-analgésie péri-opératoire : 0.15–0.5 mg/kg en bolus à l\'induction',
        'IVSE anti-hyperalgésique : 0.1–0.3 mg/kg/h peropératoire',
        'Réduit consommation morphiniques en chirurgie douloureuse (rachis, majeure)',
      ],
    },
  ],

  midazolam: [
    {
      indication_tag: 'prémédication',
      route: 'IV/PO',
      mg_per_kg: 0.025,
      max_mg: 2,
      notes: [
        'Prémédication IV : 0.02–0.04 mg/kg, max 2 mg; PO 7.5 mg adulte',
        'Sujet âgé / fragilisé : réduire de 50 % — risque hypotension',
        'Antagoniste flumazénil : 0.2 mg IV (max 1 mg)',
      ],
    },
    {
      indication_tag: 'sédation',
      route: 'IV titration',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Titration : 1–2 mg IV / 2 min ; max 5–7.5 mg habituellement',
        'Insuffisance respiratoire — surveiller SpO2 et fréquence respiratoire',
      ],
      unit_override: 'mg (titration)',
    },
  ],

  // ── CURARES ────────────────────────────────────────────────────────────
  rocuronium: [
    {
      indication_tag: 'intubation',
      route: 'IVD',
      mg_per_kg: 0.6,
      max_mg: null,
      notes: [
        'Intubation standard : 0.6 mg/kg IV — délai action 90–120 s',
        'Réversion sugammadex 2 mg/kg (TOF T2)',
      ],
    },
    {
      indication_tag: 'ISR',
      route: 'IVD',
      mg_per_kg: 1.2,
      max_mg: null,
      notes: [
        'ISR (induction à séquence rapide) : 1.2 mg/kg IV — délai 60 s',
        'Alternative succinylcholine si allergie ou CI',
        'Réversion urgente : sugammadex 16 mg/kg',
      ],
    },
    {
      indication_tag: 'curarisation_profonde',
      route: 'IVSE',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Bolus initial 0.6–1 mg/kg puis entretien 0.3–0.6 mg/kg/h IVSE',
        'Monitorage TOF obligatoire (PTC 0–1 pour curarisation profonde)',
      ],
      unit_override: 'mg/kg/h',
    },
  ],

  sugammadex: [
    {
      indication_tag: 'reversal',
      route: 'IVD',
      mg_per_kg: 2,
      max_mg: 200,
      notes: [
        'TOF ratio < 0.9 (T2 présent) : 2 mg/kg IV',
        'Bloc profond (PTC 1–2) : 4 mg/kg IV',
        'ISR immédiat (3 min après rocuronium 1.2 mg/kg) : 16 mg/kg',
      ],
    },
    {
      indication_tag: 'reversal_urgence',
      route: 'IVD',
      mg_per_kg: 16,
      max_mg: 1600,
      notes: [
        'Réversion immédiate après rocuronium 1.2 mg/kg : 16 mg/kg IV',
        'Uniquement si CICV (Cannot Intubate Cannot Ventilate)',
      ],
    },
  ],

  // ── HALOGÉNÉS ──────────────────────────────────────────────────────────
  sevoflurane: [
    {
      indication_tag: 'entretien',
      route: 'Inhalation',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Entretien AG : MAC 1.0–2.0 selon stimulation (MAC awake ~0.3)',
        'Réduire MAC de 30–40 % si remifentanil ou sufentanil IVSE associé',
        'MAC1 sévoflurane ≈ 2 % en O₂/air; ↑ âge → ↓ MAC',
      ],
      unit_override: 'MAC / %',
    },
  ],

  // ── OPIOÏDES ───────────────────────────────────────────────────────────
  sufentanil: [
    {
      indication_tag: 'induction',
      route: 'IVD',
      mg_per_kg: 0.0003,
      max_mg: 0.03,
      unit_override: 'µg',
      notes: [
        'Induction : 0.3–0.5 µg/kg IV avec propofol',
        'Réduire propofol de 20–30 % si sufentanil pré-administré',
      ],
    },
    {
      indication_tag: 'analgésie_perop',
      route: 'IVD',
      mg_per_kg: 0.0003,
      max_mg: 0.03,
      unit_override: 'µg',
      notes: [
        'Bolus peropératoire : 0.2–0.5 µg/kg IV selon stimulation chirurgicale',
        'Entretien IVSE : 0.1–0.3 µg/kg/h',
        'Puissance analgésique ≈ 10× morphine',
      ],
    },
    {
      indication_tag: 'analgésie_IT',
      route: 'IT',
      mg_per_kg: null,
      max_mg: null,
      unit_override: 'µg',
      notes: [
        'Rachianesthésie : adjuvant 2.5–5 µg IT (renforce et prolonge le bloc)',
        'Associer à bupivacaïne hyperbare 0.5 %',
      ],
    },
  ],

  fentanyl: [
    {
      indication_tag: 'induction',
      route: 'IVD',
      mg_per_kg: 0.002,
      max_mg: 0.2,
      unit_override: 'µg',
      notes: [
        'Induction : 1–3 µg/kg IV; délai efficacité 3–5 min',
        'Durée d\'action 30–60 min; titrer selon contexte clinique',
      ],
    },
    {
      indication_tag: 'analgésie_perop',
      route: 'IVD',
      mg_per_kg: 0.001,
      max_mg: 0.1,
      unit_override: 'µg',
      notes: [
        'Bolus peropératoire : 1–2 µg/kg IV selon stimulation',
        'Répétable toutes les 30–60 min selon réponse hémodynamique',
      ],
    },
  ],

  remifentanil: [
    {
      indication_tag: 'TIVA',
      route: 'AIVOC / IVSE',
      mg_per_kg: null,
      max_mg: null,
      unit_override: 'µg/kg/min',
      notes: [
        'AIVOC cible effet : 2–8 ng/mL selon intensité chirurgicale',
        'IVSE : 0.05–0.4 µg/kg/min; ajuster sur hémodynamique et BIS',
        'Action ultra-courte — prévoir relais morphinique à la fermeture +++',
      ],
    },
  ],

  morphine: [
    {
      indication_tag: 'analgésie_postop',
      route: 'IV titration',
      mg_per_kg: 0.1,
      max_mg: 10,
      notes: [
        'Titration SSPI : 2–3 mg IV / 5 min jusqu\'à EVA ≤ 3, max 10 mg',
        'Surveillance respiratoire — oxymétrie continue recommandée',
      ],
    },
    {
      indication_tag: 'analgésie_secours',
      route: 'IV/SC',
      mg_per_kg: 0.05,
      max_mg: 5,
      notes: [
        'Analgésie secours : 0.05–0.1 mg/kg IV ou SC',
        'Réévaluer EVA 15–30 min après injection',
      ],
    },
    {
      indication_tag: 'analgésie_IT',
      route: 'IT',
      mg_per_kg: null,
      max_mg: null,
      unit_override: 'µg',
      notes: [
        'Morphine IT : 80–150 µg (analgésie prolongée 12–24 h)',
        'Surveillance respiratoire impérative ≥ 24 h (apnées retardées)',
      ],
    },
  ],

  // ── ANALGÉSIQUES NON-OPIOÏDES ──────────────────────────────────────────
  paracetamol: [
    {
      indication_tag: 'analgésie',
      route: 'IV/PO',
      mg_per_kg: 15,
      max_mg: 1000,
      notes: [
        'Adulte ≥ 50 kg : 1 g IV/PO, max 4 g/24 h (toutes 6 h)',
        'Enfant : 15 mg/kg/dose, max 60 mg/kg/j',
        'Réduire à 7.5 mg/kg si insuffisance hépatique ou poids < 50 kg',
      ],
    },
  ],

  ketorolac: [
    {
      indication_tag: 'analgésie',
      route: 'IV',
      mg_per_kg: null,
      max_mg: 30,
      notes: [
        'Adulte < 65 ans, ≥ 50 kg : 30 mg IV lent; sujet âgé ou < 50 kg : 15 mg',
        'Durée max 5 jours; CI : IR, ulcère peptique, grossesse, allergie AINS',
        'Puissant anti-inflammatoire péri-opératoire — réduction opioïdes 30–50 %',
      ],
      unit_override: 'mg (15–30 mg)',
    },
  ],

  ibuprofene: [
    {
      indication_tag: 'analgésie',
      route: 'PO/IV',
      mg_per_kg: null,
      max_mg: 400,
      notes: [
        'Adulte : 400 mg PO toutes les 6–8 h, max 1.2 g/j (prescrit) ou 2.4 g/j (médical)',
        'IV : 400 mg perfusion 30 min toutes les 6 h',
        'CI : IR, ulcère, 3e trimestre grossesse, asthme à l\'aspirine',
      ],
      unit_override: 'mg (400 mg)',
    },
  ],

  lidocaine: [
    {
      indication_tag: 'adjuvant_bloc',
      route: 'Péri-nerveux',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Adjuvant bloc périphérique : 20–40 mg selon volume total',
        'Dose max ALR sans adrénaline : 3–4 mg/kg; avec adrénaline : 7 mg/kg',
      ],
      unit_override: 'mg',
    },
    {
      indication_tag: 'BIS_adjuvant',
      route: 'Péri-nerveux',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Bloc interscalénique : adjuvant 20–40 mg dans volume total',
        'Toujours sous guidage échographique; respecter dose cumulée',
      ],
      unit_override: 'mg',
    },
    {
      indication_tag: 'adjuvant_IV',
      route: 'IVD/IVSE',
      mg_per_kg: 1.5,
      max_mg: 100,
      notes: [
        'Bolus IV à l\'induction : 1.5 mg/kg sur 10 min',
        'Entretien IVSE : 1–2 mg/kg/h péri-opératoire',
        'Effet anti-hyperalgésique, anti-inflammatoire et épargne morphinique',
      ],
    },
  ],

  // ── ANTIÉMÉTIQUES ──────────────────────────────────────────────────────
  ondansetron: [
    {
      indication_tag: 'PONV',
      route: 'IV',
      mg_per_kg: null,
      max_mg: 4,
      notes: [
        'Prophylaxie NVPO : 4 mg IV lent en fin d\'intervention',
        'Traitement NVPO établi : 4–8 mg IV (ne pas répéter avant 6 h)',
        'Allonge QT — vérifier ECG si facteurs de risque arythmie',
      ],
      unit_override: 'mg (4 mg)',
    },
  ],

  dexamethasone: [
    {
      indication_tag: 'PONV',
      route: 'IV',
      mg_per_kg: 0.1,
      max_mg: 8,
      notes: [
        'Prophylaxie NVPO : 4–8 mg IV à l\'induction (effet durée 24–48 h)',
        'Association ondansétron recommandée si Apfel ≥ 2',
      ],
    },
    {
      indication_tag: 'PONV_anti-oedème',
      route: 'IV',
      mg_per_kg: 0.1,
      max_mg: 8,
      notes: [
        'Double effet : prophylaxie NVPO + anti-inflammatoire/anti-œdème',
        '4–8 mg IV à l\'induction; particulièrement utile en chirurgie ORL/rachis',
      ],
    },
    {
      indication_tag: 'anti-oedème',
      route: 'IV',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Anti-œdème inflammatoire : 4–10 mg IV selon indication et intensité',
      ],
      unit_override: 'mg (4–10 mg)',
    },
    {
      indication_tag: 'anti-oedème_laryngé',
      route: 'IV',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Œdème laryngé post-extubation : 8–10 mg IV',
        'Peut être répétée selon évolution clinique et stridor',
      ],
      unit_override: 'mg (8–10 mg)',
    },
  ],

  // ── VASOPRESSEURS ──────────────────────────────────────────────────────
  ephedrine: [
    {
      indication_tag: 'hypotension',
      route: 'IVD',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Hypotension péri-rachianesthésie : bolus 6–12 mg IV; répétable / 5 min',
        'Dose max habituelle 30–50 mg/h; tachycardie réflexe possible',
        'Effet mixte α+β — 1er choix ou association à la phényléphrine en obstétrique',
      ],
      unit_override: 'mg (6–12 mg/bolus)',
    },
  ],

  phenylephrine: [
    {
      indication_tag: 'hypotension',
      route: 'IVD',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Bolus : 100–200 µg IV; IVSE : 25–100 µg/min titrée sur PAM',
        'Vasopresseur de 1er choix hypotension-rachianesthésie obstétricale',
        'Pur vasoconstricteur α₁ — bradycardie réflexe possible (préférer éphedrine si FC < 65)',
      ],
      unit_override: 'µg (100–200 µg/bolus)',
    },
  ],

  noradrenaline: [
    {
      indication_tag: 'choc_vasoplégique',
      route: 'IVSE',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Démarrer : 0.01–0.05 µg/kg/min IVSE; titrer sur PAM cible > 65 mmHg',
        'Plage habituelle : 0.1–2 µg/kg/min selon résistances vasculaires',
        'Voie centrale recommandée; surveiller hypoperfusion distale',
      ],
      unit_override: 'µg/kg/min',
    },
  ],

  // ── ALR ────────────────────────────────────────────────────────────────
  bupivacaine: [
    {
      indication_tag: 'rachianesthésie',
      route: 'IT',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Rachianesthésie : bupivacaïne hyperbare 0.5% — 8–15 mg IT (1.6–3 mL)',
        'Niveau cible T10 (ortho membres inf.) ou T4–T6 (abdomen, césarienne)',
        'Associer sufentanil 2.5–5 µg IT pour renforcer l\'analgésie',
      ],
      unit_override: 'mg IT (8–15 mg)',
    },
    {
      indication_tag: 'BIS',
      route: 'Péri-nerveux',
      mg_per_kg: 2,
      max_mg: 150,
      notes: [
        'Bloc interscalénique : 15–20 mL bupivacaïne 0.5 % sous échoguidage',
        'Dose max sans adrénaline : 2 mg/kg (max 150 mg)',
        'Risque pneumothorax ipsilatéral — surveillance post-bloc 30 min',
      ],
    },
    {
      indication_tag: 'bloc_axillaire',
      route: 'Péri-nerveux',
      mg_per_kg: 2,
      max_mg: 150,
      notes: [
        'Bloc axillaire : 20–30 mL selon territoire cible, sous échoguidage',
        'Dose max bupivacaïne : 2 mg/kg (150 mg)',
      ],
    },
    {
      indication_tag: 'bloc_PECS',
      route: 'Péri-nerveux',
      mg_per_kg: 2,
      max_mg: 150,
      notes: [
        'PECS I + II : volume total 20–30 mL, sous échoguidage',
        'Ajuster dose totale si bloc bilatéral (max 2 mg/kg)',
      ],
    },
  ],

  // ── PROPHYLAXIE ────────────────────────────────────────────────────────
  cefazoline: [
    {
      indication_tag: 'antibioprophylaxie',
      route: 'IV',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Adulte ≤ 120 kg : 2 g IV en 3–5 min, 30–60 min avant incision',
        'Adulte > 120 kg : 3 g IV',
        'Répéter 2 g si durée chirurgie > 4 h ou pertes sanguines > 1.5 L',
        'Allergie pénicilline : clindamycine 600 mg IV + gentamicine 5 mg/kg',
      ],
      unit_override: 'g (2–3 g)',
    },
  ],

  acide_tranexamique: [
    {
      indication_tag: 'antifibrinolytique',
      route: 'IV',
      mg_per_kg: 15,
      max_mg: 1000,
      notes: [
        '15 mg/kg IV sur 10–15 min (ou 1 g adulte standard)',
        'Réduit pertes sanguines et transfusions de 30–40 % (orthopédie, cardio)',
        'CI absolue : ATCD thromboembolique récent, CI relative : convulsions',
      ],
    },
  ],

  enoxaparine: [
    {
      indication_tag: 'thromboprophylaxie',
      route: 'SC',
      mg_per_kg: null,
      max_mg: null,
      notes: [
        'Risque modéré : 20 mg SC 1×/j (Lovenox® 0.2 mL)',
        'Risque élevé / orthopédie majeure : 40 mg SC 1×/j (Lovenox® 0.4 mL)',
        'Débuter 6–12 h après chirurgie; adapter si IR sévère (DFG < 30)',
      ],
      unit_override: 'mg SC (20–40 mg/j)',
    },
  ],

  // ── ANTICHOLINERGIQUES ─────────────────────────────────────────────────
  atropine: [
    {
      indication_tag: 'bradycardie',
      route: 'IVD',
      mg_per_kg: 0.02,
      max_mg: 0.5,
      notes: [
        'Bradycardie sinusale symptomatique : 0.5–1 mg IV direct',
        'Dose min adulte : 0.5 mg (bradycardie paradoxale en deçà)',
        'Répétable toutes les 3–5 min; dose atropinisation totale : 3 mg',
      ],
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
  'etomidate',
  'ketamine',
]);

const PROCEDURE_MED_PLAN: Record<string, DrugRef[]> = {
  pth: [
    { drug_id: 'propofol', indication_tag: 'induction' },
    { drug_id: 'rocuronium', indication_tag: 'intubation' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
    { drug_id: 'dexamethasone', indication_tag: 'PONV' },
    { drug_id: 'ephedrine', indication_tag: 'hypotension' },
  ],
  turp: [
    { drug_id: 'propofol', indication_tag: 'induction' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'dexamethasone', indication_tag: 'PONV' },
    { drug_id: 'cefazoline', indication_tag: 'antibioprophylaxie' },
  ],
  ureteroscopie_dj: [
    { drug_id: 'rocuronium', indication_tag: 'intubation' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
    { drug_id: 'ondansetron', indication_tag: 'PONV' },
    { drug_id: 'dexamethasone', indication_tag: 'PONV' },
  ],
  cesarienne_urgente: [
    { drug_id: 'phenylephrine', indication_tag: 'hypotension' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'ephedrine', indication_tag: 'hypotension' },
  ],
  cholecystectomie_lap: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
    { drug_id: 'cefazoline', indication_tag: 'antibioprophylaxie' },
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
    { drug_id: 'ondansetron', indication_tag: 'PONV' },
    { drug_id: 'cefazoline', indication_tag: 'antibioprophylaxie' },
  ],
  arthroscopie_epaule: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
    { drug_id: 'ondansetron', indication_tag: 'PONV' },
    { drug_id: 'dexamethasone', indication_tag: 'PONV_anti-oedème' },
    { drug_id: 'cefazoline', indication_tag: 'antibioprophylaxie' },
  ],
  hysteroscopie_ambulatoire: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
    { drug_id: 'dexamethasone', indication_tag: 'PONV' },
    { drug_id: 'ketorolac', indication_tag: 'analgésie' },
  ],
  amygdalectomie_enfant: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
    { drug_id: 'cefazoline', indication_tag: 'antibioprophylaxie' },
  ],
  arthroscopie_genou: [
    { drug_id: 'propofol', indication_tag: 'induction' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'rocuronium', indication_tag: 'intubation' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
    { drug_id: 'dexamethasone', indication_tag: 'PONV' },
  ],
  ptg: [
    { drug_id: 'propofol', indication_tag: 'induction' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'ondansetron', indication_tag: 'PONV' },
    { drug_id: 'dexamethasone', indication_tag: 'PONV' },
    { drug_id: 'ephedrine', indication_tag: 'hypotension' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
  ],
  fracture_radius: [
    { drug_id: 'propofol', indication_tag: 'sédation' },
    { drug_id: 'ondansetron', indication_tag: 'PONV' },
  ],
  osteosynthese_cheville: [
    { drug_id: 'propofol', indication_tag: 'induction' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'rocuronium', indication_tag: 'intubation' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
    { drug_id: 'ondansetron', indication_tag: 'PONV' },
    { drug_id: 'dexamethasone', indication_tag: 'PONV' },
  ],
  laminectomie_lombaire: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
    { drug_id: 'ondansetron', indication_tag: 'PONV' },
    { drug_id: 'dexamethasone', indication_tag: 'PONV_anti-oedème' },
  ],
  arthrodese_cervicale: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
    { drug_id: 'ondansetron', indication_tag: 'PONV' },
  ],
  rtu_bexiga: [
    { drug_id: 'propofol', indication_tag: 'induction' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'rocuronium', indication_tag: 'intubation' },
    { drug_id: 'ondansetron', indication_tag: 'PONV' },
    { drug_id: 'dexamethasone', indication_tag: 'PONV' },
    { drug_id: 'cefazoline', indication_tag: 'antibioprophylaxie' },
  ],
  nephrostomie_dj: [
    { drug_id: 'propofol', indication_tag: 'sédation' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'ondansetron', indication_tag: 'PONV' },
  ],
  cesarienne_elective: [
    { drug_id: 'phenylephrine', indication_tag: 'hypotension' },
    { drug_id: 'propofol', indication_tag: 'induction' },
    { drug_id: 'rocuronium', indication_tag: 'ISR' },
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'ephedrine', indication_tag: 'hypotension' },
  ],
  conisation_leep: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
    { drug_id: 'ketorolac', indication_tag: 'analgésie' },
    { drug_id: 'dexamethasone', indication_tag: 'PONV' },
  ],
  hernie_inguinale: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
    { drug_id: 'ondansetron', indication_tag: 'PONV' },
    { drug_id: 'dexamethasone', indication_tag: 'PONV' },
    { drug_id: 'cefazoline', indication_tag: 'antibioprophylaxie' },
  ],
  thyroidectomie: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
    { drug_id: 'ondansetron', indication_tag: 'PONV' },
    { drug_id: 'cefazoline', indication_tag: 'antibioprophylaxie' },
    { drug_id: 'ketorolac', indication_tag: 'analgésie' },
  ],
  mastectomie: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
    { drug_id: 'cefazoline', indication_tag: 'antibioprophylaxie' },
  ],
  septoplastie: [
    { drug_id: 'sevoflurane', indication_tag: 'entretien' },
    { drug_id: 'sufentanil', indication_tag: 'analgésie_perop' },
    { drug_id: 'dexamethasone', indication_tag: 'PONV_anti-oedème' },
    { drug_id: 'ketorolac', indication_tag: 'analgésie' },
    { drug_id: 'cefazoline', indication_tag: 'antibioprophylaxie' },
  ],
  microlaryngoscopie: [
    { drug_id: 'propofol', indication_tag: 'TIVA' },
    { drug_id: 'remifentanil', indication_tag: 'TIVA' },
    { drug_id: 'ondansetron', indication_tag: 'PONV' },
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
