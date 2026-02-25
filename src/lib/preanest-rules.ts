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

export function generateRecommendations(input: PreAnestInput): PreAnestOutput {
  const preop: string[] = [];
  const intraop: string[] = [];
  const postop: string[] = [];
  const redFlags: string[] = [];

  const bmi = input.weight / ((input.height / 100) ** 2);
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
  preop.push('Bilan standard: NFS, ionogramme, créatinine, coagulation');
  if (input.asa >= 3) {
    preop.push('ASA ≥ 3: évaluation approfondie, considérer consultation spécialisée');
    preop.push('ECG et évaluation capacité fonctionnelle');
  }
  if (hasCardiopathy || isElderly) {
    preop.push('Bilan cardiaque: ECG, écho si symptômes, capacité fonctionnelle < 4 METs');
  }
  if (hasRenalFailure) {
    preop.push('Bilan rénal: créatinine, DFG, ionogramme, adapter posologies');
  }
  if (hasDiabetes) {
    preop.push('Glycémie à jeun, HbA1c si non récente, protocole insuline péri-opératoire');
  }
  if (hasRespiratory) {
    preop.push('EFR si non récentes, optimiser traitement bronchodilatateur');
  }
  if (input.anticoagulation !== 'none' && input.anticoagulation) {
    const anticoagMap: Record<string, string> = {
      aspirin: 'Aspirine: maintenir en général, sauf neurochirurgie',
      clopidogrel: 'Clopidogrel: arrêt 5-7 jours avant si possible',
      doac: 'AOD: arrêt 48-72h avant (selon DFG et molécule)',
      avk: 'AVK: relais HBPM, INR cible < 1.5 le jour de la chirurgie',
      lmwh: 'HBPM: dernière dose 12-24h avant selon dose curative/préventive',
      dual_antiplatelet: 'Double anti-agrégation: discussion multidisciplinaire obligatoire',
    };
    if (anticoagMap[input.anticoagulation]) {
      preop.push(anticoagMap[input.anticoagulation]);
    }
  }
  if (isEmergency) {
    preop.push('URGENCE: estomac plein présumé → ISR obligatoire');
    preop.push('Préoxygénation 3 min O2 pur ou 8 respirations capacité vitale');
  } else {
    preop.push('Jeûne: 6h solides, 2h liquides clairs');
  }
  if (input.allergies.trim()) {
    preop.push(`Allergies déclarées: ${input.allergies} — vérifier alternatives`);
  }

  // === INTRA-OP ===
  // Airway
  const vad = input.mallampati >= 3 || input.mouthOpening === 'limited' || input.cervicalMobility === 'limited' || isObese;
  if (vad) {
    intraop.push('VAD probable: préparer vidéo-laryngoscope, masque laryngé, algorithme CICO');
  }
  if (isObese) {
    intraop.push('Obésité: positionnement rampe/HELP, doses sur poids idéal (propofol: poids ajusté)');
    intraop.push('Considérer IOT cuffée de taille adaptée, pression de cuff < 25 cmH2O');
  }
  if (hasSAOS) {
    intraop.push('SAOS: risque VAD augmenté, tube armé à considérer');
    intraop.push('Limiter opioïdes, favoriser analgésie multimodale et ALR');
  }
  if (isEmergency) {
    intraop.push('ISR: propofol 2 mg/kg + rocuronium 1.2 mg/kg (sugammadex 16 mg/kg prêt)');
  }
  intraop.push('Antibioprophylaxie: céfazoline 2g IV avant incision (adapter si allergie)');
  intraop.push('Maintien normothermie active (objectif ≥ 36°C)');
  intraop.push('Monitorage standard: ECG, SpO2, ETCO2, PA, température');
  if (input.asa >= 3 || hasCardiopathy) {
    intraop.push('Considérer monitorage invasif (PA invasive) si chirurgie majeure');
  }

  // === POST-OP ===
  postop.push('Analgésie multimodale: paracétamol 1g/6h ± AINS (si pas de CI)');
  if (hasSAOS || isObese) {
    postop.push('SAOS/Obésité: surveillance SSPI prolongée, oxymétrie continue, position semi-assise');
    postop.push('Éviter/limiter morphine, privilégier kétamine sub-anesthésique et ALR');
  }
  postop.push('Prévention NVPO: score d\'Apfel, ondansétron ± dexaméthasone selon risque');
  postop.push('Thromboprophylaxie: HBPM dose préventive dès H6 (sauf CI hémorragique)');
  if (isAmbulatory) {
    postop.push('Critères de sortie ambulatoire: EVA < 4, pas de NVPO, miction, déambulation stable');
    postop.push('Consignes écrites: quand consulter en urgence, analgésie domicile');
  }
  if (isElderly) {
    postop.push('Patient âgé: dépistage confusion postop, mobilisation précoce');
  }
  if (hasRenalFailure) {
    postop.push('IRC: adapter posologies analgésiques, éviter AINS, surveiller diurèse');
  }

  // === RED FLAGS ===
  if (vad) {
    redFlags.push('VAD identifiée: algorithme can\'t intubate can\'t ventilate → cricothyroïdotomie');
  }
  if (input.asa >= 4) {
    redFlags.push('ASA IV-V: risque vital élevé, réanimation en stand-by');
  }
  if (isEmergency) {
    redFlags.push('Urgence + estomac plein: risque majeur d\'inhalation bronchique');
  }
  if (hasSAOS && isObese) {
    redFlags.push('SAOS + Obésité: risque combiné VAD + dépression respiratoire postop');
  }
  if (input.anticoagulation === 'dual_antiplatelet') {
    redFlags.push('Double anti-agrégation: risque hémorragique majeur, discuter report si possible');
  }
  if (hasCardiopathy) {
    redFlags.push('Cardiopathie: risque d\'événement cardiaque péri-opératoire, monitorer troponine si chirurgie majeure');
  }
  redFlags.push('En cas de doute: appeler le sénior / MAR de garde');

  return { preop, intraop, postop, redFlags };
}
