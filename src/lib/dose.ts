import type { DoseRule, Concentration } from './types';
import type { PatientWeights, DoseScalar } from './weightScalars';
import { getScaledWeight } from './weightScalars';

export interface DoseResult {
  canCalc: boolean;
  doseMgRaw: number | null;
  doseMgFinal: number | null;
  volumeMl: number | null;
  reasonIfNoCalc: string | null;
  scalarUsed: DoseScalar | null;
  weightUsed: number | null;
}

export function calculateDose(
  rule: DoseRule,
  weightKg: number | null,
  selectedConcentration: Concentration | null,
  options?: {
    doseDecimals?: number;
    volumeDecimals?: number;
    patientWeights?: PatientWeights;
  },
): DoseResult {
  const doseDecimals = options?.doseDecimals ?? 1;
  const volumeDecimals = options?.volumeDecimals ?? 1;

  const empty: Pick<
    DoseResult,
    'doseMgRaw' | 'doseMgFinal' | 'volumeMl' | 'scalarUsed' | 'weightUsed'
  > = {
    doseMgRaw: null,
    doseMgFinal: null,
    volumeMl: null,
    scalarUsed: null,
    weightUsed: null,
  };

  // mg_per_kg is null → protocol local
  if (rule.mg_per_kg === null) {
    return { canCalc: false, ...empty, reasonIfNoCalc: 'protocol_local' };
  }

  // No weight provided
  if (!weightKg || weightKg <= 0) {
    return { canCalc: false, ...empty, reasonIfNoCalc: 'enter_weight' };
  }

  // Determine which weight to use based on scalar
  let effectiveWeight = weightKg;
  let scalarUsed: DoseScalar = 'TBW';

  if (options?.patientWeights) {
    const scaled = getScaledWeight(rule.dose_scalar, options.patientWeights);
    effectiveWeight = scaled.weight;
    scalarUsed = scaled.scalarUsed;
  }

  const doseMgRaw = rule.mg_per_kg * effectiveWeight;
  const doseMgFinal = rule.max_mg !== null ? Math.min(doseMgRaw, rule.max_mg) : doseMgRaw;

  let volumeMl: number | null = null;
  if (
    selectedConcentration &&
    selectedConcentration.mg_per_ml !== null &&
    selectedConcentration.mg_per_ml > 0
  ) {
    volumeMl = doseMgFinal / selectedConcentration.mg_per_ml;
  }

  const round = (v: number, d: number) => {
    const factor = Math.pow(10, d);
    return Math.round(v * factor) / factor;
  };

  return {
    canCalc: true,
    doseMgRaw: round(doseMgRaw, doseDecimals),
    doseMgFinal: round(doseMgFinal, doseDecimals),
    volumeMl: volumeMl !== null ? round(volumeMl, volumeDecimals) : null,
    reasonIfNoCalc: null,
    scalarUsed,
    weightUsed: round(effectiveWeight, 1),
  };
}
