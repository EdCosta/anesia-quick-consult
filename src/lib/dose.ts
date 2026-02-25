import type { DoseRule, Concentration } from './types';

export interface DoseResult {
  canCalc: boolean;
  doseMgRaw: number | null;
  doseMgFinal: number | null;
  volumeMl: number | null;
  reasonIfNoCalc: string | null;
}

export function calculateDose(
  rule: DoseRule,
  weightKg: number | null,
  selectedConcentration: Concentration | null,
  options?: { doseDecimals?: number; volumeDecimals?: number }
): DoseResult {
  const doseDecimals = options?.doseDecimals ?? 1;
  const volumeDecimals = options?.volumeDecimals ?? 1;

  // mg_per_kg is null → protocol local
  if (rule.mg_per_kg === null) {
    return {
      canCalc: false,
      doseMgRaw: null,
      doseMgFinal: null,
      volumeMl: null,
      reasonIfNoCalc: 'protocol_local',
    };
  }

  // No weight provided
  if (!weightKg || weightKg <= 0) {
    return {
      canCalc: false,
      doseMgRaw: null,
      doseMgFinal: null,
      volumeMl: null,
      reasonIfNoCalc: 'enter_weight',
    };
  }

  const doseMgRaw = rule.mg_per_kg * weightKg;
  const doseMgFinal =
    rule.max_mg !== null ? Math.min(doseMgRaw, rule.max_mg) : doseMgRaw;

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
  };
}
