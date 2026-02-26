export type DoseScalar = 'TBW' | 'IBW' | 'LBW' | 'AdjBW' | 'TITRATE';
export type Sex = 'M' | 'F';

export interface PatientWeights {
  tbw: number;
  ibw: number | null;
  lbw: number | null;
  adjbw: number | null;
  bmi: number | null;
}

/** BMI = weight / (height_m)^2 */
export function calcBMI(heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const hm = heightCm / 100;
  return weightKg / (hm * hm);
}

/** Ideal Body Weight — Devine formula */
export function calcIBW(sex: Sex, heightCm: number): number {
  if (heightCm <= 0) return 0;
  return sex === 'M'
    ? 50 + 0.9 * (heightCm - 152)
    : 45.5 + 0.9 * (heightCm - 152);
}

/** Lean Body Weight — Janmahasatian formula */
export function calcLBW(sex: Sex, heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const bmi = calcBMI(heightCm, weightKg);
  if (sex === 'M') {
    return (9270 * weightKg) / (6680 + 216 * bmi);
  }
  return (9270 * weightKg) / (8780 + 244 * bmi);
}

/** Adjusted Body Weight = IBW + factor * (TBW - IBW) */
export function calcAdjBW(ibw: number, tbw: number, factor = 0.4): number {
  return ibw + factor * (tbw - ibw);
}

/** Compute all patient weights from inputs */
export function computeWeights(
  sex: Sex | null,
  heightCm: number | null,
  weightKg: number
): PatientWeights {
  const tbw = weightKg;
  if (!sex || !heightCm || heightCm <= 0) {
    return { tbw, ibw: null, lbw: null, adjbw: null, bmi: null };
  }
  const bmi = calcBMI(heightCm, tbw);
  const ibw = calcIBW(sex, heightCm);
  const lbw = calcLBW(sex, heightCm, tbw);
  const adjbw = calcAdjBW(ibw, tbw);
  return { tbw, ibw, lbw, adjbw, bmi };
}

/** Get the weight value for a given scalar */
export function getScaledWeight(
  scalar: DoseScalar | undefined,
  weights: PatientWeights
): { weight: number; scalarUsed: DoseScalar } {
  if (!scalar || scalar === 'TBW') {
    return { weight: weights.tbw, scalarUsed: 'TBW' };
  }
  if (scalar === 'TITRATE') {
    // Use LBW as starting point for titration, fallback to TBW
    return { weight: weights.lbw ?? weights.tbw, scalarUsed: 'TITRATE' };
  }
  const map: Record<string, number | null> = {
    IBW: weights.ibw,
    LBW: weights.lbw,
    AdjBW: weights.adjbw,
  };
  const val = map[scalar];
  if (val !== null && val !== undefined && val > 0) {
    return { weight: val, scalarUsed: scalar };
  }
  // Fallback to TBW if advanced weights not available
  return { weight: weights.tbw, scalarUsed: 'TBW' };
}
