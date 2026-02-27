import { z } from 'zod';

export type ProcedureImportPreviewRow = {
  id: string;
  specialty: string;
  titles: Record<string, unknown>;
  synonyms: Record<string, unknown>;
  content: Record<string, unknown>;
  tags: unknown[];
  warnings: string[];
  lineNumber: number;
};

export type ProcedureImportParseResult = {
  rows: ProcedureImportPreviewRow[];
  errors: string[];
};

export type ProcedureImportResponse = {
  inserted: number;
  updated: number;
  errors: string[];
  total_errors?: number;
};

const rowSchema = z.object({
  id: z.string().trim().min(1, 'id is required'),
  specialty: z.string().trim().min(1, 'specialty is required'),
  titles: z.record(z.unknown()),
  synonyms: z.record(z.unknown()),
  content: z.record(z.unknown()),
  tags: z.array(z.unknown()),
  warnings: z.array(z.string()),
  lineNumber: z.number().int().positive(),
});

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ';' && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields;
}

function parseJsonField<T extends Record<string, unknown> | unknown[]>(
  value: string,
  fallback: T,
  fieldName: string,
  lineNumber: number,
): T {
  if (!value.trim()) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(fallback)) {
      if (!Array.isArray(parsed)) {
        throw new Error(`${fieldName} must be a JSON array`);
      }
      return parsed as T;
    }

    if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
      throw new Error(`${fieldName} must be a JSON object`);
    }

    return parsed as T;
  } catch (error) {
    throw new Error(`Line ${lineNumber}: invalid ${fieldName} JSON (${(error as Error).message})`);
  }
}

export function parseProcedureImportCsv(csvText: string): ProcedureImportParseResult {
  const cleaned = csvText
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  const lines = cleaned.split('\n').filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return {
      rows: [],
      errors: ['CSV must include a header and at least one data row'],
    };
  }

  const header = parseCSVLine(lines[0]).map((field) => field.trim().toLowerCase());
  const fieldIndex = (name: string) => header.indexOf(name);
  const hasJsonTitles = fieldIndex('titles') >= 0;
  const hasMultiLangTitles = fieldIndex('title_fr') >= 0;
  const errors: string[] = [];
  const rows: ProcedureImportPreviewRow[] = [];

  if (fieldIndex('id') < 0) {
    errors.push('Missing required column: id');
  }

  if (fieldIndex('specialty') < 0) {
    errors.push('Missing required column: specialty');
  }

  if (!hasJsonTitles && !hasMultiLangTitles) {
    errors.push('Missing required title columns: titles or title_fr');
  }

  if (errors.length > 0) {
    return { rows: [], errors };
  }

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const values = parseCSVLine(lines[lineIndex]);
    const lineNumber = lineIndex + 1;
    const warnings: string[] = [];
    const pick = (name: string) => {
      const index = fieldIndex(name);
      return index >= 0 && index < values.length ? values[index].trim() : '';
    };

    try {
      let titles: Record<string, unknown>;
      if (hasJsonTitles) {
        titles = parseJsonField<Record<string, unknown>>(pick('titles'), {}, 'titles', lineNumber);
      } else {
        const fr = pick('title_fr');
        const en = pick('title_en');
        const pt = pick('title_pt');

        if (!fr) {
          throw new Error(`Line ${lineNumber}: title_fr is required`);
        }

        titles = { fr };
        if (en) {
          titles.en = en;
        } else {
          warnings.push('Missing title_en');
        }
        if (pt) {
          titles.pt = pt;
        } else {
          warnings.push('Missing title_pt');
        }
      }

      const parsedRow = rowSchema.safeParse({
        id: pick('id'),
        specialty: pick('specialty'),
        titles,
        synonyms: parseJsonField<Record<string, unknown>>(
          pick('synonyms'),
          {},
          'synonyms',
          lineNumber,
        ),
        content: parseJsonField<Record<string, unknown>>(pick('content'), {}, 'content', lineNumber),
        tags: parseJsonField<unknown[]>(pick('tags'), [], 'tags', lineNumber),
        warnings,
        lineNumber,
      });

      if (!parsedRow.success) {
        const issueText = parsedRow.error.issues
          .map((issue) =>
            issue.path.length > 0 ? `${issue.path.join('.')}: ${issue.message}` : issue.message,
          )
          .join(', ');
        errors.push(`Line ${lineNumber}: ${issueText}`);
        continue;
      }

      if (
        parsedRow.data.content.quick &&
        !(parsedRow.data.content.quick as Record<string, unknown>).en
      ) {
        parsedRow.data.warnings.push('Missing content EN');
      }
      if (
        parsedRow.data.content.quick &&
        !(parsedRow.data.content.quick as Record<string, unknown>).pt
      ) {
        parsedRow.data.warnings.push('Missing content PT');
      }

      rows.push(parsedRow.data);
    } catch (error) {
      errors.push((error as Error).message);
    }
  }

  return { rows, errors };
}
