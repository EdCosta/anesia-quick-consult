/**
 * Unified dosing engine — single source of truth for dose calculations.
 * Re-exports core functions and adds explanation helpers.
 */
export { calculateDose } from './dose';
export type { DoseResult } from './dose';
export {
  computeWeights,
  getScaledWeight,
  calcBMI,
  calcIBW,
  calcLBW,
  calcAdjBW,
} from './weightScalars';
export type { PatientWeights, DoseScalar, Sex } from './weightScalars';

import type { DoseResult } from './dose';
import type { DoseScalar } from './weightScalars';

/** Human-readable explanation of a dose calculation */
export function explainDose(
  result: DoseResult,
  mgPerKg: number | null,
  t: (key: string) => string,
): string {
  if (!result.canCalc) {
    return result.reasonIfNoCalc === 'protocol_local' ? t('protocol_local') : t('enter_weight');
  }

  const parts: string[] = [];

  if (result.scalarUsed && result.scalarUsed !== 'TBW') {
    parts.push(`${t('scalar_used')}: ${result.scalarUsed}`);
  }

  if (result.weightUsed) {
    parts.push(`${t('weight_kg')}: ${result.weightUsed} kg`);
  }

  if (mgPerKg !== null) {
    parts.push(`${mgPerKg} mg/kg × ${result.weightUsed} kg = ${result.doseMgRaw} mg`);
  }

  if (
    result.doseMgFinal !== null &&
    result.doseMgRaw !== null &&
    result.doseMgFinal < result.doseMgRaw
  ) {
    parts.push(`${t('max_dose')}: ${result.doseMgFinal} mg`);
  }

  parts.push(t('validate_clinically'));

  return parts.join('\n');
}

/** Format dose for display */
export function formatDose(value: number | null, decimals = 1): string {
  if (value === null) return '—';
  const factor = Math.pow(10, decimals);
  return String(Math.round(value * factor) / factor);
}
