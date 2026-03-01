import { z } from 'zod';

export type GuidelineImportPreviewRow = {
  id: string;
  category: string;
  titles: Record<string, string>;
  warnings: string[];
  rowIndex: number;
};

export type GuidelineImportParseResult = {
  rows: GuidelineImportPreviewRow[];
  errors: string[];
};

export const guidelineImportResponseSchema = z.object({
  inserted: z.number().int().nonnegative(),
  updated: z.number().int().nonnegative(),
  errors: z.array(z.string()),
  total_errors: z.number().int().nonnegative().optional(),
});

export type GuidelineImportResponse = z.infer<typeof guidelineImportResponseSchema>;

export function parseGuidelineImportJson(jsonText: string): GuidelineImportParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    return { rows: [], errors: [`Invalid JSON: ${(e as Error).message}`] };
  }

  if (!Array.isArray(parsed)) {
    return { rows: [], errors: ['JSON root must be an array of guideline objects'] };
  }

  const rows: GuidelineImportPreviewRow[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i] as Record<string, unknown>;
    const rowIndex = i + 1;

    const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : null;
    if (!id) {
      errors.push(`Item ${rowIndex}: missing required field "id"`);
      continue;
    }

    const category =
      typeof item.category === 'string' && item.category.trim() ? item.category.trim() : null;
    if (!category) {
      errors.push(`Item ${rowIndex} (${id}): missing required field "category"`);
      continue;
    }

    const titles = (item.titles ?? {}) as Record<string, unknown>;
    if (!titles.fr || typeof titles.fr !== 'string') {
      errors.push(`Item ${rowIndex} (${id}): titles.fr is required`);
      continue;
    }

    const warnings: string[] = [];
    if (!titles.en) warnings.push('Missing titles.en');
    if (!titles.pt) warnings.push('Missing titles.pt');

    // Support `references` alias for `refs`
    const itemsField = item.items ?? {};
    const refsField = item.refs ?? item.references;
    const itemsFr = (itemsField as Record<string, unknown>).fr;
    if (!Array.isArray(itemsFr) || itemsFr.length === 0) warnings.push('Missing items.fr');
    if (!(itemsField as Record<string, unknown>).en) warnings.push('Missing items.en');
    if (!(itemsField as Record<string, unknown>).pt) warnings.push('Missing items.pt');
    if (!Array.isArray(refsField) || refsField.length === 0) warnings.push('No refs/references');

    if (seen.has(id)) warnings.push('Duplicate id — last entry wins');
    seen.add(id);

    // Replace previous entry for duplicate id
    const existingIndex = rows.findIndex((r) => r.id === id);
    const row: GuidelineImportPreviewRow = {
      id,
      category,
      titles: titles as Record<string, string>,
      warnings,
      rowIndex,
    };
    if (existingIndex >= 0) {
      rows[existingIndex] = row;
    } else {
      rows.push(row);
    }
  }

  return { rows, errors };
}
