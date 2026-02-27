import { z } from 'zod';

// ── Sub-schemas ────────────────────────────────────────────────────────────────

const DrugRefSchema = z.object({
  drug_id: z.string(),
  indication_tag: z.string(),
});

const ProcedureQuickFrSchema = z.object({
  preop:     z.array(z.string()).default([]),
  intraop:   z.array(z.string()).default([]),
  postop:    z.array(z.string()).default([]),
  red_flags: z.array(z.string()).default([]),
  drugs:     z.array(DrugRefSchema).default([]),
});

const DoseRuleSchema = z.object({
  indication_tag: z.string(),
  route:          z.string(),
  mg_per_kg:      z.number().nullable(),
  max_mg:         z.number().nullable(),
  notes:          z.array(z.string()).default([]),
  unit_override:  z.string().optional(),
  dose_scalar:    z.enum(['TBW', 'IBW', 'LBW', 'AdjBW', 'TITRATE']).optional(),
});

const ConcentrationSchema = z.object({
  label:     z.string(),
  mg_per_ml: z.number().nullable(),
});

// ── Top-level entity schemas ───────────────────────────────────────────────────

export const ProcedureSchema = z
  .object({
    id:       z.string(),
    specialty: z.string(),
    titles:   z.object({ fr: z.string() }).passthrough(),
    quick:    z.object({ fr: ProcedureQuickFrSchema }).passthrough(),
  })
  .passthrough();

export const DrugSchema = z
  .object({
    id:             z.string(),
    name:           z.object({ fr: z.string() }).passthrough(),
    dose_rules:     z.array(DoseRuleSchema).optional().default([]),
    concentrations: z.array(ConcentrationSchema).optional().default([]),
  })
  .passthrough();

export const GuidelineSchema = z
  .object({
    id:          z.string(),
    category:    z.string(),
    titles:      z.object({ fr: z.string() }).passthrough(),
    items:       z.object({ fr: z.array(z.string()) }).passthrough(),
    tags:        z.array(z.string()).optional().default([]),
    specialties: z.array(z.string()).optional().default([]),
  })
  .passthrough();

export const ProtocoleSchema = z
  .object({
    id:       z.string(),
    category: z.string(),
    titles:   z.object({ fr: z.string() }).passthrough(),
    steps:    z.object({ fr: z.array(z.string()) }).passthrough(),
    tags:     z.array(z.string()).optional().default([]),
  })
  .passthrough();

export const ALRBlockSchema = z
  .object({
    id:     z.string(),
    region: z.string(),
    titles: z.object({ fr: z.string() }).passthrough(),
    tags:   z.array(z.string()).optional().default([]),
  })
  .passthrough();

// ── Validation helper ──────────────────────────────────────────────────────────

export function validateArray<T>(data: unknown, schema: z.ZodType, label: string): T[] {
  if (!Array.isArray(data)) {
    console.warn(`[AnesIA] ${label}: expected array, got ${typeof data}`);
    return [];
  }
  const valid: T[] = [];
  data.forEach((item, i) => {
    const result = schema.safeParse(item);
    if (result.success) valid.push(item as T);
    else console.warn(`[AnesIA] ${label}[${i}] invalid, skipping:`, result.error.issues);
  });
  return valid;
}
