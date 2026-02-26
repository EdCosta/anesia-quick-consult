// Clinical score calculators — pure functions, no dependencies

export interface ScoreResult {
  score: number;
  category: string;
  details: string;
}

// ─── STOP-BANG (OSA screening) ───
export interface STOPBANGInputs {
  snore: boolean;
  tired: boolean;
  observed: boolean;
  pressure: boolean;
  bmiOver35: boolean;
  ageOver50: boolean;
  neckOver40: boolean;
  male: boolean;
}

export function calcSTOPBANG(i: STOPBANGInputs): ScoreResult {
  const score = [i.snore, i.tired, i.observed, i.pressure, i.bmiOver35, i.ageOver50, i.neckOver40, i.male]
    .filter(Boolean).length;
  const category = score <= 2 ? 'low' : score <= 4 ? 'moderate' : 'high';
  return { score, category, details: `${score}/8` };
}

// ─── RCRI / Lee (cardiac risk) ───
export interface RCRIInputs {
  highRiskSurgery: boolean;
  ischemicHeart: boolean;
  congestiveHeart: boolean;
  cerebrovascular: boolean;
  insulinTherapy: boolean;
  creatinineElevated: boolean;
}

const RCRI_RISK: Record<number, string> = {
  0: '3.9%', 1: '6.0%', 2: '10.1%', 3: '15%', 4: '15%', 5: '15%', 6: '15%',
};

export function calcRCRI(i: RCRIInputs): ScoreResult {
  const score = [i.highRiskSurgery, i.ischemicHeart, i.congestiveHeart, i.cerebrovascular, i.insulinTherapy, i.creatinineElevated]
    .filter(Boolean).length;
  const category = score === 0 ? 'low' : score <= 2 ? 'moderate' : 'high';
  return { score, category, details: `MACE risk ≈ ${RCRI_RISK[score] || '>15%'}` };
}

// ─── Apfel (PONV) ───
export interface ApfelInputs {
  femaleGender: boolean;
  nonSmoker: boolean;
  ponvHistory: boolean;
  postopOpioids: boolean;
}

const APFEL_RISK: Record<number, string> = { 0: '10%', 1: '21%', 2: '39%', 3: '61%', 4: '79%' };

export function calcApfel(i: ApfelInputs): ScoreResult {
  const score = [i.femaleGender, i.nonSmoker, i.ponvHistory, i.postopOpioids]
    .filter(Boolean).length;
  const category = score <= 1 ? 'low' : score === 2 ? 'moderate' : 'high';
  return { score, category, details: `PONV risk ≈ ${APFEL_RISK[score]}` };
}

// ─── Caprini (VTE risk) ───
export interface CapriniInputs {
  // 1-point factors
  age41to60: boolean;
  minorSurgery: boolean;
  bmiOver25: boolean;
  swollenLegs: boolean;
  varicoseVeins: boolean;
  pregnancy: boolean;
  historyUnexplainedStillbirth: boolean;
  oralContraceptives: boolean;
  sepsis: boolean;
  seriousLungDisease: boolean;
  abnormalPulmonaryFunction: boolean;
  acuteMI: boolean;
  chf: boolean;
  medicalPatientBedRest: boolean;
  ibd: boolean;
  // 2-point factors
  age61to74: boolean;
  majorSurgery: boolean;
  arthroscopy: boolean;
  malignancy: boolean;
  laparoscopy: boolean;
  bedRestOver72h: boolean;
  immobilizingCast: boolean;
  centralVenousAccess: boolean;
  // 3-point factors
  ageOver75: boolean;
  historyDVTPE: boolean;
  familyHistoryThrombosis: boolean;
  factorVLeiden: boolean;
  prothrombinMutation: boolean;
  lupusAnticoagulant: boolean;
  anticardiolipinAntibodies: boolean;
  homocysteine: boolean;
  heparinInducedThrombocytopenia: boolean;
  otherThrombophilia: boolean;
  // 5-point factors
  stroke: boolean;
  elHipKneeFx: boolean;
  multipleTrauma: boolean;
  acuteSpinalCordInjury: boolean;
}

export function calcCaprini(i: CapriniInputs): ScoreResult {
  const pts1 = [i.age41to60, i.minorSurgery, i.bmiOver25, i.swollenLegs, i.varicoseVeins, i.pregnancy, i.historyUnexplainedStillbirth, i.oralContraceptives, i.sepsis, i.seriousLungDisease, i.abnormalPulmonaryFunction, i.acuteMI, i.chf, i.medicalPatientBedRest, i.ibd].filter(Boolean).length;
  const pts2 = [i.age61to74, i.majorSurgery, i.arthroscopy, i.malignancy, i.laparoscopy, i.bedRestOver72h, i.immobilizingCast, i.centralVenousAccess].filter(Boolean).length * 2;
  const pts3 = [i.ageOver75, i.historyDVTPE, i.familyHistoryThrombosis, i.factorVLeiden, i.prothrombinMutation, i.lupusAnticoagulant, i.anticardiolipinAntibodies, i.homocysteine, i.heparinInducedThrombocytopenia, i.otherThrombophilia].filter(Boolean).length * 3;
  const pts5 = [i.stroke, i.elHipKneeFx, i.multipleTrauma, i.acuteSpinalCordInjury].filter(Boolean).length * 5;
  const score = pts1 + pts2 + pts3 + pts5;
  const category = score <= 1 ? 'low' : score === 2 ? 'moderate' : score <= 4 ? 'high' : 'very_high';
  return { score, category, details: `Total: ${score}` };
}
