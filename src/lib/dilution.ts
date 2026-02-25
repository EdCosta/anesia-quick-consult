export interface DilutionInput {
  stockConcentration_mg_per_ml: number;
  targetConcentration_mg_per_ml?: number;
  finalVolume_ml?: number;
  syringeVolume_ml?: number;
  desiredDose_mg?: number;
}

export interface DilutionResult {
  volumeDrug_ml: number | null;
  volumeDiluent_ml: number | null;
  finalConcentration_mg_per_ml: number | null;
  warnings: string[];
}

export function calculateDilution(input: DilutionInput): DilutionResult {
  const warnings: string[] = [];
  const stock = input.stockConcentration_mg_per_ml;

  if (!stock || stock <= 0) {
    return {
      volumeDrug_ml: null,
      volumeDiluent_ml: null,
      finalConcentration_mg_per_ml: null,
      warnings: ['warning_invalid_stock'],
    };
  }

  // Determine final volume
  let finalVol = input.finalVolume_ml ?? input.syringeVolume_ml ?? null;

  if (!finalVol || finalVol <= 0) {
    return {
      volumeDrug_ml: null,
      volumeDiluent_ml: null,
      finalConcentration_mg_per_ml: null,
      warnings: ['warning_no_volume'],
    };
  }

  // Determine target concentration
  let targetConc = input.targetConcentration_mg_per_ml ?? null;

  // Case B: desired dose + final volume → derive target concentration
  if (targetConc === null && input.desiredDose_mg && input.desiredDose_mg > 0) {
    targetConc = input.desiredDose_mg / finalVol;
  }

  if (targetConc === null || targetConc <= 0) {
    return {
      volumeDrug_ml: null,
      volumeDiluent_ml: null,
      finalConcentration_mg_per_ml: null,
      warnings: ['warning_no_target'],
    };
  }

  if (targetConc > stock) {
    warnings.push('warning_target_exceeds_stock');
    return {
      volumeDrug_ml: null,
      volumeDiluent_ml: null,
      finalConcentration_mg_per_ml: null,
      warnings,
    };
  }

  // Case A: volumeDrug = (targetConc * finalVol) / stockConc
  const volumeDrug = (targetConc * finalVol) / stock;
  const volumeDiluent = finalVol - volumeDrug;

  const round2 = (v: number) => Math.round(v * 100) / 100;

  if (volumeDrug > finalVol) {
    warnings.push('warning_drug_exceeds_volume');
  }

  if (volumeDiluent < 0) {
    warnings.push('warning_negative_diluent');
  }

  if (
    input.syringeVolume_ml &&
    input.finalVolume_ml &&
    input.finalVolume_ml > input.syringeVolume_ml
  ) {
    warnings.push('warning_exceeds_syringe');
  }

  return {
    volumeDrug_ml: round2(volumeDrug),
    volumeDiluent_ml: round2(Math.max(0, volumeDiluent)),
    finalConcentration_mg_per_ml: round2(targetConc),
    warnings,
  };
}
