export interface PreAnestInput {
  age: number;
  sex: 'M' | 'F';
  weight: number;
  height: number;
  asa: 1 | 2 | 3 | 4 | 5;
  comorbidities: string[];
  otherComorbidities: string;
  mallampati: 1 | 2 | 3 | 4;
  mouthOpening: 'normal' | 'limited';
  cervicalMobility: 'normal' | 'limited';
  anticoagulation: string;
  allergies: string;
  procedureId?: string;
  specialty?: string;
  surgeryType?: string;
  context: 'ambulatory' | 'inpatient' | 'emergency';
}

export interface PreAnestOutput {
  preop: string[];
  intraop: string[];
  postop: string[];
  redFlags: string[];
}

export function generateRecommendations(
  input: PreAnestInput,
  lang: 'fr' | 'pt' | 'en' = 'fr',
): PreAnestOutput {
  const preop: string[] = [];
  const intraop: string[] = [];
  const postop: string[] = [];
  const redFlags: string[] = [];
  const l = (fr: string, pt: string, en: string) => (lang === 'pt' ? pt : lang === 'en' ? en : fr);

  const bmi = input.weight / (input.height / 100) ** 2;
  const isObese = bmi > 35 || input.comorbidities.includes('obesity');
  const hasSAOS = input.comorbidities.includes('saos');
  const hasHTA = input.comorbidities.includes('hta');
  const hasDiabetes = input.comorbidities.includes('diabetes');
  const hasCardiopathy = input.comorbidities.includes('cardiopathy');
  const hasRenalFailure = input.comorbidities.includes('renal');
  const hasLiverDisease = input.comorbidities.includes('liver');
  const hasRespiratory = input.comorbidities.includes('respiratory');
  const isEmergency = input.context === 'emergency';
  const isAmbulatory = input.context === 'ambulatory';
  const isElderly = input.age >= 65;

  // === PRE-OP ===
  preop.push(
    l(
      'Bilan standard: NFS, ionogramme, créatinine, coagulation',
      'Estudo base: hemograma, ionograma, creatinina, coagulacao',
      'Standard workup: CBC, electrolytes, creatinine, coagulation',
    ),
  );
  if (input.asa >= 3) {
    preop.push(
      l(
        'ASA ≥ 3: évaluation approfondie, considérer consultation spécialisée',
        'ASA ≥ 3: avaliacao aprofundada, considerar consulta especializada',
        'ASA ≥ 3: deeper evaluation, consider specialist consultation',
      ),
    );
    preop.push(
      l(
        'ECG et évaluation capacité fonctionnelle',
        'ECG e avaliacao da capacidade funcional',
        'ECG and functional capacity assessment',
      ),
    );
  }
  if (hasCardiopathy || isElderly) {
    preop.push(
      l(
        'Bilan cardiaque: ECG, écho si symptômes, capacité fonctionnelle < 4 METs',
        'Estudo cardiaco: ECG, eco se houver sintomas, capacidade funcional < 4 METs',
        'Cardiac workup: ECG, echo if symptomatic, functional capacity < 4 METs',
      ),
    );
  }
  if (hasRenalFailure) {
    preop.push(
      l(
        'Bilan rénal: créatinine, DFG, ionogramme, adapter posologies',
        'Estudo renal: creatinina, TFG, ionograma, ajustar doses',
        'Renal workup: creatinine, GFR, electrolytes, adjust dosing',
      ),
    );
  }
  if (hasDiabetes) {
    preop.push(
      l(
        'Glycémie à jeun, HbA1c si non récente, protocole insuline péri-opératoire',
        'Glicemia em jejum, HbA1c se nao recente, protocolo de insulina perioperatorio',
        'Fasting glucose, HbA1c if not recent, perioperative insulin protocol',
      ),
    );
  }
  if (hasRespiratory) {
    preop.push(
      l(
        'EFR si non récentes, optimiser traitement bronchodilatateur',
        'Provas respiratorias se nao recentes, otimizar broncodilatacao',
        'Pulmonary function tests if not recent, optimize bronchodilator treatment',
      ),
    );
  }
  if (input.anticoagulation !== 'none' && input.anticoagulation) {
    const anticoagMap: Record<string, string> = {
      aspirin: l(
        'Aspirine: maintenir en général, sauf neurochirurgie',
        'Aspirina: manter em geral, exceto neurocirurgia',
        'Aspirin: generally continue, except in neurosurgery',
      ),
      clopidogrel: l(
        'Clopidogrel: arrêt 5-7 jours avant si possible',
        'Clopidogrel: suspender 5-7 dias antes se possivel',
        'Clopidogrel: stop 5-7 days before if possible',
      ),
      doac: l(
        'AOD: arrêt 48-72h avant (selon DFG et molécule)',
        'DOAC: suspender 48-72h antes (segundo TFG e molecula)',
        'DOAC: stop 48-72h before (depending on GFR and drug)',
      ),
      avk: l(
        'AVK: relais HBPM, INR cible < 1.5 le jour de la chirurgie',
        'AVK: ponte com HBPM, INR alvo < 1.5 no dia da cirurgia',
        'VKA: bridge with LMWH, target INR < 1.5 on surgery day',
      ),
      lmwh: l(
        'HBPM: dernière dose 12-24h avant selon dose curative/préventive',
        'HBPM: ultima dose 12-24h antes conforme dose terapeutica/profilatica',
        'LMWH: last dose 12-24h before depending on therapeutic/preventive dose',
      ),
      dual_antiplatelet: l(
        'Double anti-agrégation: discussion multidisciplinaire obligatoire',
        'Dupla antiagregacao: discussao multidisciplinar obrigatoria',
        'Dual antiplatelet therapy: mandatory multidisciplinary discussion',
      ),
    };
    if (anticoagMap[input.anticoagulation]) {
      preop.push(anticoagMap[input.anticoagulation]);
    }
  }
  if (isEmergency) {
    preop.push(
      l(
        'URGENCE: estomac plein présumé → ISR obligatoire',
        'URGENCIA: assumir estomago cheio -> RSI obrigatoria',
        'EMERGENCY: presume full stomach -> RSI required',
      ),
    );
    preop.push(
      l(
        'Préoxygénation 3 min O2 pur ou 8 respirations capacité vitale',
        'Pre-oxigenacao 3 min com O2 puro ou 8 respiracoes de capacidade vital',
        'Preoxygenation 3 min with pure O2 or 8 vital-capacity breaths',
      ),
    );
  } else {
    preop.push(l('Jeûne: 6h solides, 2h liquides clairs', 'Jejum: 6h solidos, 2h liquidos claros', 'Fasting: 6h solids, 2h clear fluids'));
  }
  if (input.allergies.trim()) {
    preop.push(
      l(
        `Allergies déclarées: ${input.allergies} — vérifier alternatives`,
        `Alergias declaradas: ${input.allergies} - verificar alternativas`,
        `Reported allergies: ${input.allergies} - verify alternatives`,
      ),
    );
  }

  // === INTRA-OP ===
  // Airway
  const vad =
    input.mallampati >= 3 ||
    input.mouthOpening === 'limited' ||
    input.cervicalMobility === 'limited' ||
    isObese;
  if (vad) {
    intraop.push(
      l(
        'VAD probable: préparer vidéo-laryngoscope, masque laryngé, algorithme CICO',
        'VAD provavel: preparar videolaringoscopio, mascara laringea e algoritmo CICO',
        'Predicted difficult airway: prepare videolaryngoscope, supraglottic airway, and CICO algorithm',
      ),
    );
  }
  if (isObese) {
    intraop.push(
      l(
        'Obésité: positionnement rampe/HELP, doses sur poids idéal (propofol: poids ajusté)',
        'Obesidade: posicionamento em rampa/HELP, doses por peso ideal (propofol: peso ajustado)',
        'Obesity: ramp/HELP positioning, dose by ideal weight (propofol: adjusted weight)',
      ),
    );
    intraop.push(
      l(
        'Considérer IOT cuffée de taille adaptée, pression de cuff < 25 cmH2O',
        'Considerar TOT cuffado do tamanho adequado, pressao do cuff < 25 cmH2O',
        'Consider appropriately sized cuffed tube, cuff pressure < 25 cmH2O',
      ),
    );
  }
  if (hasSAOS) {
    intraop.push(
      l(
        'SAOS: risque VAD augmenté, tube armé à considérer',
        'SAOS: risco aumentado de VAD, considerar tubo armado',
        'OSA: increased difficult airway risk, consider reinforced tube',
      ),
    );
    intraop.push(
      l(
        'Limiter opioïdes, favoriser analgésie multimodale et ALR',
        'Limitar opioides, favorecer analgesia multimodal e ALR',
        'Limit opioids, favor multimodal analgesia and regional anesthesia',
      ),
    );
  }
  if (isEmergency) {
    intraop.push(
      l(
        'ISR: propofol 2 mg/kg + rocuronium 1.2 mg/kg (sugammadex 16 mg/kg prêt)',
        'RSI: propofol 2 mg/kg + rocuronio 1.2 mg/kg (sugamadex 16 mg/kg pronto)',
        'RSI: propofol 2 mg/kg + rocuronium 1.2 mg/kg (sugammadex 16 mg/kg ready)',
      ),
    );
  }
  intraop.push(
    l(
      'Antibioprophylaxie: céfazoline 2g IV avant incision (adapter si allergie)',
      'Antibioprofilaxia: cefazolina 2g IV antes da incisao (adaptar se alergia)',
      'Antibiotic prophylaxis: cefazolin 2g IV before incision (adapt if allergy)',
    ),
  );
  intraop.push(
    l(
      'Maintien normothermie active (objectif ≥ 36°C)',
      'Manter normotermia ativa (objetivo >= 36C)',
      'Maintain active normothermia (target >= 36C)',
    ),
  );
  intraop.push(
    l(
      'Monitorage standard: ECG, SpO2, ETCO2, PA, température',
      'Monitorizacao standard: ECG, SpO2, ETCO2, PA, temperatura',
      'Standard monitoring: ECG, SpO2, ETCO2, BP, temperature',
    ),
  );
  if (input.asa >= 3 || hasCardiopathy) {
    intraop.push(
      l(
        'Considérer monitorage invasif (PA invasive) si chirurgie majeure',
        'Considerar monitorizacao invasiva (PA invasiva) em cirurgia major',
        'Consider invasive monitoring (arterial line) for major surgery',
      ),
    );
  }

  // === POST-OP ===
  postop.push(
    l(
      'Analgésie multimodale: paracétamol 1g/6h ± AINS (si pas de CI)',
      'Analgesia multimodal: paracetamol 1g/6h ± AINEs (se nao houver CI)',
      'Multimodal analgesia: paracetamol 1g/6h ± NSAIDs (if no contraindication)',
    ),
  );
  if (hasSAOS || isObese) {
    postop.push(
      l(
        'SAOS/Obésité: surveillance SSPI prolongée, oxymétrie continue, position semi-assise',
        'SAOS/Obesidade: vigilancia prolongada em recobro, oximetria continua, posicao semi-sentada',
        'OSA/Obesity: prolonged PACU monitoring, continuous oximetry, semi-upright position',
      ),
    );
    postop.push(
      l(
        'Éviter/limiter morphine, privilégier kétamine sub-anesthésique et ALR',
        'Evitar/limitar morfina, privilegiar cetamina subanestesica e ALR',
        'Avoid/limit morphine, prefer subanesthetic ketamine and regional anesthesia',
      ),
    );
  }
  postop.push(
    l(
      "Prévention NVPO: score d'Apfel, ondansétron ± dexaméthasone selon risque",
      'Prevencao NVPO: score de Apfel, ondansetron ± dexametasona conforme risco',
      'PONV prevention: Apfel score, ondansetron ± dexamethasone according to risk',
    ),
  );
  postop.push(
    l(
      'Thromboprophylaxie: HBPM dose préventive dès H6 (sauf CI hémorragique)',
      'Tromboprofilaxia: HBPM em dose profilatica desde H6 (salvo CI hemorragica)',
      'Thromboprophylaxis: prophylactic LMWH from H6 onward (unless bleeding contraindication)',
    ),
  );
  if (isAmbulatory) {
    postop.push(
      l(
        'Critères de sortie ambulatoire: EVA < 4, pas de NVPO, miction, déambulation stable',
        'Criterios de alta ambulatoria: EVA < 4, sem NVPO, miccao, marcha estavel',
        'Ambulatory discharge criteria: pain < 4, no PONV, urination, stable ambulation',
      ),
    );
    postop.push(
      l(
        'Consignes écrites: quand consulter en urgence, analgésie domicile',
        'Instrucoes escritas: quando recorrer a urgencia, analgesia no domicilio',
        'Written instructions: when to seek urgent care, home analgesia plan',
      ),
    );
  }
  if (isElderly) {
    postop.push(
      l(
        'Patient âgé: dépistage confusion postop, mobilisation précoce',
        'Doente idoso: rastrear confusao pos-op, mobilizacao precoce',
        'Older patient: screen for postoperative confusion, early mobilization',
      ),
    );
  }
  if (hasRenalFailure) {
    postop.push(
      l(
        'IRC: adapter posologies analgésiques, éviter AINS, surveiller diurèse',
        'IRC: ajustar doses analgesicas, evitar AINEs, vigiar diurese',
        'CKD: adjust analgesic dosing, avoid NSAIDs, monitor urine output',
      ),
    );
  }

  // === RED FLAGS ===
  if (vad) {
    redFlags.push(
      l(
        "VAD identifiée: algorithme can't intubate can't ventilate → cricothyroïdotomie",
        'VAD identificada: algoritmo cannot intubate cannot ventilate -> cricotirotomia',
        "Difficult airway identified: can't intubate can't ventilate algorithm -> cricothyrotomy",
      ),
    );
  }
  if (input.asa >= 4) {
    redFlags.push(
      l(
        'ASA IV-V: risque vital élevé, réanimation en stand-by',
        'ASA IV-V: risco vital elevado, equipa de reanimacao de sobreaviso',
        'ASA IV-V: high life-threatening risk, ICU/resuscitation support on standby',
      ),
    );
  }
  if (isEmergency) {
    redFlags.push(
      l(
        "Urgence + estomac plein: risque majeur d'inhalation bronchique",
        'Urgencia + estomago cheio: risco major de aspiracao',
        'Emergency + full stomach: major aspiration risk',
      ),
    );
  }
  if (hasSAOS && isObese) {
    redFlags.push(
      l(
        'SAOS + Obésité: risque combiné VAD + dépression respiratoire postop',
        'SAOS + obesidade: risco combinado de VAD + depressao respiratoria pos-op',
        'OSA + obesity: combined risk of difficult airway and postoperative respiratory depression',
      ),
    );
  }
  if (input.anticoagulation === 'dual_antiplatelet') {
    redFlags.push(
      l(
        'Double anti-agrégation: risque hémorragique majeur, discuter report si possible',
        'Dupla antiagregacao: risco hemorragico major, discutir adiamento se possivel',
        'Dual antiplatelet therapy: major bleeding risk, discuss delay if possible',
      ),
    );
  }
  if (hasCardiopathy) {
    redFlags.push(
      l(
        "Cardiopathie: risque d'événement cardiaque péri-opératoire, monitorer troponine si chirurgie majeure",
        'Cardiopatia: risco de evento cardiaco perioperatorio, monitorizar troponina em cirurgia major',
        'Cardiac disease: perioperative cardiac event risk, monitor troponin for major surgery',
      ),
    );
  }
  redFlags.push(
    l(
      'En cas de doute: appeler le sénior / MAR de garde',
      'Em caso de duvida: chamar o senior / anestesista de prevencao',
      'If in doubt: call the senior anesthesiologist on duty',
    ),
  );

  return { preop, intraop, postop, redFlags };
}
