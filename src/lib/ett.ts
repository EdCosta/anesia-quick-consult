export interface ETTInput {
  ageYears?: number | null;
  ageMonths?: number | null;
  weightKg?: number | null;
  heightCm?: number | null;
  sex?: 'male' | 'female' | null;
}

export interface ETTResult {
  category: 'neonate' | 'pediatric' | 'adult';
  ettCuffed: number;
  ettUncuffed: number | null;
  ettRange: string;
  oralDepthCm: number;
  nasalDepthCm: number;
  bladeSuggestion: string;
  lmaSize: string;
  notes: string[];
}

// Neonatal/infant lookup table
const NEONATE_TABLE: {
  label: string;
  weightRange: string;
  ettCuffed: number;
  ettUncuffed: number;
  depthCm: number;
  blade: string;
  lma: string;
}[] = [
  { label: 'Premature (<2.5 kg)', weightRange: '<2.5', ettCuffed: 2.5, ettUncuffed: 3.0, depthCm: 7, blade: 'Miller 0', lma: '1' },
  { label: 'Term (2.5–3.5 kg)', weightRange: '2.5–3.5', ettCuffed: 3.0, ettUncuffed: 3.5, depthCm: 9, blade: 'Miller 0–1', lma: '1' },
  { label: '3–4 kg', weightRange: '3–4', ettCuffed: 3.0, ettUncuffed: 3.5, depthCm: 9.5, blade: 'Miller 1', lma: '1' },
  { label: '5–8 kg', weightRange: '5–8', ettCuffed: 3.5, ettUncuffed: 4.0, depthCm: 10.5, blade: 'Miller 1 / Mac 1', lma: '1.5' },
  { label: '8–10 kg', weightRange: '8–10', ettCuffed: 3.5, ettUncuffed: 4.0, depthCm: 12, blade: 'Mac 1', lma: '1.5–2' },
];

export function getNeonateTable() {
  return NEONATE_TABLE;
}

export function calculateETT(input: ETTInput): ETTResult | null {
  const { ageYears, ageMonths, weightKg, heightCm, sex } = input;

  const totalAgeYears = (ageYears ?? 0) + (ageMonths ?? 0) / 12;
  const hasAge = (ageYears != null && ageYears > 0) || (ageMonths != null && ageMonths > 0);

  // Determine category
  if (hasAge && totalAgeYears < 1) {
    // Neonate/infant — use table lookup by weight
    const w = weightKg ?? 3.5;
    let row = NEONATE_TABLE[1]; // default term
    if (w < 2.5) row = NEONATE_TABLE[0];
    else if (w < 3.5) row = NEONATE_TABLE[1];
    else if (w < 5) row = NEONATE_TABLE[2];
    else if (w < 8) row = NEONATE_TABLE[3];
    else row = NEONATE_TABLE[4];

    return {
      category: 'neonate',
      ettCuffed: row.ettCuffed,
      ettUncuffed: row.ettUncuffed,
      ettRange: `${row.ettCuffed}–${row.ettUncuffed}`,
      oralDepthCm: row.depthCm,
      nasalDepthCm: round(row.depthCm + 2.5),
      bladeSuggestion: row.blade,
      lmaSize: row.lma,
      notes: [],
    };
  }

  if (hasAge && totalAgeYears >= 1 && totalAgeYears < 16) {
    // Pediatric
    const age = totalAgeYears;
    let ettCuffed = round(age / 4 + 3.5);
    let ettUncuffed = round(age / 4 + 4.0);
    const depthOral = round(3 * ettCuffed);
    const depthOralAlt = round(age / 2 + 12);
    const oralDepth = Math.min(depthOral, depthOralAlt); // use lower as safety

    // Weight/height adjustment
    const notes: string[] = [];
    if (weightKg != null) {
      // Very rough: expected weight ≈ 2*(age+4) for 1-5y, 3*age+7 for 6-12y
      const expectedW = age <= 5 ? 2 * (age + 4) : 3 * age + 7;
      if (weightKg < expectedW * 0.75) {
        ettCuffed = round(ettCuffed - 0.5);
        ettUncuffed = round(ettUncuffed - 0.5);
        notes.push('adjust_small_child');
      } else if (weightKg > expectedW * 1.3) {
        ettCuffed = round(ettCuffed + 0.5);
        ettUncuffed = round(ettUncuffed + 0.5);
        notes.push('adjust_large_child');
      }
    }

    // Blade
    let blade = 'Mac 2';
    if (age < 2) blade = 'Miller 1';
    else if (age < 6) blade = 'Miller 2 / Mac 2';
    else if (age < 10) blade = 'Mac 2';
    else blade = 'Mac 3';

    // LMA
    let lma = '2';
    if (weightKg != null) {
      if (weightKg < 10) lma = '1.5';
      else if (weightKg < 20) lma = '2';
      else if (weightKg < 30) lma = '2.5';
      else lma = '3';
    }

    return {
      category: 'pediatric',
      ettCuffed,
      ettUncuffed,
      ettRange: `${ettCuffed}–${ettUncuffed}`,
      oralDepthCm: oralDepth,
      nasalDepthCm: round(oralDepth + 2.5),
      bladeSuggestion: blade,
      lmaSize: lma,
      notes,
    };
  }

  // Adult — use sex + height
  if (sex || heightCm) {
    const isMale = sex === 'male';
    const h = heightCm ?? (isMale ? 175 : 165);

    let ett: number;
    let depth: number;

    if (isMale || sex == null) {
      // Male defaults
      ett = 8.0;
      depth = 23;
      if (h < 160) { ett = 7.5; depth = 22; }
      else if (h < 170) { ett = 7.5; depth = 22; }
      else if (h >= 185) { ett = 8.5; depth = 24; }
    } else {
      // Female
      ett = 7.0;
      depth = 21;
      if (h < 155) { ett = 6.5; depth = 20; }
      else if (h >= 170) { ett = 7.5; depth = 22; }
    }

    const notes: string[] = [];
    // Blade: Mac 3 for women, Mac 3-4 for men
    const blade = isMale ? 'Mac 3–4' : 'Mac 3';
    // LMA
    const lma = isMale ? '4–5' : '3–4';

    return {
      category: 'adult',
      ettCuffed: ett,
      ettUncuffed: null,
      ettRange: `${ett} (± 0.5)`,
      oralDepthCm: depth,
      nasalDepthCm: round(depth + 2),
      bladeSuggestion: blade,
      lmaSize: lma,
      notes,
    };
  }

  return null;
}

function round(v: number): number {
  return Math.round(v * 10) / 10;
}
